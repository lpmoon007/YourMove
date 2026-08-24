// Speaking instead of typing: the part of it that is pure text.
//
// Speech recognition is good at English sentences and bad at names it has never heard.
// "ask Dez what he saw" comes back as "ask Des what he saw" often enough that voice is
// unusable without this, because the intent parser matches a name as a whole word: one
// wrong letter and the action has no target.
//
// So a heard word that is nearly one of the names in the room is snapped to that name —
// and then shown in the box, where the player can see it and fix it before anything is
// sent. That placement is the point. The engine never silently retargets an action; the
// correction happens in front of the person making it.

/** How far apart two words are, in single-character edits. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      row[j] = Math.min(
        prev[j]! + 1,
        row[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[b.length]!;
}

/**
 * Deliberately tight. A snap the player did not want is worse than a miss they can see
 * and retype, so a candidate has to start with the same letter and be within one edit
 * for a short name, two for a longer one.
 */
function nearlyTheSame(heard: string, name: string): boolean {
  if (heard === name) return false;
  if (heard.length < 3 || name.length < 3) return false;
  if (heard[0] !== name[0]) return false;
  return editDistance(heard, name) <= (name.length <= 4 ? 1 : 2);
}

/**
 * Snap near-misses in a heard sentence to the names actually in the room.
 *
 * `names` is whatever the interface is already showing the player — the cast list — so
 * this knows nothing about any particular world.
 */
export function snapNames(heard: string, names: string[]): string {
  const targets = names
    .flatMap((n) => [n, n.split(' ')[0] ?? n])
    .map((n) => n.trim())
    .filter((n) => n.length >= 3);
  if (!targets.length) return heard;

  return heard.replace(/[\p{L}']+/gu, (word) => {
    const lower = word.toLowerCase();
    // Already right, in any casing: leave it alone.
    if (targets.some((t) => t.toLowerCase() === lower)) return word;

    let best: { name: string; distance: number } | null = null;
    for (const name of targets) {
      if (!nearlyTheSame(lower, name.toLowerCase())) continue;
      const distance = editDistance(lower, name.toLowerCase());
      if (!best || distance < best.distance) best = { name, distance };
      // Two names equally close is ambiguous, and guessing between them is worse than
      // leaving the word as it was heard.
      else if (distance === best.distance && best.name !== name) best = { name: word, distance: -1 };
    }
    return best && best.distance >= 0 ? best.name : word;
  });
}

/**
 * What the recognizer hands back is a raw utterance: no capital, no full stop, and
 * sometimes a trailing filler word. The composer wants a sentence a person would type.
 */
export function tidyUtterance(heard: string): string {
  return heard.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim();
}
