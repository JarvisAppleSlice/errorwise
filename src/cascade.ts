/**
 * Finds the earlier mistake that may have caused an error.
 *
 * One mistake often sets off a chain of errors after it. In C#, `nnew Product { Id = 1 }`
 * gives a real error on `nnew`, then more on `Product`, `Id` and the closing brace,
 * because the compiler misreads everything after the typo. Those later errors are
 * "knock-on" errors: fix the first one and they usually disappear.
 *
 * This file must NOT import 'vscode' so it can be unit-tested with plain Node.
 */

/** Where an error is and what it says. Lines and characters are 0-based, like VS Code's. */
export interface ErrorSpot {
  line: number;
  character: number;
  endLine: number;
  endCharacter: number;
  message: string;
  /** True for red errors; warnings and hints never start a chain. */
  isError: boolean;
}

/** Errors this many lines apart or closer count as part of the same chain. */
const MAX_GAP = 2;
/** Never look further back than this many lines. */
const MAX_REACH = 25;

/**
 * Messages that mean the compiler couldn't read the code: "; expected", "Syntax error",
 * "Expected expression", '"(" was not closed'. Only this kind of confusion makes the compiler
 * misread the code after it. "Expected 2 arguments" is about values, not reading, so the
 * digit after "Expected" rules it out.
 */
const SYNTAX = /expected\.?$|^Expected (?!\d)|syntax error|invalid expression term|unexpected token|was not closed|unterminated|invalid character/i;

/** True when the message says the compiler couldn't read the code there. */
export function isSyntaxError(message: string): boolean {
  return SYNTAX.test(message.trim());
}

/**
 * The first error in the chain of errors leading up to `target`, if there is one.
 *
 * Walks backwards from the target through errors that sit close together, and
 * returns the earliest one. An unrelated error further up the file is left alone,
 * because a gap of more than a couple of lines breaks the chain.
 *
 * A chain needs at least one syntax error in it. Two type errors side by side, like
 * `function lineTotal(price, quantity)` with no types on either, are separate
 * mistakes: fixing `price` does nothing for `quantity`.
 */
export function findEarlierError<T extends ErrorSpot>(target: ErrorSpot, all: T[]): T | undefined {
  const isBefore = (a: ErrorSpot, b: ErrorSpot) => a.line < b.line || (a.line === b.line && a.character < b.character);

  // Errors before the target, nearest first.
  const before = all
    .filter((d) => d.isError && isBefore(d, target) && target.line - d.line <= MAX_REACH)
    .sort((a, b) => b.line - a.line || b.character - a.character);

  let root: T | undefined;
  let reachedLine = target.line;
  for (const d of before) {
    if (reachedLine - d.line > MAX_GAP) {
      break;
    }
    root = d;
    reachedLine = d.line;
  }

  // Any syntax error on the chain's lines counts, even one at the same spot as the target
  // (C# puts "',' expected" and "'Product' is a type..." on the very same character).
  const hasSyntaxError =
    isSyntaxError(target.message) ||
    all.some((d) => d.isError && d.line >= reachedLine && d.line <= target.line && isSyntaxError(d.message));
  return hasSyntaxError ? root : undefined;
}
