import * as vscode from 'vscode';
import { Coach } from './coach';
import { contextFromDiagnostic, contextFromText, diagnosticToArgs } from './context';
import { matchKnown } from './knowledge';
import { DiagnosticArgs } from './types';

const FILES: vscode.DocumentSelector = [{ scheme: 'file' }, { scheme: 'untitled' }];

export function activate(context: vscode.ExtensionContext): void {
  const coach = new Coach(context.extensionUri);

  context.subscriptions.push(
    coach,

    // Used by the hover link and the lightbulb.
    vscode.commands.registerCommand('errorwise.explainDiagnostic', async (args?: DiagnosticArgs) => {
      if (!args) {
        return vscode.commands.executeCommand('errorwise.explainAtCursor');
      }
      await coach.explain(await contextFromDiagnostic(args));
    }),

    // Ctrl+Alt+E, right-click menu, or Command Palette.
    vscode.commands.registerCommand('errorwise.explainAtCursor', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.commands.executeCommand('errorwise.explainText');
      }
      const pos = editor.selection.active;
      const onLine = vscode.languages
        .getDiagnostics(editor.document.uri)
        .filter((d) => d.range.start.line <= pos.line && d.range.end.line >= pos.line)
        .sort((a, b) => a.severity - b.severity); // errors first

      if (onLine.length === 0) {
        if (!editor.selection.isEmpty) {
          return vscode.commands.executeCommand('errorwise.explainText');
        }
        vscode.window.showInformationMessage(
          'No problems on this line. 🎉 To explain an error from the terminal, select it, right-click, and choose "Errorwise: Explain this error".'
        );
        return;
      }

      let chosen = onLine[0];
      if (onLine.length > 1) {
        const pick = await vscode.window.showQuickPick(
          onLine.map((d) => ({ label: friendlyLabel(d.message), detail: d.message, d })),
          { placeHolder: 'There are a few problems on this line. Which one should I explain?' }
        );
        if (!pick) {
          return;
        }
        chosen = pick.d;
      }
      await coach.explain(await contextFromDiagnostic(diagnosticToArgs(editor.document.uri, chosen)));
    }),

    // Explain selected text, or whatever error is on the clipboard.
    vscode.commands.registerCommand('errorwise.explainText', async () => {
      const editor = vscode.window.activeTextEditor;
      let text = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : '';
      if (!text.trim()) {
        text = await vscode.env.clipboard.readText();
      }
      if (!text.trim() || text.length > 20000) {
        text =
          (await vscode.window.showInputBox({
            prompt: 'Paste the error message you want explained',
            placeHolder: "e.g. NameError: name 'totl' is not defined",
            ignoreFocusOut: true,
          })) ?? '';
      }
      if (text.trim()) {
        await coach.explain(await contextFromText(text));
      }
    }),

    // Right-click in the terminal.
    vscode.commands.registerCommand('errorwise.explainTerminalSelection', async () => {
      await vscode.commands.executeCommand('workbench.action.terminal.copySelection');
      const text = await vscode.env.clipboard.readText();
      if (!text.trim()) {
        vscode.window.showInformationMessage('Select the error text in the terminal first, then right-click → "Errorwise: Explain this error".');
        return;
      }
      await coach.explain(await contextFromText(text));
    }),

    vscode.languages.registerCodeActionsProvider(FILES, new ExplainCodeActions(), {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    }),

    vscode.languages.registerHoverProvider(FILES, new ExplainHover())
  );
}

export function deactivate(): void {}

/** Adds "Explain this simply" to the lightbulb menu on every problem. */
class ExplainCodeActions implements vscode.CodeActionProvider {
  provideCodeActions(doc: vscode.TextDocument, _range: vscode.Range, ctx: vscode.CodeActionContext): vscode.CodeAction[] {
    return ctx.diagnostics.slice(0, 3).map((d) => {
      const action = new vscode.CodeAction(`🎓 Explain simply: ${friendlyLabel(d.message)}`, vscode.CodeActionKind.QuickFix);
      action.command = {
        command: 'errorwise.explainDiagnostic',
        title: 'Explain this error simply',
        arguments: [diagnosticToArgs(doc.uri, d)],
      };
      action.diagnostics = [d];
      action.isPreferred = false;
      return action;
    });
  }
}

/** Adds an "Explain simply" link to the hover popup on problems. */
class ExplainHover implements vscode.HoverProvider {
  provideHover(doc: vscode.TextDocument, pos: vscode.Position): vscode.Hover | undefined {
    if (!vscode.workspace.getConfiguration('errorwise').get<boolean>('showHoverLink', true)) {
      return undefined;
    }
    const diags = vscode.languages.getDiagnostics(doc.uri).filter((d) => d.range.contains(pos));
    if (diags.length === 0) {
      return undefined;
    }
    const md = new vscode.MarkdownString(undefined, true);
    md.isTrusted = { enabledCommands: ['errorwise.explainDiagnostic'] };
    for (const d of diags.slice(0, 3)) {
      const args = encodeURIComponent(JSON.stringify([diagnosticToArgs(doc.uri, d)]));
      md.appendMarkdown(`$(mortar-board) [Explain simply: ${escapeMd(friendlyLabel(d.message))}](command:errorwise.explainDiagnostic?${args})\n\n`);
    }
    return new vscode.Hover(md);
  }
}

/** Short plain-language label for a problem, using the built-in guide when it has one. */
function friendlyLabel(message: string): string {
  const known = matchKnown(message);
  if (known) {
    return known.explanation.title;
  }
  const first = message.split('\n')[0];
  return first.length > 60 ? first.slice(0, 57) + '…' : first;
}

function escapeMd(s: string): string {
  return s.replace(/[\\`*_{}\[\]()#+\-.!|]/g, '\\$&');
}
