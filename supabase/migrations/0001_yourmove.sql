-- ============================================================================
-- YOUR MOVE — initial schema (Adaptive Worlds engine, V1A)
--
-- Everything is prefixed aw_ so this schema stays unmistakably its own, even if it ever
-- shares a database with something else.
--
-- Design obligations this schema exists to satisfy:
--   item 5  — the event spine is append-only, enforced by the database, not by hope
--   item 4  — canonical truth is a separate table, service-role only, never joined out
--   item 11 — knowledge state is stored per actor per fact, apart from truth
--   brief 7 — adjudication provenance is recorded on every resolution
--   brief 10 — versions and seed are stamped on every run; a seed alone is not a world
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- content: a scenario, and the immutable versions of it
-- ---------------------------------------------------------------------------

create table if not exists aw_scenario (
  id            text primary key,              -- e.g. 'ym-last-job'
  slug          text not null unique,
  title         text not null,
  tagline       text,
  format        text not null check (format in ('F1', 'F2', 'F3')),
  status        text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  created_at    timestamptz not null default now()
);

create table if not exists aw_scenario_version (
  id                     uuid primary key default gen_random_uuid(),
  scenario_id            text not null references aw_scenario (id) on delete cascade,
  content_version        text not null,
  schema_version         text not null,
  engine_ruleset_version text not null,
  -- The package itself. Immutable once published: a change is a new row.
  payload                jsonb not null,
  published_at           timestamptz not null default now(),
  unique (scenario_id, content_version)
);

-- A published version is frozen. Editing one silently would make every run that cites it
-- a lie about what was played.
create or replace function aw_scenario_version_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'aw_scenario_version is immutable; publish a new content_version instead';
end $$;

drop trigger if exists aw_scenario_version_no_update on aw_scenario_version;
create trigger aw_scenario_version_no_update
  before update or delete on aw_scenario_version
  for each row execute function aw_scenario_version_immutable();

-- ---------------------------------------------------------------------------
-- runs
-- ---------------------------------------------------------------------------

create table if not exists aw_run (
  id                     text primary key,     -- engine-generated run id
  scenario_id            text not null references aw_scenario (id),
  content_version        text not null,
  schema_version         text not null,
  engine_ruleset_version text not null,
  seed                   text not null,
  status                 text not null default 'live' check (status in ('live', 'ended', 'abandoned')),
  -- run settings snapshot, immutable for the life of the run (brief 10.2)
  config                 jsonb not null default '{}'::jsonb,
  -- full world snapshot for save + resume (item 27). Rebuildable from the spine; kept
  -- because resuming from a snapshot is O(1) and replaying is O(turns).
  snapshot               jsonb,
  player_key             text,                 -- an opaque local identifier, no account system in V1A
  created_at             timestamptz not null default now(),
  ended_at               timestamptz,
  end_reason             text
);

create index if not exists aw_run_scenario_idx on aw_run (scenario_id, created_at desc);
create index if not exists aw_run_status_idx on aw_run (status, created_at desc);

-- ---------------------------------------------------------------------------
-- item 4 — canonical truth. Its own table, service-role only, never in a projection.
-- ---------------------------------------------------------------------------

create table if not exists aw_run_truth (
  run_id      text primary key references aw_run (id) on delete cascade,
  values      jsonb not null,
  bindings    jsonb not null default '{}'::jsonb,
  fingerprint text not null,
  written_at  timestamptz not null default now()
);

-- Written exactly once, at load (L2). Any later write is a bug regardless of intent.
create or replace function aw_run_truth_write_once() returns trigger
language plpgsql as $$
begin
  raise exception 'canonical truth is written once at world creation and never again (L2)';
end $$;

drop trigger if exists aw_run_truth_no_update on aw_run_truth;
create trigger aw_run_truth_no_update
  before update or delete on aw_run_truth
  for each row execute function aw_run_truth_write_once();

-- ---------------------------------------------------------------------------
-- item 5 — the immutable event spine. The only history that exists.
-- ---------------------------------------------------------------------------

create table if not exists aw_event (
  run_id      text not null references aw_run (id) on delete cascade,
  seq         integer not null,
  id          text not null,
  world_time  integer not null,
  wall_time   timestamptz not null default now(),
  actor_id    text not null,
  actor_type  text not null check (actor_type in ('player', 'character', 'world_process', 'director', 'system')),
  verb        text not null,
  targets     text[] not null default '{}',
  payload     jsonb not null default '{}'::jsonb,
  visibility  text[] not null default '{*}',
  -- causal fields, written at creation and never inferred afterwards (L7)
  caused_by     text[] not null default '{}',
  enabled_by    text[] not null default '{}',
  blocked_by    text[] not null default '{}',
  amplified_by  text[] not null default '{}',
  revealed_by   text[] not null default '{}',
  primary key (run_id, seq)
);

create index if not exists aw_event_run_idx on aw_event (run_id, seq);
create index if not exists aw_event_actor_idx on aw_event (run_id, actor_type);
create index if not exists aw_event_verb_idx on aw_event (run_id, verb);

-- Append-only, at the database. No update, no delete, for anyone (L8).
create or replace function aw_event_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'aw_event is append-only; corrections are new events (L8)';
end $$;

drop trigger if exists aw_event_no_mutate on aw_event;
create trigger aw_event_no_mutate
  before update or delete on aw_event
  for each row execute function aw_event_append_only();

-- ---------------------------------------------------------------------------
-- brief 7 — adjudication provenance. Without it you cannot debug the adjudicator,
-- arbitrate a fairness dispute, or improve resolution quality from real runs.
-- ---------------------------------------------------------------------------

create table if not exists aw_adjudication (
  run_id                text not null references aw_run (id) on delete cascade,
  event_id              text not null,
  raw_text              text not null,
  intent                jsonb not null,
  parser_model          text,
  parser_output         text,
  stage2_result         text not null,
  stage2_reason         text,
  stage3_rule_path      text,
  seeded_draw           double precision,
  outcome               text not null,
  director_participated boolean not null default false,
  narrator_model        text,
  narrator_output       text,
  narrator_fell_back    boolean not null default false,
  validation_problems   text[] not null default '{}',
  narration             text,
  created_at            timestamptz not null default now(),
  primary key (run_id, event_id)
);

-- ---------------------------------------------------------------------------
-- item 11 — knowledge state, per actor per fact, apart from truth.
-- This is what makes fog of war enforceable and "what you never asked" a query.
-- ---------------------------------------------------------------------------

create table if not exists aw_knowledge_state (
  run_id       text not null references aw_run (id) on delete cascade,
  actor_id     text not null,
  fact_id      text not null,
  status       text not null check (status in ('unknown', 'told', 'observed', 'inferred', 'believed_false')),
  value        text,
  source_actor text,
  acquired_at  integer,
  fidelity     double precision not null default 1,
  distortion   text,
  confidence   double precision not null default 0.5,
  contradicted boolean not null default false,
  provenance   text[] not null default '{}',
  updated_at   timestamptz not null default now(),
  primary key (run_id, actor_id, fact_id)
);

create index if not exists aw_knowledge_actor_idx on aw_knowledge_state (run_id, actor_id);

-- ---------------------------------------------------------------------------
-- items 6, 24 — rejected writes, and the multi-axis outcome
-- ---------------------------------------------------------------------------

create table if not exists aw_rejection (
  id              uuid primary key default gen_random_uuid(),
  run_id          text not null references aw_run (id) on delete cascade,
  world_time      integer not null,
  actor_id        text not null,
  origin_event_id text,
  invariant       text not null,
  message         text not null,
  attempted       jsonb not null,
  created_at      timestamptz not null default now()
);

create table if not exists aw_outcome (
  run_id      text primary key references aw_run (id) on delete cascade,
  axes        jsonb not null,
  headline    text not null,
  reason      text,
  world_time  integer not null,
  computed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- interpretation overlays — stored APART from run data, because a lens is a reading of
-- a run and never part of it. The twelve-measurement leadership overlay lands here.
-- ---------------------------------------------------------------------------

create table if not exists aw_lens_read (
  run_id       text not null references aw_run (id) on delete cascade,
  lens_key     text not null,                  -- e.g. 'lfs12'
  lens_version text not null,                  -- e.g. 'lfs12-v0.1'
  payload      jsonb not null,
  requested_by text,                           -- who asked for it (console identity)
  created_at   timestamptz not null default now(),
  primary key (run_id, lens_key, lens_version)
);

-- ---------------------------------------------------------------------------
-- Access model: DEFAULT DENY for browser roles. Every read and write in V1A goes
-- through the service role on the server.
-- ---------------------------------------------------------------------------

alter table aw_scenario          enable row level security;
alter table aw_scenario_version  enable row level security;
alter table aw_run               enable row level security;
alter table aw_run_truth         enable row level security;
alter table aw_event             enable row level security;
alter table aw_adjudication      enable row level security;
alter table aw_knowledge_state   enable row level security;
alter table aw_rejection         enable row level security;
alter table aw_outcome           enable row level security;
alter table aw_lens_read         enable row level security;

-- No policies are created on purpose. With RLS enabled and no policy, anon and
-- authenticated can do nothing at all; the service_role bypasses RLS entirely.
-- Canonical truth in particular must never become readable from a browser.

comment on table aw_run_truth is
  'Canonical truth for a run. Service role only, forever. If a client can read this table, the product is broken.';
comment on table aw_event is
  'The immutable event spine. Append-only at the database. Prose is a rendering of an event, never the record of it.';
comment on table aw_lens_read is
  'Interpretation overlays over a finished run (e.g. the twelve-measurement leadership lens). Never consulted during play.';
