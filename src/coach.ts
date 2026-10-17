import * as vscode from 'vscode';
import { AiUnavailableError, explainWithAI, log } from './ai';
import { GENERAL, matchError } from './knowledge';
import { PanelState, referenceLines, renderHtml } from './render';
import { ErrorContext, Explanation, RelatedLine } from './types';

/**
 * Shows explanations in a side panel.
 * Flow: show the built-in guide right away (if there is one),
 * then replace it with an AI explanation tailored to the learner's code.
 */
export class Coach implements vscode.Disposable {
  private panel?: vscode.WebviewPanel;
  private state?: PanelState;
  private request?: vscode.CancellationTokenSource;
  /** Avoid asking the AI twice for the same error on the same code. */
  private cache = new Map<string, Explanation>();

  /** The extension's context: its install folder (for the icon), secret storage (for an API key) and saved state. */
  constructor(private readonly context: vscode.ExtensionContext) {}

  async explain(ctx: ErrorContext, opts: { differentMetaphor?: boolean } = {}): Promise<void> {
    this.request?.cancel();
    const request = (this.request = new vscode.CancellationTokenSource());

    const config = vscode.workspace.getConfiguration('errorwise');
    const useAI = config.get<boolean>('useAI', true);
    const known = matchError(ctx);
    if (!known) {
      void rememberUnmatched(this.context.globalState, ctx.message);
    }
    const cacheKey = `${ctx.message}\n${ctx.codeSnippet ?? ''}`;
    const previous = opts.differentMetaphor ? this.state?.explanation : undefined;

    // 1. Show something useful immediately.
    const cached = !opts.differentMetaphor ? this.cache.get(cacheKey) : undefined;
    this.show({
      ctx,
      explanation: previous ?? cached ?? known?.explanation ?? (useAI ? undefined : GENERAL),
      loading: useAI && !cached,
      canRetry: useAI,
      notice: useAI ? undefined : 'AI explanations are turned off, so this is the built-in guide. You can turn them on in Settings → Errorwise.',
    });
    if (!useAI || cached) {
      return;
    }

    // 2. Ask the AI for a version tailored to this code.
    try {
      const explanation = await explainWithAI(
        ctx,
        {
          experienceLevel: config.get<string>('experienceLevel', 'brand new'),
          metaphorTheme: config.get<string>('metaphorTheme', 'anything relatable'),
          teacherHint: opts.differentMetaphor ? undefined : known?.explanation.metaphor,
          avoidMetaphor: previous?.metaphor,
        },
        request.token,
        this.context
      );
      if (request.token.isCancellationRequested) {
        return;
      }
      this.cache.set(cacheKey, explanation);
      this.show({ ctx, explanation, loading: false, canRetry: true });
    } catch (err) {
      if (request.token.isCancellationRequested) {
        return;
      }
      log.appendLine(`No AI explanation: ${err instanceof Error ? err.message : String(err)}`);
      const reason =
        err instanceof AiUnavailableError
          ? err.message
          : "The AI explanation didn't come through this time, so here's the built-in one. Try again in a moment.";
      this.show({
        ctx,
        explanation: previous ?? known?.explanation ?? GENERAL,
        loading: false,
        canRetry: !(err instanceof AiUnavailableError),
        notice: reason,
      });
    }
  }

  private show(state: PanelState): void {
    this.state = state;
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        'errorwise',
        'Errorwise',
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        { enableScripts: true, localResourceRoots: [] }
      );
      this.panel.iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'images', 'icon.png');
      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.request?.cancel();
      });
      this.panel.webview.onDidReceiveMessage((msg) => this.onMessage(msg));
    } else if (!this.panel.visible) {
      this.panel.reveal(vscode.ViewColumn.Beside, true);
    }
    this.panel.webview.html = renderHtml(state, { nonce: nonce(), cspSource: this.panel.webview.cspSource });
  }

  private async onMessage(msg: { action?: string; index?: number }): Promise<void> {
    const ctx = this.state?.ctx;
    if (!ctx) {
      return;
    }
    if (msg.action === 'anotherMetaphor') {
      await this.explain(ctx, { differentMetaphor: true });
    } else if (msg.action === 'goToLine' && ctx.uri && ctx.line) {
      await openAt(ctx.uri, ctx.line);
    } else if (msg.action === 'goToRelated') {
      const related = referenceLines(ctx)[msg.index ?? -1];
      if (related) {
        await openAt(related.uri, related.line, related);
      }
    }
  }

  dispose(): void {
    this.request?.cancel();
    this.panel?.dispose();
  }
}

/** Saved list of error messages that had no built-in guide, to help decide which guides to write next. */
export const UNMATCHED_KEY = 'errorwise.unmatchedErrors';
const UNMATCHED_LIMIT = 50;

/**
 * Remember the first line of an error that had no built-in guide.
 * Stays on this computer (VS Code's own storage) and is only shared if the learner copies it.
 */
async function rememberUnmatched(state: vscode.Memento, message: string): Promise<void> {
  const firstLine = message.split(/\r?\n/)[0].trim().slice(0, 300);
  if (!firstLine) {
    return;
  }
  const list = state.get<string[]>(UNMATCHED_KEY, []).filter((m) => m !== firstLine);
  await state.update(UNMATCHED_KEY, [firstLine, ...list].slice(0, UNMATCHED_LIMIT));
}

/**
 * Open a file in the main editor at a line (1-based). When `spot` says which part of the
 * line, that part is highlighted, like the `nnew` in `nnew Product`.
 */
async function openAt(uri: string, line: number, spot?: Pick<RelatedLine, 'column' | 'endLine' | 'endColumn'>): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(uri));
  const start = new vscode.Position(line - 1, spot?.column ?? 0);
  const end = spot?.endLine !== undefined && spot.endColumn !== undefined ? new vscode.Position(spot.endLine - 1, spot.endColumn) : start;
  await vscode.window.showTextDocument(doc, {
    viewColumn: vscode.ViewColumn.One,
    selection: new vscode.Range(start, end),
  });
}

function nonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 32; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}
