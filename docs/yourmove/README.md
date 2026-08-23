# Your Move — V1A

An experiential simulation built on the Adaptive Worlds engine rules. It is entertainment
first: you land in a room mid-situation, type whatever you want in plain English, and the
world answers with what actually follows. There is no learning frame, no coaching, and no
score.

The twelve leadership-failure measurements exist here as an **overlay** — a lens a
facilitator can choose to read a finished run through. It is off by default, invisible to
players, and cannot influence a run. See [the overlay](#the-twelve-measurement-overlay).

> **This does not touch The Signal.** Separate engine (`lib/aw`), separate app routes
> (`/yourmove`), separate content (`content/yourmove`), separate Supabase project
> (`supabase-yourmove`), separate environment variables, separate CI job. No file
> belonging to The Signal was modified beyond `package.json` (one new script),
> `.gitignore` (one new line), and a new CI workflow file.

---

## What is built (Staged Build Order, V1A)

| # | Item | Where |
|---|---|---|
| 1 | World State Store | `lib/aw/state.ts` |
| 2 | Scenario Package + Version Manager | `lib/aw/package.ts` |
| 3 | Seeded Scenario Loader + solvability check | `lib/aw/loader.ts` |
| 4 | Canonical Truth Layer | `lib/aw/truth.ts` |
| 5 | Immutable Event Spine | `lib/aw/spine.ts` |
| 6 | State Invariant Engine | `lib/aw/invariants.ts` |
| 7 | Intent Parser | `lib/aw/intent.ts` + `lib/aw/model/parse.ts` |
| 8 | Capability and Cost Check | `lib/aw/capability.ts` |
| 9 | Outcome Resolver | `lib/aw/resolver.ts` |
| 10 | Consequence Engine | `lib/aw/consequence.ts` |
| 11 | Knowledge and Belief Tracker | `lib/aw/knowledge.ts` |
| 12 | Narrator | `lib/aw/narrator.ts` + `lib/aw/model/narrate.ts` |
| 13 | Vertical Slice A | `content/yourmove/last-job.ts` |
| 14 | Simulation Test Harness | `tests/aw/` |
| 15 | Character System | `CharacterDef` + `World.projectCharacter` |
| 16 | World Clock | `lib/aw/clock.ts` |
| 17 | World Processes | `lib/aw/processes.ts` |
| 18 | Vertical Slice B | folded into the slice: one reversal, one delayed consequence, one recovery path |
| 19 | Director | `lib/aw/director.ts` |
| 21 | Play Interface | `app/yourmove` + `components/yourmove/PlayApp.tsx` |
| 24–26 | Outcome, Reveal, Causal Debrief | `lib/aw/outcome.ts` + `/yourmove/[runId]/debrief` |
| 27 | Save and Resume | `lib/aw/persistence.ts` + `lib/aw/store/` |

Items 20 (Director test pass) and 22 (first external test) are human activities, not code.
They are the next things to do, not the next things to build.

## The laws, and where each one is enforced

| Law | Enforced by |
|---|---|
| **L1** model proposes, rules decide | Only stages 1 and 5 call a model; `resolver.ts` has no network import at all |
| **L2** truth immutable during a run | `TruthLayer` is frozen at construction; the DB trigger `aw_run_truth_no_update` refuses the write too |
| **L3** every mutation passes invariants | `WorldStateStore.apply` is the only write path, and it always calls `checkInvariants` |
| **L4** state read through projections | Five projections on `World`; consumers never receive the store |
| **L5** authored rules constrain, not enumerate | 4 overrides against 10 verbs; the harness fails the build if overrides outnumber verbs |
| **L6** a character uses only its own knowledge | `projectCharacter` builds context from that actor's knowledge; the knowledge invariant rejects a disclosure from a source that does not hold the fact |
| **L7** every event carries causality | Causal fields are arguments to `spine.append`, written at creation |
| **L8** nothing is deleted | `EventSpine` has no update or delete; `aw_event_no_mutate` enforces it in Postgres |
| **L9** failure reduces the ceiling first | Backfire needs a bad margin **and** a real risk factor; hard fail requires accumulated state |
| **L10** blocks are diegetic | `checkCapability` renders authored `block.*` lines; a test asserts no system voice |
| **L11** determinism | All randomness comes from `Rng`, keyed by named stream; a test replays a full script |
| **L12** content and engine never mix | Packages are data plus the predicate DSL; the validator refuses executable content |

## Running it

```bash
npm install
npm run test:aw     # the harness: 41 checks, no key and no database required
npm run dev         # then open http://localhost:3000/yourmove
```

With no `ANTHROPIC_API_KEY`, the world still runs: stage 1 uses the deterministic parser
and stage 5 the deterministic renderer. The rules are identical; the prose is plainer.
With no Supabase project, runs live in memory for the life of the server process.

## Where the V1A exit gate stands

Measured by `npm run test:aw` on the current build:

| Gate | Target | Now |
|---|---|---|
| Slice runs end to end without engineering intervention | yes | yes |
| Canonical truth mutations across the integrity suite | 0 | 0 |
| Unresolved invariant violations in automated runs | 0 | 0 |
| Unsupported actions degrade to a coherent in-world response | ≥ 85% | 100% on the 40-action corpus |
| Clarifying-question rate (a deflection if it is high) | low | 10% |
| Backfire on a first reasonable move | rare | 0% |
| Override load (L5 health) | < 1.0 | 0.40 |
| Adjudication latency and model cost per turn | measured | **not yet** — needs a key and a real session |

Two things are genuinely outstanding before the gate is met: the tester corpus is 40
actions and the criterion calls for 200 written by people who did not build the scenario,
and latency/cost per turn have not been measured because that requires live model calls.
Both are measurement work, not build work.

## The twelve-measurement overlay

`lib/aw/lens/lfs12.ts`. The same twelve markers as the leadership product's Behavioral
Panel — Tier A A1–A6, Tier B B1–B6, same keys, same labels, same composite and quadrant
maths — computed over Your Move's event spine.

It is a **separate implementation**, not an import of `lib/panel.ts`. The two products
share the vocabulary, not the code, exactly as the convergence brief specifies: one
simulation core, two applications, two interpretation layers. That also means The Signal's
files are never touched by anything here.

Three rules it keeps:

1. **Off unless asked.** `applyLfs12` returns `null` unless `enabled: true`, `RunConfig`
   defaults `lfs12_overlay` to `false`, and the lens is deliberately not re-exported from
   `lib/aw/index.ts` so an idle import cannot turn a game into an assessment.
2. **Never scores an opportunity the world did not present.** A solo run has no peers, so
   B1 (airtime), B3 (backup) and B6 (mutual monitoring) report `exercised: false` — never
   a zero, never a silent drop.
3. **Every marker cites its evidence.** `evidence` holds the event ids that justify the
   number, and the harness asserts every cited id exists in the spine.

**Where the checkbox is:** `/yourmove/console/<runId>?key=<YOURMOVE_CONSOLE_SECRET>` —
tick *"Read this run through the leadership-failure lens"* and submit. Reads are stored in
`aw_lens_read`, apart from the run, because a lens is a reading of a run and never part of
it. Players never see this surface and the game never mentions it.

## The scenario

**The Last Job.** Room 1114, nineteen minutes before the van leaves. Three people, forty
thousand dollars, and a call that went out at 11:04 from somewhere in this building.

- **Dez** is sincerely wrong about the car on the corner and sincerely certain.
- **Marla** knows who made the call and will sell it, or lie about it for free.
- **Cyrus** points away from himself and believes his own version.
- The culprit is drawn from the seed, and **"nobody"** is one of the four answers — so a
  confident accusation is a real risk and no run can be solved from the outside.

Authoring rules honoured: two independent discovery paths for every fact a top outcome
needs, leverage on every character, one sincere mistake and one deliberate deception you
cannot separate by manner, a recovery path at reduced ceiling, four outcome axes that move
independently, and content descriptors written before the scenario.

## Deliberately not built in V1A

Per Part 5 of the design rules: no cross-run persistence beyond save and resume, no
accounts, no second seat, no cross-scenario anything, no difficulty tiers, no per-run seed
variation (the infrastructure is live; the variation is V1C), no presentation layer, no
voice, no model-routing optimisation before cost is measured, and no authoring tool.
