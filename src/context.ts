import * as vscode from 'vscode';
import * as path from 'path';
import { findLocation, lastMeaningfulLine } from './traceback';
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
    related: relatedLines(uri, d),
  };
}

/**
 * Other lines the checker says are part of this error, like where a name is declared.
 * Skips the error's own line, and the language's built-in library files
 * (such as TypeScript's lib.es5.d.ts), which would only confuse a learner.
 */
function relatedLines(uri: vscode.Uri, d: vscode.Diagnostic): DiagnosticArgs['related'] {
  const related = (d.relatedInformation ?? [])
    .filter((r) => !/node_modules|\.d\.ts$|\.pyi$/.test(r.location.uri.path))
    .filter((r) => r.location.uri.toString() !== uri.toString() || r.location.range.start.line !== d.range.start.line)
    .slice(0, 3)
    .map((r) => ({ uri: r.location.uri.toString(), line: r.location.range.start.line, message: r.message }));
  return related.length > 0 ? related : undefined;
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
    codeLine: lineText(doc, args.startLine),
    diagnosticSource: args.source,
    diagnosticCode: args.code,
    uri: args.uri,
    related: args.related?.map((r) => ({
      uri: r.uri,
      line: r.line + 1,
      fileName: path.basename(vscode.Uri.parse(r.uri).fsPath),
      note: r.message,
    })),
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
        ctx.codeLine = lineText(doc, location.line - 1);
        ctx.uri = uri.toString();
      }
    } catch {
      // The file isn't reachable; the message alone will have to do.
    }
  }
  if (!ctx.languageId && /Traceback \(most recent call last\)|File ".+", line \d+/.test(trimmed)) {
    ctx.languageId = 'python';
  }
  if (!ctx.languageId && /\.cs:line \d+/.test(trimmed)) {
    ctx.languageId = 'csharp';
  }
  return ctx;
}

/** The text of one line (0-based), or undefined if the file is shorter than that. */
function lineText(doc: vscode.TextDocument, line0: number): string | undefined {
  return line0 >= 0 && line0 < doc.lineCount ? doc.lineAt(line0).text : undefined;
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

async function resolveFile(file: string): Promise<vscode.Uri | undefined> {
  if (file.startsWith('file://')) {
    return vscode.Uri.parse(file);
  }
  if (path.isAbsolute(file)) {
    return vscode.Uri.file(file);
  }
  const found = await vscode.workspace.findFiles(`**/${file.replace(/^\.\//, '')}`, '**/node_modules/**', 1);
  return found[0];
}
