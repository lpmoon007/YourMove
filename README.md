# Your Move

An experiential simulation. You land in a room mid-situation, type whatever you want in
plain English, and the world answers with what actually follows. No score, no coaching, no
learning frame — it is built to be fun.

Underneath is the **Adaptive Worlds** engine, built to its design rules: canonical truth is
locked before you arrive, the model proposes and speaks while the rules decide and
remember, and every consequence is traceable back to the action that caused it.

**The first world — The Last Job.** Room 1114, nineteen minutes before the van leaves.
Three people, forty thousand dollars, and a call that went out at 11:04 from somewhere in
this building. One of them made it. Possibly none of them did.

---

## Run it

```bash
npm install
npm run test:aw     # the simulation harness: 41 checks, no key and no database needed
npm run dev         # http://localhost:3000
```

| Surface | URL |
|---|---|
| Play | `/` |
| A run in progress | `/yourmove/<runId>` |
| Reveal + causal debrief | `/yourmove/<runId>/debrief` |
| How You Play | `/how-you-play` |
| Facilitator console | `/yourmove/console?key=$YOURMOVE_CONSOLE_SECRET` |

With no `ANTHROPIC_API_KEY` the world still runs — stage 1 falls back to the deterministic
parser and stage 5 to the deterministic renderer. The rules are identical; the prose is
plainer. With no Supabase project, runs live in memory for the life of the server process.

Setup: **[`docs/SUPABASE.md`](docs/SUPABASE.md)** · Architecture:
**[`docs/ENGINE.md`](docs/ENGINE.md)** · Env vars: `.env.example`

## How a turn works

Five stages. Two are model calls, three are code, and nothing between stage 2 and stage 4
ever asks a model anything.

```
  1  intent parse ......... model, deterministic fallback     lib/aw/intent.ts
  2  capability + cost .... code                              lib/aw/capability.ts
  3  resolution ........... code + a seeded draw              lib/aw/resolver.ts
  4  consequence .......... code + processes + Director       lib/aw/consequence.ts
  5  narration ............ model, validated, authored fallback  lib/aw/narrator.ts
```

Five things are kept in five separate objects on purpose, and the separation is the whole
design: **world state** (what is true now), **canonical truth** (the answers, frozen at
load), **knowledge** (what each person believes, which may be wrong), **history** (an
append-only event spine with causality written at creation), and **the seeded stream**
(so a run replays identically).

## Layout

```
lib/aw/            the engine — pure TypeScript, state in, deltas out, no I/O
  lens/lfs12.ts    the twelve-measurement leadership overlay (off by default)
  model/           the two model calls, each with a fallback
  store/           run persistence: Supabase, or memory when unconfigured
content/yourmove/  worlds, as data. No logic — conditions are a declarative language
app/               the play interface and the facilitator console
tests/aw/          the simulation harness (item 14)
supabase/          the schema. Truth is write-once and events append-only, in Postgres
```

## How You Play

A behavioral game-profile layer that accumulates across runs and worlds. Eight spectrums —
Force/Diplomacy, Caution/Boldness, Solo/Coalition, Speed/Deliberation, Control/Delegation,
Preserve/Risk, Direct/Cunning, Loyalty/Opportunism — each read from evidence tied to
specific moments, with the counter-evidence shown alongside.

**It measures observable play, never personality.** It says "this is how you tended to play
in these worlds", never "this is who you are". Neither end of any spectrum is better.
Nothing is permanent: recent play weighs more, a dimension no world tested reads as
untested rather than neutral, and two opposite runs read as *context-dependent* rather than
being averaged into a confident middle.

The architecture is one-way and enforced by a test:

```
simulation runtime -> event spine -> observer -> profile
```

Nothing in `lib/aw` outside `lib/aw/play/` may import it, and no play dimension can reach a
resolution. Scenarios declare what their own verbs mean via `play_signals`, because only
the world knows that pressing someone is force — but that is authored data the runtime
never reads.

## The twelve-measurement overlay

Your Move is entertainment, but the same run can be read through the leadership-failure
lens when someone asks for it: the Tier A / Tier B behavioral panel, twelve markers,
computed over this engine's event spine.

It is **off by default and invisible to players**. A facilitator turns it on with a
checkbox at `/yourmove/console/<runId>`. It cannot influence a run — by the time it can be
computed, the run is already written down. A marker the world never gave the player a
chance to exercise reports as *not exercised*, never as a zero, and every number cites the
events behind it.

## What is deliberately not built yet

No cross-run persistence beyond save and resume, no accounts, no second seat, no
cross-scenario anything, no difficulty tiers, no per-run seed variation (the
infrastructure is live; the variation is V1C), no presentation layer, no voice, and no
authoring tool. Each of those has a release it belongs to, and building it early would
distort the spine.

Two measurements are still outstanding before the V1A gate is formally met: the tester
corpus needs to reach 200 free-text actions written by people who did not build the
scenario, and latency and cost per turn need measuring against live model calls.
