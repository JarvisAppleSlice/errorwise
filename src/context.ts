import * as vscode from 'vscode';
import * as path from 'path';
import { DiagnosticArgs, ErrorContext } from './types';

/** Lines of code shown around the problem line (before / after). */
const BEFORE = 6;
const AFTER = 4;

export function diagnosticToArgs(uri: vscode.Uri, d: vscode.Diagnostic): DiagnosticArgs {
  return {
    uri: uri.toString(),
    message: d.message,
    startLine: d.range.start.line,
    startCharacter: d.range.start.character,
    endLine: d.range.end.line,
    endCharacter: d.range.end.character,
    source: d.source,
    code: diagnosticCode(d),
  };
}

function diagnosticCode(d: vscode.Diagnostic): string | undefined {
  if (d.code === undefined) {
    return undefined;
  }
  return typeof d.code === 'object' ? String(d.code.value) : String(d.code);
}

/** Build context for a squiggle (diagnostic) in an open file. */
export async function contextFromDiagnostic(args: DiagnosticArgs): Promise<ErrorContext> {
  const uri = vscode.Uri.parse(args.uri);
  const doc = await vscode.workspace.openTextDocument(uri);
  return {
    message: args.message,
    languageId: doc.languageId,
    fileName: path.basename(doc.fileName),
    line: args.startLine + 1,
    codeSnippet: snippet(doc, args.startLine),
    diagnosticSource: args.source,
    diagnosticCode: args.code,
    uri: args.uri,
  };
}

/**
 * Build context from text the learner selected or copied, such as a
 * Python traceback from the terminal. If the text names a file and line
 * we can open, we include that code too.
 */
export async function contextFromText(text: string): Promise<ErrorContext> {
  const trimmed = text.trim();
  const ctx: ErrorContext = {
    message: lastMeaningfulLine(trimmed),
    fullOutput: trimmed,
  };

  const location = findLocation(trimmed);
  if (location) {
    try {
      const uri = await resolveFile(location.file);
      if (uri) {
        const doc = await vscode.workspace.openTextDocument(uri);
        ctx.languageId = doc.languageId;
        ctx.fileName = path.basename(doc.fileName);
        ctx.line = location.line;
        ctx.codeSnippet = snippet(doc, location.line - 1);
        ctx.uri = uri.toString();
      }
    } catch {
      // The file isn't reachable; the message alone will have to do.
    }
  }
  if (!ctx.languageId && /Traceback \(most recent call last\)|File ".+", line \d+/.test(trimmed)) {
    ctx.languageId = 'python';
  }
  return ctx;
}

/** Numbered lines around the problem, with the problem line marked ">>". */
export function snippet(doc: vscode.TextDocument, line0: number): string {
  const from = Math.max(0, line0 - BEFORE);
  const to = Math.min(doc.lineCount - 1, line0 + AFTER);
  const width = String(to + 1).length;
  const out: string[] = [];
  for (let i = from; i <= to; i++) {
    const marker = i === line0 ? '>>' : '  ';
    out.push(`${marker} ${String(i + 1).padStart(width)} | ${doc.lineAt(i).text}`);
  }
  return out.join('\n');
}

/** For a traceback, the error itself is the last non-empty line. */
function lastMeaningfulLine(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return text;
  }
  // JavaScript stack traces put the error first, then "at ..." lines.
  if (lines.slice(1).every((l) => l.startsWith('at '))) {
    return lines[0];
  }
  return lines[lines.length - 1];
}

/** Find the deepest "file + line" mentioned in an error output. */
function findLocation(text: string): { file: string; line: number } | undefined {
  // Python: File "/path/app.py", line 12, in main  (the last one is where it broke)
  const py = [...text.matchAll(/File "([^"]+)", line (\d+)/g)];
  if (py.length > 0) {
    const last = py[py.length - 1];
    return { file: last[1], line: Number(last[2]) };
  }
  // Node: at fn (/path/app.js:12:5)   (the first one is where it broke)
  const js = text.match(/\(?((?:[A-Za-z]:)?[^\s():]+\.(?:js|ts|mjs|cjs|jsx|tsx)):(\d+):\d+\)?/);
  if (js) {
    return { file: js[1], line: Number(js[2]) };
  }
  return undefined;
}

async function resolveFile(file: string): Promise<vscode.Uri | undefined> {
  if (path.isAbsolute(file)) {
    return vscode.Uri.file(file);
  }
  const found = await vscode.workspace.findFiles(`**/${file.replace(/^\.\//, '')}`, '**/node_modules/**', 1);
  return found[0];
}
