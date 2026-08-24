-- ============================================================================
-- LIGHTWEIGHT ACCOUNTS
--
-- The smallest thing that makes a profile survive a different device. No email, no
-- password, no personal data: a player is issued a play code, and typing that code on
-- another device attaches that device to the same account.
--
-- Shape of a code:   ym-4f2a9c-raven-tunnel-quiet-ash-mercy-eleven
--                       ^^^^^^  ^--------------------------------^
--                       account id            the secret
--
-- The account id is public and is how a code is looked up. Only the secret half is
-- verified, and only its scrypt hash is stored — the code itself is never written down
-- anywhere on the server, so a copy of this database does not let anybody sign in.
-- ============================================================================

create table if not exists aw_account (
  -- short, public, printed inside the code
  id            text primary key,
  display_name  text,
  -- 'scrypt$<salt-hex>$<hash-hex>' of the secret half of the code, and nothing else
  secret_hash   text not null,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- A player row is a DEVICE, not a person: one per browser that has played. Attaching
-- several of them to one account is what makes a profile follow somebody around, and it
-- is also what merges anonymous play into an account on first sign-in.
alter table aw_player add column if not exists account_id text references aw_account (id) on delete set null;
create index if not exists aw_player_account_idx on aw_player (account_id);

alter table aw_account enable row level security;
-- No policies: service role only, like everything else here.

comment on table aw_account is
  'A lightweight account. Holds no email, no password and no personal data — only a display name and the hash of a play code.';
comment on column aw_player.account_id is
  'Which account this device belongs to. Null means the device is playing anonymously; its evidence still counts and is merged in if it later signs in.';
