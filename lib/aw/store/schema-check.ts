// Is the answer we got back from a database an answer from OUR database?
//
// Pure, and separate from the client that fetches it, because the first version of this
// check was wrong in a way that could only be seen by looking at a real response.
//
// It asked for the marker table with `head: true`. supabase-js turns that into an HTTP
// HEAD request, and a HEAD response carries no body — so PostgREST's "no such table"
// payload never arrives and the client reports `status: 204, error: null`. A missing
// table was indistinguishable from an empty one, and a guard written to prevent a silent
// failure failed silently. Hence: a plain select, and a status that has to be 2xx.

export interface ProbeResult {
  status: number;
  error: { code?: string; message: string } | null;
}

/** Null when this is a Your Move database; otherwise a sentence saying what is wrong. */
export function schemaProblemFrom(res: ProbeResult): string | null {
  const missingTable =
    res.error?.code === '42P01' || res.error?.code === 'PGRST205' || res.error?.code === 'PGRST106';
  if (missingTable)
    return (
      'The configured database has no aw_account table, so it is either missing the Your Move migrations or it is ' +
      'not the Your Move project. Nothing has been written to it.'
    );
  if (res.error) return `The configured database refused a read: ${res.error.message}`;
  // No error, and a status nobody asked for. A select answers 200, or 206 when the server
  // is returning a range; anything else is not an answer to the question that was asked.
  // 204 in particular is the shape the blind version produced — no body, nothing to read,
  // and no way to tell a missing table from an empty one. Refuse rather than assume: that
  // assumption is the whole reason this file exists.
  if (res.status !== 200 && res.status !== 206)
    return `The configured database answered with status ${res.status} and no explanation. Nothing has been written to it.`;
  return null;
}
