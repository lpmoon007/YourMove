import 'server-only';
// STAGE 5 — the model-backed Narrator (item 12).
//
// It receives the resolved outcome, the public projection, the facts the player learned
// this turn, and — when someone speaks — that character's knowledge and voice. Nothing
// else. It cannot see canonical truth, another character's knowledge, or any fact outside
// the resolved effects, because none of those are in the prompt.
//
// Its output is validated after generation (narrator.ts). On refusal, error, or a failed
// check it degrades to the scenario's authored fallback line, invisibly.

import Anthropic from '@anthropic-ai/sdk';

import type { NarrationRequest, Narrator } from '../narrator';
import { anthropicKey, YM_NARRATOR_MODEL } from '@/lib/yourmove/env';

const SYSTEM = `You are the prose layer of a crime-fiction simulation. You render what the
rules have already decided. You are not the referee and you never decide anything.

Absolute constraints:
- State only what you are given. Do not invent facts, people, objects, amounts, times,
  outcomes, or off-screen events. If it is not in the brief below, it did not happen.
- Name only the people and things listed as present.
- Never reveal, hint at, or speculate about who is guilty of anything. You have not been
  told, and guessing would be a lie.
- If a character speaks, they may only say things drawn from what they know, which is
  listed. A character with nothing to give deflects in their own voice; they do not
  suddenly produce information.
- Never break the fiction. No meta-commentary, no rules talk, no lists, no headings.

Style: hard-boiled but unshowy. Present tense. Two to five sentences, under 90 words.
Concrete physical detail over adjectives. Dialogue in double quotes. End on something
that leaves the player wanting to type again.`;

export function modelNarrator(): Narrator | null {
  const key = anthropicKey();
  if (!key) return null;
  const client = new Anthropic({ apiKey: key });

  return {
    async render(req: NarrationRequest) {
      const res = await client.messages.create({
        model: YM_NARRATOR_MODEL,
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: 'user', content: prompt(req) }],
      });
      const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
      return { text, model: YM_NARRATOR_MODEL, raw_output: text };
    },
  };
}

function prompt(req: NarrationRequest): string {
  const p = req.projection;
  const lines: string[] = [];

  lines.push(`WHERE\n  ${p.location?.name ?? 'somewhere'} — ${p.location?.description ?? ''}`);
  lines.push(`PRESENT\n${p.present.map((x) => `  ${x.name}`).join('\n') || '  nobody'}`);
  lines.push(`ON HAND\n${p.player_resources.map((r) => `  ${r.label}: ${r.amount}`).join('\n')}`);
  lines.push(`THE PLAYER TYPED\n  ${req.player_text}`);
  lines.push(`WHAT THE RULES DECIDED (${req.outcome})\n  ${req.summary}`);

  if (req.constraint)
    lines.push(
      `WHY IT WAS HARDER THAN THEY WANTED — the world says this, in world, and it must be ` +
        `in the passage\n  ${req.constraint}`,
    );

  if (req.revealed.length)
    lines.push(
      `WHAT THE PLAYER LEARNS THIS TURN — you may state these, and only these\n` +
        req.revealed.map((r) => `  ${r.from ? `${r.from} lets slip: ` : ''}${r.statement}`).join('\n'),
    );

  if (req.speaker) {
    const s = req.speaker;
    lines.push(
      `WHO SPEAKS\n  ${s.name}, ${s.role}\n  Voice: ${s.voice}\n  What drives them: ${s.motive}\n` +
        `  Everything they know (they cannot say anything else):\n` +
        (s.knows.length ? s.knows.map((k) => `    - ${k.statement}`).join('\n') : '    - nothing relevant'),
    );
  }

  if (req.authored_lines.length)
    lines.push(
      `ALSO HAPPENING — include these beats, keeping their sense intact\n` +
        req.authored_lines.map((l) => `  ${l}`).join('\n'),
    );

  lines.push('Write the passage. Nothing else.');
  return lines.join('\n\n');
}
