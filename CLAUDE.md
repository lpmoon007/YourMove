# Your Move — working rules

Read this before writing anything a player will read, and before deciding a correction
is finished.

---

## 1. Every player-facing string assumes the reader knows nothing

The player has not read the scenario file. They do not know the cast, the crime, the
genre, the objective, or what any name refers to. They have this screen and nothing else.

Before shipping any player-facing text, read it as a stranger and list every noun, name,
and reference that assumes prior knowledge. Every one of them is a defect.

Specific rules that came out of real failures:

- **No name before an introduction.** A person's name may not appear in any text the
  player reads until something has told them who that person is. In the pre-run brief,
  describe people by role ("your driver"); introduce them by name in the cast block.
  Enforced by a test in `tests/aw/behavioral.test.ts`.
- **Say what the situation literally is.** "The job went perfectly" is genre shorthand
  that only reads to someone who already knows. Say what the crime was, who committed
  it, and what is in the room. Mystery is what the player works out DURING a run, never
  the situation they arrived in. `world.setup` and `genre` are required fields.
- **Say who the player is and what they want.** `player.you`, `player.objective` and
  `player.pressure` are required fields. A role title has to be one a person can picture
  themselves holding.
- **Never leak the answer.** A character's `intro` may not reveal their reliability or
  motive. Whether someone is honest, mistaken, or lying is the entire game.

## 2. Fix the class, not the instance

When a correction arrives, the sentence quoted is a sample, not the scope. Before
touching anything:

1. Name the class of defect the sample belongs to.
2. Grep or read every other place in the repository where that class can exist.
3. Fix all of them in one pass.
4. Where the class can be checked mechanically, add the check — a schema requirement, a
   validator rule, or a test — so it cannot recur silently.

Three consecutive rounds of the same feedback happened because each fix patched only the
quoted sentence. That is the failure mode to watch for.

## 3. Tests passing is not evidence the thing is good

The harness proves the world cannot be broken. It cannot tell you that the most obvious
question in the game returns nothing, or that a screen is incomprehensible. Both of those
shipped with 41 green checks.

Before saying a player-facing change is done: run it, look at it, and read it cold.

A corpus written by someone who knows the verb list only ever tests the verb list. Every
check was green while the world answered "I didn't catch that" to *how sure are you,
Dez?* — because every action in the corpus started with a verb, and most of what a player
types is a question with no verb in it at all. When adding coverage, add the sentences a
stranger would type, not the ones the vocabulary suggests.

## 4. American English

jewelry, gray, color, behavior, honor, story, rumor, dialed, and the -ize forms
(recognize, normalize, authorize, optimize).

## 5. What this product is

Your Move is **entertainment**. No score, no coaching, no learning frame, no assessment
language anywhere a player can see. The twelve-measurement leadership overlay
(`lib/aw/lens/lfs12.ts`) is a facilitator-side reading of a finished run, off by default,
never mentioned to players.

## 6. How You Play — measure play, never personality

`lib/aw/play/` accumulates evidence about how someone PLAYS, across runs and worlds.

**The rule: measure observable play behavior, never personality.** The system says "this
is how you tended to play in these worlds." It never says "this is who you are."

- Write "you tend to", "so far you've often", "in the worlds you've played". Never "you
  are …", and never the words personality, trait, psychological, diagnosis, assessment,
  leadership style, behavioral type. A test fails the build on any of them.
- Neither end of a spectrum is better than the other. Force is not worse than Diplomacy.
- Nothing is permanent. Recent play weighs more, and thin evidence says so.
- A dimension no world tested reports as untested, never as a neutral middle.
- Opposite runs read as context-dependent. Never average two contradictory nights into a
  confident middle — the contradiction is the interesting part, so surface it.
- Every read cites the events behind it, and counter-evidence is shown, not hidden.
- One moment produces one reading per dimension. An authored signal and a derived one that
  see the same event are merged in `observePlay`, because the evidence table is unique on
  `(run_id, opportunity_id, dimension)` and would otherwise drop one silently, leaving the
  stored profile disagreeing with the run the player just finished.

**The architectural rule, enforced by a test:** the simulation emits events; the pattern
engine reads them afterward.

    simulation runtime -> event spine -> observer -> profile

A failed play write can never reach the player either: evidence, badges and a run's owner
are written through `withoutBreakingPlay` in `lib/yourmove/actions.ts`, because a database
missing this layer's migration once made "Start the clock" fail at the front door. The
profile is worth less than the game. A test fails the build if any of those three writes
is called unguarded.

No module in `lib/aw` outside `play/` may import it. A play dimension can never reach a
resolution. The scenario declares what its own verbs mean (`play_signals`), because only
the world knows that pressing someone is force — but it declares it as data the runtime
never reads.

## 7. Accounts hold nothing personal

An account is one play code — `ym-4f2a9c-raven-tunnel-quiet-ash-mercy` — and nothing
else. No email, no password, no verification step, no recovery flow that needs a person's
details. It exists for exactly one reason: so a profile survives a different device.

- A `aw_player` row is a DEVICE, not a person. An account ties several of them together,
  and a profile is read across all of them at once.
- Only the scrypt hash of the secret half is stored. The code is shown once, on the screen
  that minted it, and the server genuinely cannot show it again. Say so on that screen.
- Playing anonymously stays a first-class path. Nothing gates a run behind a code, and
  anonymous play is merged into an account the first time a code is used on that device.
- Signing out deletes nothing: the browser gets a fresh device id and the account keeps
  everything.
- An unknown account and a wrong secret return the same message. A stranger holding half
  a code should not learn which half is right.
- A test enumerates every field on an account. Adding anything personal has to break it
  first.

## 7a. More than one world

A world is a file in `content/yourmove/` and a line in `content/yourmove/index.ts`.
Nothing else in the product should have to change.

- Nothing outside the registry imports a specific world. A test walks `lib/`, `app/` and
  `components/` and fails the build on `from '@/content/yourmove/<a-world>'`.
- A run records its own `scenario_id` and is only ever restored against that package. A
  run whose world has left the build is unreadable, and saying so is the honest answer —
  restoring it against another world produces a coherent-looking game with somebody
  else's facts in it.
- Anything a player reads that is specific to a world comes from the world:
  `example_actions`, `cast_note`, `house_rules`, `clock_label`. They are required, and the
  validator rejects an example action that names nobody and nothing in its own world,
  because that is what a brief copied from another world looks like. The clock label was
  the one that got away — "left before the van goes" was hardcoded in a component and
  read as nonsense the moment a second world had a clock.
- A commitment cannot be taken back, so you commit by LEADING with it: the alias has to
  start within the first three words. "Give Vane my word that no other NAME leaves this
  tent" was parsed as an accusation and hanged him; "ask Salcedo about holding pressure for
  Eastgate" is a question, not a decision. A verb's own label must be typeable, and a test
  types every one of them.
- An invariant that fires is a bug, and it fails silently: the write is rejected, the
  narration prints anyway, and an authored beat stops happening. One nonsense `forbidden`
  rule made a character's whole confession unreachable and nothing said so. Every world is
  played through its own corpus and any violation fails the build.
- An override's `reveals` belong to the branch that matched. Pressing somebody who is not
  the culprit was asking them to disclose who was, and only the invariant engine noticed.
- A verb alias and an object name that are the same word means the verb wins and the object
  cannot be touched: `order` the verb ate "the general's order" the document. Every
  searchable thing in every world is looked at by a test, and the brief must never teach a
  phrasing the parser hears as something else.
- Nothing moves the player between locations, and the parser only offers what is in the
  one they are standing in. A discovery path through an object stowed somewhere else is
  not a path — the player is told "look at what?" as though they typed nonsense — so the
  validator refuses one, and a world with two locations should keep everything that
  matters in the one the player starts in.
- A `from_truth` override records its matched branch as a successful turn and the other as
  a failed one. When the matched branch is the bad ending, a triumphant paragraph gets
  filed as a failure. Use two overrides told apart by a `truth` predicate instead, each
  with its own explicit outcome.
- Score the deciding fact on the value being RIGHT (`knows: { correct: true }`), never on
  how firmly it is held. A disclosure authored as first-hand is downgraded to hearsay when
  the turn it arrives on only partly succeeds, so scoring on status told a player "you
  decided without knowing" on the same screen that said "you had this right".
- A copy rule that only sweeps the first world is decoration. The readability and
  introduction checks loop over `WORLDS`, and every world is played through a corpus built
  from its own cast, its own objects and its own examples.
- The front door is that world's brief when there is one world and a lobby when there are
  several. Neither is a special case: the list decides.
- A world may carry an `opening`: the 90-second version of itself, and two or three moves
  somebody can make on it. It is not a demo — whichever move gets picked is played here,
  by the engine, as turn one, so the moves live beside the verbs they use and the
  validator rejects one that names nothing in its own world. `/api/openings` serves them
  so nothing on the front of the house keeps a copy that can drift.
- The previews are confident about what will happen and the world never is. That gap is
  the point of the handover, not a flaw in it — but no opening move may be a near-certain
  dead end, and a test plays each one across a dozen seeds to check.
- Starting a run mints a device cookie, so it only ever happens in a server action or a
  route handler. As a page it is a 500, which is how the taster door shipped the first
  time. A test walks `app/` and fails the build on it.

## 7b. Configuration fails loudly or not at all

The deployed app spent days writing runs to memory because its variables were named
`NEXT_PUBLIC_SUPABASE_URL` and the code read `NEXT_PUBLIC_YOURMOVE_SUPABASE_URL`. Nothing
errored. Every run played perfectly and vanished on the next deploy.

- Several names are accepted for each setting, Your Move's own first, generic ones after.
- Accepting a generic name is only safe because the store proves the database is a Your
  Move database — it looks for `aw_account` — before it writes a row. A hosting project
  cloned from another app carries that app's variables, and they may point at a live
  database belonging to something else.
- Read the environment on use. A module-level constant freezes a value at import, which
  is a quieter version of the same bug.
- `/setup` says which store is live, which variable name supplied each setting, and what
  is wrong when something is. It reports NAMES and yes/no, never values, never a URL,
  never a key fragment.
- The harness runs with no database, so a constraint in the schema is invisible to it
  unless something checks deliberately. `aw_run.scenario_id` is a foreign key to
  `aw_scenario`, nothing ever wrote that row, and the first run to reach a real database
  would have been rejected — hidden for as long as the app was quietly on memory. The
  store registers the world and the exact package version before it writes the run.
- A guard that cannot see is worse than no guard. The first version of the schema check
  asked with `head: true`; supabase-js sends that as HTTP HEAD, a HEAD response has no
  body, and PostgREST's "no such table" never arrived — so a missing table read as an
  empty one and the page reported perfect health. Anything that is not a plain 200 or 206
  is now refused.

## 8. Engine laws that are never negotiable

Full detail in `docs/ENGINE.md`. The short version:

- Canonical truth is drawn once at load and never changes during a run. Not for a
  persuasive player, not for the Director, not for drama.
- The model parses intent and writes prose. It never decides an outcome. Nothing between
  capability-check and consequence calls a model.
- Every state write goes through the invariant engine. There is no back door.
- A character can only use knowledge in its own knowledge state.
- Blocks are diegetic: the world says why, in world. Never "you can't do that."
- The event spine is append-only, with causality written at creation.
- Nothing rewrites what a player said except in front of them. Dictation snaps a misheard
  name to someone in the room, but it does it in the composer, where the words can be read
  and changed before they are sent. The engine never silently retargets an action.

## 9. Build and verify

```bash
npm run test:aw     # the harness — no key, no database needed
npm run build       # type-check + compile
```

Both must pass before pushing. For player-facing changes, also run the app and look at
the screen.

## 10. Repository shape

```
lib/aw/            engine — pure TypeScript, no I/O, no scenario knowledge
lib/aw/play/       How You Play — reads finished runs, never read BY the engine
content/yourmove/  worlds, as data. No logic: conditions are a declarative language
content/yourmove/index.ts  the registry — a world is a file plus a line here
lib/yourmove/      server actions, the session/account layer, and app-only glue
app/, components/  the play interface and the facilitator console
tests/aw/          the simulation harness
supabase/          the schema (its own Supabase project)
```

Work on `claude/your-move-simulation-lto8uz`, then fast-forward `main`.
