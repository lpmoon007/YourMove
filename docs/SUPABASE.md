# Your Move — Supabase setup

Your Move needs one Supabase project. The schema is ten tables, all prefixed `aw_`.

Until this is done, Your Move runs on the in-memory store: fully playable, but runs vanish
when the server restarts. Nothing breaks and nothing needs a code change when you switch
over — the app picks the Supabase store automatically the moment the variables are set.

---

## What I need from you

Three values, and one command run. **Do not paste any of these into a chat, an issue, or a
pull request** — the service-role key bypasses row-level security entirely.

1. **Create a new Supabase project.** Any region; the free tier is fine for V1A. Name it
   something unmistakable, e.g. `yourmove-prod` (or `yourmove-dev` if you want a staging
   one first — you can have both, they just get different values in different
   environments).

2. **Apply the migration.** Supabase Dashboard → **SQL Editor** → New query → paste the
   entire contents of `supabase/migrations/0001_yourmove.sql` → **Run**. Or, from
   a machine with `psql` and the project's connection string:

   ```bash
   psql "$YOURMOVE_DB_URL" -f supabase/migrations/0001_yourmove.sql
   ```

   It is idempotent (`create table if not exists`, `drop trigger if exists`), so running it
   twice is safe.

3. **Copy three values out of the dashboard** and put them where the app can read them —
   `.env.local` for local work, and Vercel → Project → Settings → Environment Variables
   for the deployment:

   | Variable | Where it comes from |
   |---|---|
   | `YOURMOVE_SUPABASE_URL` | Project Settings → Data API → **Project URL** |
   | `YOURMOVE_SUPABASE_ANON_KEY` | Project Settings → API Keys → **anon / public** |
   | `YOURMOVE_SUPABASE_SERVICE_ROLE` | Project Settings → API Keys → **service_role** (server only) |

4. **Set a console secret.** Any long random string:

   ```bash
   YOURMOVE_CONSOLE_SECRET=$(openssl rand -hex 24)
   ```

   This guards `/yourmove/console`, the only surface that can apply the twelve-measurement
   overlay. If it is unset the console stays **shut**, not open.

5. **Optional: seed the scenario row.** The engine loads the package from
   `content/yourmove/last-job.ts`, so the app works without this. Run it if you want the
   run rows to have a foreign key to a scenario, which the schema expects:

   ```sql
   insert into aw_scenario (id, slug, title, tagline, format, status)
   values ('ym-last-job', 'last-job', 'The Last Job',
           'Nineteen minutes. Three people. One of them called it in — probably.',
           'F1', 'published')
   on conflict (id) do nothing;
   ```

`.env.example` has all of this in copy-paste form.

That is everything. Tell me when the project exists and I will verify the write path
against it end to end.

---

## What the schema does, and why

Ten tables, all prefixed `aw_`.

| Table | Why it exists |
|---|---|
| `aw_scenario`, `aw_scenario_version` | Scenario as versioned data. A published version is immutable — a trigger refuses `update` and `delete`, because editing one silently would make every run that cites it a lie about what was played. |
| `aw_run` | The run, stamped with seed **and** content version **and** engine ruleset version. A seed alone is not a reproducible world. Carries the world snapshot for save/resume. |
| `aw_run_truth` | Canonical truth, in its own table, **written once**. A trigger raises on any update or delete. If a client can ever read this table, the product is broken. |
| `aw_event` | The event spine. Append-only at the database — a trigger refuses update and delete, for everyone, forever. Corrections are new events. |
| `aw_adjudication` | Adjudication provenance per turn: parsed intent, stage-2 verdict, stage-3 rule path, the seeded draw, both model names, and the recorded model outputs. This is what lets a run be replayed, an adjudicator be debugged, and a fairness dispute be settled. |
| `aw_knowledge_state` | Per actor, per fact: status, value, source, fidelity, distortion, confidence, contradiction, provenance. This is what makes fog of war enforceable and "what you never asked" a query rather than a guess. |
| `aw_rejection` | Every write the invariant engine refused, with the invariant, the attempted effects, and the origin. |
| `aw_outcome` | Multi-axis outcome. Not a score. |
| `aw_lens_read` | Interpretation overlays — including the twelve-measurement leadership lens. Stored **apart from run data** because a lens is a reading of a run and never part of it. |

### Access model

Row-level security is **enabled on every table with no policies at all**. With RLS on and
no policy, `anon` and `authenticated` can do nothing; `service_role` bypasses RLS. Every
read and write goes through the server.

This is not belt-and-braces. `aw_run_truth` holds the answers to a live game. If a browser
could read it, every run would be solvable from the network tab.

### Migrations from here

Add numbered files to `supabase/migrations/`. Do not edit `0001` after it has been
applied anywhere — the same rule the schema itself enforces on scenario versions.
