// THE GUARD THAT KEEPS YOUR MOVE OUT OF SOMEBODY ELSE'S DATABASE.
//
// A hosting project cloned from another app carries that app's generic Supabase
// variables, and Your Move now accepts those names. That is only safe because it refuses
// to write to a database that cannot prove it is this one.
//
// The first version of the proof was blind. It asked for the marker table with
// `head: true`, which supabase-js sends as an HTTP HEAD; a HEAD response has no body, so
// PostgREST's "no such table" never arrived and the client reported `204, error: null`.
// A missing table read as an empty one, and the deployment reported perfect health while
// pointed at a database that was not ours. These are the exact responses that happened.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { schemaProblemFrom } from '@/lib/aw/store/schema-check';

test('a missing marker table is refused, whichever way it is reported', () => {
  for (const code of ['42P01', 'PGRST205', 'PGRST106']) {
    const problem = schemaProblemFrom({ status: 404, error: { code, message: 'Could not find the table' } });
    assert.ok(problem, `${code} was treated as a healthy database`);
    assert.match(problem, /not the Your Move project|missing the Your Move migrations/);
    assert.match(problem, /Nothing has been written to it/, 'the operator is not told the write was withheld');
  }
});

test('the HEAD-request answer that fooled the first version is refused now', () => {
  // Observed verbatim against a server that answered 404 with a PostgREST error body:
  // supabase-js reported status 204 and no error at all, because HEAD threw the body away.
  assert.ok(
    schemaProblemFrom({ status: 204, error: null }),
    'a status with no explanation was read as a healthy database — this is the original bug',
  );
});

test('anything other than a plain success is refused', () => {
  for (const status of [204, 301, 400, 401, 403, 404, 500, 502]) {
    assert.ok(schemaProblemFrom({ status, error: null }), `status ${status} was read as healthy`);
  }
});

test('a real answer from a real Your Move database passes', () => {
  assert.equal(schemaProblemFrom({ status: 200, error: null }), null);
  assert.equal(schemaProblemFrom({ status: 206, error: null }), null, 'a partial-content range answer is still a success');
});

test('an error that is not about a missing table is passed on in the operator\'s words', () => {
  const problem = schemaProblemFrom({ status: 401, error: { code: '42501', message: 'permission denied for table aw_account' } });
  assert.ok(problem);
  assert.match(problem, /permission denied/, 'the operator has to be told what the database actually said');
});
