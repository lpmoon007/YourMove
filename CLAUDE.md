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

## 4. American English

jewelry, gray, color, behavior, honor, story, rumor, dialed, and the -ize forms
(recognize, normalize, authorize, optimize).

## 5. What this product is

Your Move is **entertainment**. No score, no coaching, no learning frame, no assessment
language anywhere a player can see. The twelve-measurement leadership overlay
(`lib/aw/lens/lfs12.ts`) is a facilitator-side reading of a finished run, off by default,
never mentioned to players.

## 6. Engine laws that are never negotiable

Full detail in `docs/ENGINE.md`. The short version:

- Canonical truth is drawn once at load and never changes during a run. Not for a
  persuasive player, not for the Director, not for drama.
- The model parses intent and writes prose. It never decides an outcome. Nothing between
  capability-check and consequence calls a model.
- Every state write goes through the invariant engine. There is no back door.
- A character can only use knowledge in its own knowledge state.
- Blocks are diegetic: the world says why, in world. Never "you can't do that."
- The event spine is append-only, with causality written at creation.

## 7. Build and verify

```bash
npm run test:aw     # the harness — no key, no database needed
npm run build       # type-check + compile
```

Both must pass before pushing. For player-facing changes, also run the app and look at
the screen.

## 8. Repository shape

```
lib/aw/            engine — pure TypeScript, no I/O, no scenario knowledge
content/yourmove/  worlds, as data. No logic: conditions are a declarative language
app/, components/  the play interface and the facilitator console
tests/aw/          the simulation harness
supabase/          the schema (its own Supabase project)
```

Work on `claude/your-move-simulation-lto8uz`, then fast-forward `main`.
