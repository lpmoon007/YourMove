// The transcript the player reads. Derived from the spine, never stored separately:
// prose is a rendering of an event, not the record of it (item 5). Rebuilding it on
// every turn means what the player sees is always exactly what the log says happened.

import type { World } from '@/lib/aw';

export interface TranscriptEntry {
  kind: 'open' | 'you' | 'world' | 'end';
  text: string;
  world_time: number;
}

export function buildTranscript(world: World): TranscriptEntry[] {
  const out: TranscriptEntry[] = [];
  for (const e of world.spine.all()) {
    if (e.verb === 'world_created') {
      out.push({ kind: 'open', text: String(e.payload.public_line ?? ''), world_time: 0 });
      continue;
    }
    if (e.actor_type === 'player') {
      const typed = String(e.payload.raw_text ?? '');
      if (typed) out.push({ kind: 'you', text: typed, world_time: e.world_time });
      // a clarification has no narration event of its own; its line rides on the event
      if (e.verb === 'unclear') out.push({ kind: 'world', text: String(e.payload.public_line ?? ''), world_time: e.world_time });
      continue;
    }
    if (e.verb === 'narration') {
      out.push({ kind: 'world', text: String(e.payload.text ?? ''), world_time: e.world_time });
      continue;
    }
    if (e.verb === 'run_ended') {
      out.push({ kind: 'end', text: String(e.payload.label ?? 'It is over.'), world_time: e.world_time });
    }
  }
  return out;
}
