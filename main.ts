// One Word for the Boss — make.fun entry (program/v1).
//
// The entry is exactly ONE word describing the boss. A judge model reads
// two words at a time and picks the one that is funnier and truer about
// bosses, weighing in order: (1) a single word a person would actually
// use about the one they report to, (2) funny on its own, (3) rings true
// about a real habit of bosses, (4) fresh, not the first word anyone
// reaches for, (5) travels — works in a kitchen, a warehouse or an office.
//
// This program scores a shortlist of candidate words against that brief
// and writes the winner — one word, no newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  word: string;
  funny: number; // 1-5: lands on its own, repeatable at lunch
  truth: number; // 1-5: catches a real habit of bosses
  fresh: number; // 1-5: not the first word anyone reaches for
  travels: number; // 1-5: works in any workplace, no explanation needed
};

// The shortlist, brainstormed against the brief. The judge sees only the
// word, so a candidate only counts if the word lands with no caption.
// Why Octopus wins, in the brief's order:
//   - Single word about a boss: "my boss is an octopus" is exactly how
//     people talk about the one they report to.
//   - Funny: one image — tentacles in every pot, every project, every
//     chat — and colleagues repeat it at lunch because it lands.
//   - True: every boss has a hand in everything; the meddling is real.
//   - Fresh: nobody's first reach is an animal; "demanding", "strict"
//     and "workaholic" are the shrug words. Octopus surprises.
//   - Travels: a kitchen, a warehouse, an office — every workplace has
//     an octopus boss, no industry to explain.
// Runners-up lose on fresh or funny: Tornado is vivid but a familiar
// metaphor; Deadline is clever but a concept, not a person; Relentless
// is true but earnest, not funny; Omnipresent is funny but a mouthful
// nobody repeats at lunch; Blackhole is vivid but reads as two words.
const CANDIDATES: Candidate[] = [
  { word: "Octopus", funny: 5, truth: 5, fresh: 5, travels: 5 },
  { word: "Tornado", funny: 4, truth: 4, fresh: 3, travels: 4 },
  { word: "Deadline", funny: 4, truth: 3, fresh: 4, travels: 4 },
  { word: "Blackhole", funny: 4, truth: 4, fresh: 3, travels: 3 },
  { word: "Omnipresent", funny: 4, truth: 4, fresh: 4, travels: 3 },
  { word: "Relentless", funny: 2, truth: 5, fresh: 2, travels: 4 },
  { word: "Hurricane", funny: 3, truth: 4, fresh: 2, travels: 4 },
  { word: "Ghost", funny: 4, truth: 3, fresh: 3, travels: 3 },
  { word: "Midnight", funny: 3, truth: 3, fresh: 4, travels: 2 },
  { word: "Whirlwind", funny: 3, truth: 4, fresh: 3, travels: 4 },
  { word: "Firefighter", funny: 2, truth: 4, fresh: 2, travels: 3 },
  { word: "Taskmaster", funny: 2, truth: 4, fresh: 1, travels: 3 },
];

function score(c: Candidate): number {
  // Brief order: funny, then truth, then fresh, then travels.
  return c.funny * 4 + c.truth * 3 + c.fresh * 2 + c.travels;
}

function pickWinner(candidates: Candidate[]): string {
  // Stable sort: on a tied score the earlier-listed candidate wins,
  // so the shortlist is ordered best-first as a deliberate tie-break.
  const ranked = [...candidates].sort((a, b) => score(b) - score(a));
  return ranked[0].word;
}

// The gate, checked here exactly as the sealed scorer checks it:
// UTF-8 text, 1 to 30 characters, not only whitespace, a single word.
function assertValid(entry: string): void {
  if (entry.length < 1 || entry.length > 30) {
    throw new Error(`entry must be 1-30 characters, got ${entry.length}`);
  }
  if (entry.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (/\s/.test(entry)) {
    throw new Error("entry must be a single word with no spaces");
  }
}

const entry = pickWinner(CANDIDATES);
assertValid(entry);

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = `${outDir}/entry.txt`;
writeFileSync(outPath, entry, "utf8");

// Read back and verify: the file must equal the entry exactly.
const written = readFileSync(outPath, "utf8");
if (written !== entry) {
  throw new Error(`read-back mismatch: wrote ${JSON.stringify(entry)}, read ${JSON.stringify(written)}`);
}
console.log(`entry: ${entry} (${entry.length} characters) -> ${outPath}`);
