// WHICH VARIABLES THIS DEPLOYMENT ACTUALLY READS.
//
// The deployed app spent days on in-memory storage because the variables were named
// NEXT_PUBLIC_SUPABASE_URL and the code read NEXT_PUBLIC_YOURMOVE_SUPABASE_URL. Nothing
// failed. Every run played perfectly and disappeared on the next deploy.
//
// So: more names are accepted, in a fixed order, and this pins the order down. The safety
// that makes accepting a generic name reasonable is not here — it is the schema check in
// the store, which refuses to write to a database that cannot prove it is this one.

import assert from 'node:assert/strict';
import { test } from 'node:test';

const NAMES = [
  'NEXT_PUBLIC_YOURMOVE_SUPABASE_URL',
  'YOURMOVE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
  'YOURMOVE_SUPABASE_SERVICE_ROLE',
  'YOURMOVE_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'YOURMOVE_CONSOLE_SECRET',
];

import * as env from '@/lib/yourmove/env';

/** Nothing in that module captures the environment at import, so this is enough. */
function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const saved: Record<string, string | undefined> = {};
  for (const n of NAMES) {
    saved[n] = process.env[n];
    delete process.env[n];
  }
  for (const [k, v] of Object.entries(vars)) if (v !== undefined) process.env[k] = v;
  try {
    return fn();
  } finally {
    for (const n of NAMES) {
      if (saved[n] === undefined) delete process.env[n];
      else process.env[n] = saved[n];
    }
  }
}

test('nothing set means nothing is claimed', () => {
  withEnv({}, () => {
    assert.equal(env.ymSupabaseConfigured(), false);
    const d = env.envDiagnostics();
    assert.equal(d.url.found, null);
    assert.equal(d.service_role.found, null);
    assert.equal(d.model_key, false);
    assert.throws(() => env.ymServiceRoleKey(), /service-role key/i);
  });
});

test('an address without a key is not a configured database', () => {
  // This is the shape the real deployment was in, and the shape that must never read as
  // healthy: half-configured is not configured.
  withEnv({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.test' }, () => {
    assert.equal(env.ymSupabaseConfigured(), false);
    assert.equal(env.envDiagnostics().url.found, 'NEXT_PUBLIC_SUPABASE_URL');
    assert.equal(env.envDiagnostics().service_role.found, null);
  });
});

test('the generic names work, and the Your Move names win when both are set', () => {
  withEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: 'https://generic.test',
      SUPABASE_SERVICE_ROLE_KEY: 'generic-key',
    },
    () => {
      assert.equal(env.ymSupabaseConfigured(), true);
      assert.equal(env.ymSupabaseUrl(), 'https://generic.test');
      assert.equal(env.ymServiceRoleKey(), 'generic-key');
    },
  );

  withEnv(
    {
      NEXT_PUBLIC_YOURMOVE_SUPABASE_URL: 'https://ours.test',
      NEXT_PUBLIC_SUPABASE_URL: 'https://generic.test',
      YOURMOVE_SUPABASE_SERVICE_ROLE: 'ours-key',
      SUPABASE_SERVICE_ROLE_KEY: 'generic-key',
    },
    () => {
      assert.equal(env.ymSupabaseUrl(), 'https://ours.test', 'a generic name beat the Your Move one');
      assert.equal(env.ymServiceRoleKey(), 'ours-key', 'a generic key beat the Your Move one');
    },
  );
});

test('the diagnostic reports names and never values', () => {
  withEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: 'https://project-abc123.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'sb-secret-do-not-print',
      ANTHROPIC_API_KEY: 'sk-ant-secret',
      YOURMOVE_CONSOLE_SECRET: 'console-secret',
    },
    () => {
      const serialized = JSON.stringify(env.envDiagnostics());
      for (const secret of ['project-abc123', 'supabase.co', 'sb-secret-do-not-print', 'sk-ant-secret', 'console-secret'])
        assert.equal(serialized.includes(secret), false, `the setup diagnostic leaks "${secret}"`);
      const d = env.envDiagnostics();
      assert.equal(d.model_key, true);
      assert.equal(d.console_secret, true);
      assert.equal(d.service_role.found, 'SUPABASE_SERVICE_ROLE_KEY');
    },
  );
});


test('nothing captures the environment at import', () => {
  // A module-level constant reads the environment once, when the process starts, and then
  // cannot be corrected — which is a quieter version of the same bug. Every reader here is
  // a function, and this proves it by changing the environment underneath one.
  const before = withEnv({ SUPABASE_URL: 'https://first.test' }, () => env.ymSupabaseUrl());
  const after = withEnv({ SUPABASE_URL: 'https://second.test' }, () => env.ymSupabaseUrl());
  assert.equal(before, 'https://first.test');
  assert.equal(after, 'https://second.test');
});
