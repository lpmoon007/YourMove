// ITEM 9 — the Outcome Resolver. What does an attempted action produce?
//
// Deterministic given seed and state. NO MODEL CALL ANYWHERE IN THIS FILE — this is the
// single most important architectural constraint in the product (brief 9.2, stage 3).
//
// The DEFAULT path handles anything, including actions no author anticipated: capability
// versus opposition versus modifiers, resolved by a seeded draw into an outcome class.
// The OVERRIDE path exists for the handful of high-stakes beats where the designer must
// control the result. Overrides are exceptions, not the mechanism (L5) — if a scenario
// needs one per action, the scenario is written wrong.

import type { DiscoveryPath, ResolutionOverride, ScenarioPackage } from './package';
import { evalPred } from './predicate';
import type { CapabilityVerdict, Effect, Intent, KnowledgeStatus, OutcomeClass, Resolution } from './types';
import type { World } from './world';

export function resolve(world: World, intent: Intent, cap: CapabilityVerdict): Resolution {
  const override = matchOverride(world, intent);
  return override ? resolveOverride(world, intent, cap, override) : resolveDefault(world, intent, cap);
}

// ---------------------------------------------------------------------------
// the default path
// ---------------------------------------------------------------------------

function resolveDefault(world: World, intent: Intent, cap: CapabilityVerdict): Resolution {
  const pkg = world.pkg;
  const st = world.store.read();
  const verb = pkg.verbs.find((v) => v.id === intent.verb);
  const difficulty = pkg.difficulty[world.config.difficulty] ?? { opposition_multiplier: 1, cost_multiplier: 1 };

  // --- actor capability: what the player brings to this attempt ------------
  let capability = 0.5;
  const target = intent.targets[0] ?? null;
  if (target) {
    // information held about the target's business makes the attempt land harder
    const relevant = world.knowledge
      .factsFor(world.playerId)
      .filter(({ fact }) => pkg.facts.find((f) => f.id === fact)?.statement.includes('{value}') ?? true);
    capability += Math.min(0.2, relevant.length * 0.04);
    const trust = st.dispositions[target]?.trust ?? 0;
    capability += (trust / 100) * 0.25;
  }
  const committed = cap.commits.reduce((n, c) => n + c.amount, 0);
  const totalHeld = Object.values(st.resources).reduce((n, h) => n + (h[world.playerId] ?? 0), 0);
  if (committed > 0 && totalHeld > 0) capability += Math.min(0.2, (committed / totalHeld) * 0.25);
  if (intent.goal) capability += 0.03; // a stated purpose is a sharper attempt

  // --- opposition: what pushes back ----------------------------------------
  let opposition = 0.35 + (verb?.base_difficulty ?? 0.1);
  if (target) {
    const c = world.character(target);
    if (c) {
      opposition += c.competence * 0.2;
      const fear = st.dispositions[target]?.fear ?? 0;
      opposition += (fear / 100) * 0.15;
      if (c.reliability === 'deceptive' || c.reliability === 'evasive') opposition += 0.12;
    }
  }
  opposition *= difficulty.opposition_multiplier;

  // --- situational modifiers ------------------------------------------------
  const modifiers = -cap.uncertainty * 0.5 + (intent.secrecy === 'covert' ? -0.08 : 0);

  // --- the seeded draw (L11) ------------------------------------------------
  // The stream is named for the ATTEMPT, not just for the turn. Keying it on the turn
  // index alone gave every possible action on a given turn the same number, so an
  // unlucky seed failed whatever the player typed: on 40% of Late Edition's seeds every
  // opening move and every example action in the brief came back "nothing comes of it"
  // on turn one. Determinism is untouched — the same seed replaying the same actions
  // builds the same labels and draws the same numbers (L11).
  const drawKey = `resolve:${world.counters.turns + 1}:${intent.verb}:${[...intent.targets].sort().join(',')}`;
  const draw = world.rng.draw(drawKey);
  const margin = capability - opposition + modifiers + (draw - 0.5) * 0.5;

  let outcome: OutcomeClass;
  if (margin > 0.18) outcome = 'success';
  else if (margin > -0.02) outcome = 'partial';
  else outcome = 'failure';

  // Turn one cannot come back empty. Capability is at its floor on the first move —
  // the player holds nothing and nobody trusts them yet — so the front door was the
  // hardest turn in the game, and about half of every world's own example actions
  // answered the player's first sentence with "nothing comes of it, and the minute is
  // gone anyway". That is the screen that reads as broken. A first move still costs the
  // minute and still only earns a partial, so the world stays as unwilling as it was;
  // it just never answers the opening handover with nothing at all. Backfire is left
  // alone, because it is earned by a risk the player chose to take.
  if (outcome === 'failure' && world.counters.turns === 0) outcome = 'partial';

  // Backfire is EARNED by risk, never by novelty (item 9). It needs a bad margin AND a
  // real risk factor: a covert move, a cold room, or an attempt made against the clock.
  const risky =
    intent.secrecy === 'covert' ||
    cap.uncertainty >= 0.35 ||
    (target ? (st.dispositions[target]?.trust ?? 0) < -30 : false);
  if (margin < -0.3 && risky) outcome = 'backfire';

  const effects: Effect[] = [{ kind: 'clock', minutes: cap.minutes }, ...cap.cost];

  // resource commitments actually move
  for (const c of cap.commits)
    if (c.amount > 0) effects.push({ kind: 'resource', id: c.id, from: world.playerId, to: target ?? 'world', amount: c.amount });

  // per-verb authored defaults for this outcome class (the constraint layer)
  for (const e of verb?.effects_by_outcome?.[outcome] ?? []) effects.push(e);

  // relationship movement — the ordinary social physics of the attempt
  if (target && world.character(target)) {
    const trustDelta = outcome === 'success' ? 6 : outcome === 'partial' ? 2 : outcome === 'failure' ? -3 : -12;
    const fearDelta = outcome === 'backfire' ? 12 : intent.secrecy === 'covert' ? 4 : 0;
    effects.push({ kind: 'disposition', actor: target, axis: 'trust', delta: trustDelta });
    if (fearDelta) effects.push({ kind: 'disposition', actor: target, axis: 'fear', delta: fearDelta });
  }

  // Reveals become knowledge effects in item 10, where information propagation is decided.
  // Whether the player is going back over ground they already hold is a fact about the
  // world, not about the draw: the world cannot fail to notice you are reading a document
  // for the second time, so a bad roll withholds the REVEALS and nothing else. Skipping
  // the whole enquiry answered a re-read with "nothing comes of it, and the minute is
  // gone anyway", which reads as the world having lost track of what it already told you.
  const found = discoveries(world, intent, outcome);
  const reveals = outcome === 'failure' || outcome === 'backfire' ? [] : found.reveals;

  return {
    outcome,
    effects,
    uncertainty: cap.uncertainty,
    rule_path: `default:${intent.verb}`,
    draw,
    capability_score: round3(capability),
    opposition_score: round3(opposition),
    reveals,
    summary: defaultSummary(world, intent, outcome, reveals.length, found.repeated),
  };
}

/** Which authored discovery paths this action opens. Two independent paths per critical
 *  fact is an authoring rule (Part 4); which one the player walked is recorded. */
function discoveries(
  world: World,
  intent: Intent,
  outcome: OutcomeClass,
): { reveals: Resolution['reveals']; repeated: boolean } {
  const ctx = world.predContext();
  const out: Resolution['reveals'] = [];
  // A question that lands on something the player already holds is not a failure and not
  // a silence: the person says it again. Worth telling them apart, because "they gave you
  // nothing" and "they repeated themselves" are different rooms to be standing in.
  let repeated = false;
  const target = intent.targets[0] ?? null;
  // Whole words only. Substring matching made "about" contain "out", which opened the
  // who-left-the-room path on a question about a parked car.
  const words = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean),
    );
  let said = words(`${intent.raw} ${intent.goal ?? ''}`);

  // A follow-up is still about the last thing. "How sure are you?" names no subject and
  // needs none: the player is plainly still on the car, because that is what this person
  // was just talking about. Without this, the second question in every conversation is
  // the one the world stops understanding.
  if (target && world.character(target) && !opensAnything(world, intent, target, said)) {
    const earlier = lastSubjectOf(world, target);
    if (earlier) said = new Set([...said, ...words(earlier)]);
  }

  for (const p of world.pkg.discovery_paths) {
    if (p.via_verb && !p.via_verb.includes(intent.verb)) continue;
    // Any thing the player named, not only the first one. "Compare the board against the
    // paper log" names two objects, and matching only the first meant the log — the whole
    // point of the sentence — was never looked at.
    if (p.via_target && !intent.targets.some((t) => p.via_target!.includes(t))) continue;
    if (!p.via_verb && !p.via_target) continue; // override-only path
    // A targeted question gets the answer; a vague one does not.
    if (p.topic_hints?.length && !p.topic_hints.some((h) => said.has(h.toLowerCase()))) continue;
    if (!evalPred(p.requires, ctx)) continue;

    const d = p.disclosure ?? { status: 'told' as KnowledgeStatus, value: '@holder_belief' };
    const named = p.via_target ? intent.targets.find((t) => p.via_target!.includes(t)) : null;
    // The source is the PERSON this path routes through, or nobody. A thing is never a
    // source (reading it is an observation), and neither is whoever the player happened to
    // be addressing — a path with no via_target is the player working it out, not somebody
    // telling them. Falling back to the turn's target made L6 reject the write, silently.
    const source = d.source ?? (named && world.character(named) ? named : 'observation');
    const value = resolveDisclosureValue(world, p, source);
    if (value === null) continue; // the source does not actually hold it — nothing to give

    // Re-hearing what you already believe teaches nothing. A CORRECTION, though, is
    // exactly how a reversal lands: a second path may contradict a first (item 18).
    const held = world.knowledge.get(world.playerId, p.fact);
    if (held.status !== 'unknown' && held.value === value) {
      repeated = true;
      continue;
    }

    out.push({
      fact: p.fact,
      to: world.playerId,
      status: outcome === 'partial' ? downgrade(d.status) : d.status,
      via: p.id,
    });
    // One act does not empty a person. Two things at once is already generous.
    if (out.length >= 2) break;
    // the concrete value/fidelity ride on the path; item 10 reads them back via `via`
  }
  return { reveals: out, repeated: repeated && out.length === 0 };
}

/** Would anything at all have opened on these words? Used to decide whether a question
 *  is a fresh subject or a follow-up on the last one. */
function opensAnything(world: World, intent: Intent, target: string, said: Set<string>): boolean {
  return world.pkg.discovery_paths.some((p) => {
    if (p.via_verb && !p.via_verb.includes(intent.verb)) return false;
    if (p.via_target && !p.via_target.includes(target)) return false;
    if (!p.via_verb && !p.via_target) return false;
    return !p.topic_hints?.length || p.topic_hints.some((h) => said.has(h.toLowerCase()));
  });
}

/**
 * What this person is already on: the most recent thing said in the room that involved
 * them. Either the player's last words to them, or — when the player has not spoken to
 * them yet — the sentences about them in whatever the room last heard.
 *
 * Only the sentences naming them, never the whole passage. A block of scene-setting
 * mentions everybody and everything, and inheriting all of it would let one vague
 * question open doors the player never went near.
 */
function lastSubjectOf(world: World, target: string): string | null {
  const name = world.displayName(target);
  const mentions = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

  for (const e of [...world.spine.all()].reverse()) {
    if (e.actor_type === 'player' && e.verb !== 'unclear' && e.targets.includes(target)) {
      const said = String(e.payload.raw_text ?? '').trim();
      if (said) return said;
      continue;
    }
    const text = String(e.payload.public_line ?? '').trim();
    if (!text || !mentions.test(text)) continue;
    const about = text
      .split(/(?<=[.!?"])\s+/)
      .filter((sentence) => mentions.test(sentence))
      .join(' ')
      .trim();
    if (about) return about;
  }
  return null;
}

export function resolveDisclosureValue(world: World, path: DiscoveryPath, source: string): string | null {
  const d = path.disclosure ?? { status: 'told' as KnowledgeStatus, value: '@holder_belief' };
  if (d.value === '@canonical') return world.truth.read(path.fact) ?? null;
  if (d.value === '@holder_belief') {
    const rec = world.knowledge.get(source, path.fact);
    return rec.status === 'unknown' ? null : rec.value;
  }
  return world.truth.isBinding(d.value) ? (world.truth.bind(d.value) ?? d.value) : d.value;
}

const downgrade = (s: KnowledgeStatus): KnowledgeStatus => (s === 'observed' ? 'told' : s);

// ---------------------------------------------------------------------------
// the override path
// ---------------------------------------------------------------------------

function matchOverride(world: World, intent: Intent): ResolutionOverride | null {
  const ctx = world.predContext();
  const target = intent.targets[0] ?? null;
  const matches = world.pkg.overrides.filter((o) => {
    if (o.when.verb && !o.when.verb.includes(intent.verb)) return false;
    if (o.when.target && !(target && o.when.target.includes(target))) return false;
    return evalPred(o.when.pred, ctx);
  });
  if (!matches.length) return null;
  return matches.sort((a, b) => b.priority - a.priority)[0]!;
}

function resolveOverride(
  world: World,
  intent: Intent,
  cap: CapabilityVerdict,
  o: ResolutionOverride,
): Resolution {
  const target = intent.targets[0] ?? null;
  let outcome: OutcomeClass;
  let matched = true;

  if (o.outcome === 'from_truth') {
    const tm = o.truth_match!;
    const canonical = world.truth.read(tm.fact);
    matched = tm.target_equals_value ? canonical === target : canonical === tm.equals;
    outcome = matched ? 'success' : 'failure';
  } else {
    outcome = o.outcome;
  }

  // A player who names a figure overrides the authored default for that resource; an
  // authored transfer stands when they only said "offer her money".
  const committedIds = new Set(cap.commits.filter((c) => c.amount > 0).map((c) => c.id));
  const authored = (matched ? o.effects : (o.effects_else ?? [])).filter(
    (e) => !(e.kind === 'resource' && committedIds.has(e.id)),
  );
  const effects: Effect[] = [{ kind: 'clock', minutes: cap.minutes }, ...cap.cost, ...authored];
  for (const c of cap.commits)
    if (c.amount > 0) effects.push({ kind: 'resource', id: c.id, from: world.playerId, to: target ?? 'world', amount: c.amount });

  const draw = world.rng.draw(`override:${o.id}:${world.counters.turns + 1}`);

  return {
    outcome,
    effects,
    uncertainty: cap.uncertainty,
    rule_path: `override:${o.id}${o.outcome === 'from_truth' ? (matched ? ':matched' : ':unmatched') : ''}`,
    draw,
    capability_score: 1,
    opposition_score: 0,
    // An override's reveals belong to the branch that matched. Pressing somebody who is
    // NOT the culprit was still trying to have them disclose who it was — the invariant
    // engine refused it every time, correctly and silently, so the only sign was a
    // rejected write nobody was reading.
    reveals: o.outcome === 'from_truth' && !matched ? [] : (o.reveals ?? []).map((r) => ({ ...r })),
    summary: (matched ? o.summary : (o.summary_else ?? o.summary)),
  };
}

// ---------------------------------------------------------------------------

function defaultSummary(
  world: World,
  intent: Intent,
  outcome: OutcomeClass,
  revealed: number,
  repeated: boolean,
): string {
  // A verb that acts on things describes the thing, even when a person is named in
  // passing. "look at Rook's phone" names Rook, and the world said "Rook gives you part of
  // it" about a handset lying face down on a ledge — which reads as him handing it over,
  // the opposite of what the player did.
  const verbDef = world.pkg.verbs.find((v) => v.id === intent.verb);
  const subject =
    (verbDef?.object_verb ? intent.targets.find((id) => !world.character(id)) : null) ??
    intent.targets[0] ??
    null;
  const t = subject ? world.displayName(subject) : 'the room';
  const person = Boolean(subject && world.character(subject));

  // Saying somebody "keeps the rest where you can see them holding it" when they had
  // nothing to give is the world inventing a withholding that never happened, and it
  // reads as the game being broken. What actually happened gets said instead.
  if (!revealed && repeated) {
    if (person) return `${t} says it again, the same way, and does not add anything to it.`;
    if (intent.targets[0]) return `You go over ${t} again and it says exactly what it said the first time.`;
  }
  if (!revealed && (outcome === 'success' || outcome === 'partial')) {
    if (person) return `${t} answers you, and there is nothing in it you did not already have.`;
    if (intent.targets[0]) return `You go through ${t} properly. There is nothing in it you did not already have.`;
  }

  switch (outcome) {
    case 'success':
      return revealed
        ? person
          ? `${t} gives you something.`
          : `You get what you were after.`
        : person
          ? `${t} takes the point, and something in the room settles.`
          : 'It goes the way you wanted it to.';
    case 'partial':
      return person
        ? `${t} gives you part of it and keeps the rest where you can see them holding it.`
        : 'You get some of it. Not the part you wanted most.';
    case 'failure':
      if (!person) return 'Nothing comes of it, and the minute is gone anyway.';
      // "They do not give you that" only makes sense if you were asking for something. A
      // player who told somebody where they stand was not asking, and the world saying
      // they withheld an answer reads as a bug in a conversation.
      return seeking(world, intent)
        ? `${t} does not give you that.`
        : `${t} takes it, and nothing in the room moves the way you wanted it to.`;
    case 'backfire':
      return person
        ? `${t} reacts the way you were afraid they would, and now the room has heard it.`
        : 'It goes wrong in a way you will be paying for shortly.';
  }
}

/** Was this verb one that draws something out of somebody? The world says so itself: a
 *  verb that opens a discovery path is a verb you ask with. */
function seeking(world: World, intent: Intent): boolean {
  return world.pkg.discovery_paths.some((p) => p.via_verb?.includes(intent.verb));
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Exposed for the harness: how many overrides a package leans on (L5 health check). */
export function overrideLoad(pkg: ScenarioPackage): { overrides: number; verbs: number; ratio: number } {
  return { overrides: pkg.overrides.length, verbs: pkg.verbs.length, ratio: pkg.overrides.length / Math.max(1, pkg.verbs.length) };
}
