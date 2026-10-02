/**
 * Reads error output that a learner copied from the terminal:
 * finds the line that states the error, and the file and line it points at.
 *
 * This file must NOT import 'vscode' so it can be unit-tested with plain Node.
 */

const SCRIPT_FILE = String.raw`\.(?:js|ts|mjs|cjs|jsx|tsx)`;

/** The one line of an error output that says what went wrong. */
export function lastMeaningfulLine(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return text;
  }
  // JavaScript, C# and Java list "at ..." lines AFTER the error, and Node adds
  // its version number at the very end. The error is stated before the first "at".
  const firstAt = lines.findIndex((l) => l.startsWith('at '));
  if (firstAt > 0) {
    const before = lines.slice(0, firstAt);
    const named = [...before].reverse().find((l) => /^(?:Uncaught )?[\w.]*(?:Error|Exception)\b/.test(l));
    return named ?? before[before.length - 1];
  }
  // Python puts the error on the last line of the traceback.
  return lines[lines.length - 1];
}

/** Find the deepest "file + line" mentioned in an error output. */
export function findLocation(text: string): { file: string; line: number } | undefined {
  // Python: File "/path/app.py", line 12, in main  (the last one is where it broke)
  const py = [...text.matchAll(/File "([^"]+)", line (\d+)/g)];
  if (py.length > 0) {
    const last = py[py.length - 1];
    return { file: last[1], line: Number(last[2]) };
  }
  // Node: at fn (C:\My Code\app.js:12:5)  or  at C:\My Code\app.js:12:5
  // The first one is where it broke. Folder names may contain spaces.
  const frames = [
    ...text.matchAll(new RegExp(String.raw`\(([^()\n]+?${SCRIPT_FILE}):(\d+):\d+\)`, 'g')),
    ...text.matchAll(new RegExp(String.raw`^\s*at ([^()\n]+?${SCRIPT_FILE}):(\d+):\d+\s*$`, 'gm')),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  // Prefer the learner's own code over a library's.
  const frame = frames.find((f) => !f[1].includes('node_modules')) ?? frames[0];
  if (frame) {
    return { file: frame[1].trim(), line: Number(frame[2]) };
  }
  // Anything else that looks like app.js:12:5
  const loose = text.match(new RegExp(String.raw`((?:[A-Za-z]:)?[^\s():]+${SCRIPT_FILE}):(\d+):\d+`));
  return loose ? { file: loose[1], line: Number(loose[2]) } : undefined;
}
