-- ============================================================================
-- HOW YOU PLAY — the behavioral game-profile layer.
--
-- Evidence about how somebody PLAYS, accumulated across runs. It is stored apart from
-- run data for the same reason the lens reads are: it is an interpretation of play, not
-- part of what happened. Deleting every row here would leave every run intact.
--
-- One rule this schema exists to make structural: evidence is derived from the event
-- spine AFTER a run, never written during one. Nothing in the simulation reads it back.
-- ============================================================================

-- A player, as a local identifier. No account system in V1A: this is a random id in a
-- cookie, and it is the only thing tying two runs together.
create table if not exists aw_player (
  id          text primary key,
  created_at  timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists aw_play_evidence (
  id             uuid primary key default gen_random_uuid(),
  player_id      text not null references aw_player (id) on delete cascade,
  run_id         text not null references aw_run (id) on delete cascade,
  taxonomy       text not null,
  dimension      text not null,
  -- -1.0 = strongly the left label, +1.0 = strongly the right label
  direction      double precision not null check (direction >= -1 and direction <= 1),
  strength       double precision not null check (strength >= 0 and strength <= 1),
  confidence     double precision not null check (confidence >= 0 and confidence <= 1),
  -- the single event this was read from: one opportunity, one id
  opportunity_id text not null,
  world_id       text not null,
  scenario_id    text not null,
  at_world_time  integer not null,
  context        text not null,
  quote          text,
  created_at     timestamptz not null default now(),
  unique (run_id, opportunity_id, dimension)
);

create index if not exists aw_play_evidence_player_idx on aw_play_evidence (player_id, created_at);
create index if not exists aw_play_evidence_dim_idx on aw_play_evidence (player_id, dimension);

create table if not exists aw_badge_award (
  player_id   text not null references aw_player (id) on delete cascade,
  badge_id    text not null,
  run_id      text not null references aw_run (id) on delete cascade,
  name        text not null,
  earned_for  text not null,
  category    text not null,
  rarity      text not null,
  secret      boolean not null default false,
  world_id    text not null,
  earned_at   timestamptz not null default now(),
  primary key (player_id, badge_id)
);

create index if not exists aw_badge_player_idx on aw_badge_award (player_id, earned_at desc);

-- Which player a run belonged to, so a profile can be rebuilt from the spine alone.
alter table aw_run add column if not exists player_id text references aw_player (id);
create index if not exists aw_run_player_idx on aw_run (player_id, created_at desc);

alter table aw_player        enable row level security;
alter table aw_play_evidence enable row level security;
alter table aw_badge_award   enable row level security;

-- No policies, deliberately: default deny for browser roles, service role only.

comment on table aw_play_evidence is
  'Observable play evidence, derived from the event spine after a run. Describes how somebody played, never who they are. Never read by the simulation.';
