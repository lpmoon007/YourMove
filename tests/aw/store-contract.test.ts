// WHAT THE DATABASE REQUIRES OF A WORLD.
//
// The harness runs with no database, which is the point — but it means a constraint in
// the schema is invisible here unless something checks for it deliberately. One was:
// aw_run.scenario_id is a foreign key to aw_scenario, nothing ever wrote that row, and
// the first run to reach a real database would have been rejected. It stayed hidden for
// as long as the deployment was quietly running on in-memory storage.
//
// So the shape the schema demands is asserted here, against the packages themselves.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { WORLDS } from '@/content/yourmove';

const MIGRATION = readFileSync('supabase/migrations/0001_yourmove.sql', 'utf8');

test('every world can be registered under the constraints the schema declares', () => {
  // aw_scenario: id primary key, slug unique, title not null, format one of three.
  const formats = /format\s+text not null check \(format in \(([^)]+)\)\)/.exec(MIGRATION)?.[1] ?? '';
  const allowed = [...formats.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
  assert.ok(allowed.length >= 3, 'could not read the allowed formats out of the migration');

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const w of WORLDS) {
    assert.ok(allowed.includes(w.format), `${w.slug}: format "${w.format}" is not one the database will accept`);
    assert.ok(w.title.trim(), `${w.slug}: aw_scenario.title is not null`);
    assert.equal(ids.has(w.id), false, `${w.id} is registered twice — aw_scenario.id is a primary key`);
    assert.equal(slugs.has(w.slug), false, `${w.slug} is registered twice — aw_scenario.slug is unique`);
    ids.add(w.id);
    slugs.add(w.slug);
    assert.ok(w.content_version.trim(), `${w.slug}: a run cites content_version, and it cannot be empty`);
  }
});

test('a run cannot be written before the world it cites', () => {
  // The foreign key is real: proven against PostgreSQL 16, where the run insert is
  // rejected outright without the aw_scenario row. This pins the ordering in the code.
  const src = readFileSync('lib/aw/store/supabase.ts', 'utf8');
  const create = src.slice(src.indexOf('async create('), src.indexOf('async save('));
  const registersAt = create.indexOf('registerWorld(');
  const insertsRunAt = create.indexOf("from('aw_run')");
  assert.ok(registersAt >= 0, 'create() no longer registers the world it is about to cite');
  assert.ok(insertsRunAt >= 0, 'create() no longer writes a run');
  assert.ok(
    registersAt < insertsRunAt,
    'the run is written before the world it points at, which the database will refuse',
  );

  // And the version row is inserted, never updated: published packages are immutable and
  // the database enforces it with a trigger.
  assert.match(src, /from\('aw_scenario_version'\)\s*\.insert\(/s, 'the version row is not written with a plain insert');
  assert.equal(
    /from\('aw_scenario_version'\)[\s\S]{0,200}?\.(update|upsert)\(/.test(src),
    false,
    'a published version is being updated, which the database refuses with a trigger',
  );
});

test('the store is handed the package rather than looking one up', () => {
  // lib/aw is the engine and does not know which worlds exist. If the store started
  // importing the registry to find a package, that separation would be gone.
  const src = readFileSync('lib/aw/store/supabase.ts', 'utf8');
  assert.equal(/from '@\/content\//.test(src), false, 'the store reaches into the worlds directory');
  assert.match(src, /async create\(snapshot, pkg\)/, 'create() no longer receives the package');
});
