import * as vscode from 'vscode';
import { AiUnavailableError, explainWithAI } from './ai';
import { GENERAL, matchKnown } from './knowledge';
import { PanelState, renderHtml } from './render';
import { ErrorContext, Explanation } from './types';

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

  /** extensionUri is the folder the extension is installed in, used to find the icon. */
  constructor(private readonly extensionUri: vscode.Uri) {}

  async explain(ctx: ErrorContext, opts: { differentMetaphor?: boolean } = {}): Promise<void> {
    this.request?.cancel();
    const request = (this.request = new vscode.CancellationTokenSource());

    const config = vscode.workspace.getConfiguration('codeCoach');
    const useAI = config.get<boolean>('useAI', true);
    const known = matchKnown(ctx.message, ctx.fullOutput);
    const cacheKey = `${ctx.message}\n${ctx.codeSnippet ?? ''}`;
    const previous = opts.differentMetaphor ? this.state?.explanation : undefined;

    // 1. Show something useful immediately.
    const cached = !opts.differentMetaphor ? this.cache.get(cacheKey) : undefined;
    this.show({
      ctx,
      explanation: previous ?? cached ?? known?.explanation ?? (useAI ? undefined : GENERAL),
      loading: useAI && !cached,
      canRetry: useAI,
      notice: useAI ? undefined : 'AI explanations are turned off, so this is the built-in guide. You can turn them on in Settings → Code Coach.',
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
        request.token
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
        'codeCoach',
        'Code Coach',
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        { enableScripts: true, localResourceRoots: [] }
      );
      this.panel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'images', 'icon.png');
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

  private async onMessage(msg: { action?: string }): Promise<void> {
    const ctx = this.state?.ctx;
    if (!ctx) {
      return;
    }
    if (msg.action === 'anotherMetaphor') {
      await this.explain(ctx, { differentMetaphor: true });
    } else if (msg.action === 'goToLine' && ctx.uri && ctx.line) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(ctx.uri));
      const pos = new vscode.Position(ctx.line - 1, 0);
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.One,
        selection: new vscode.Range(pos, pos),
      });
    }
  }

  dispose(): void {
    this.request?.cancel();
    this.panel?.dispose();
  }
}

function nonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 32; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}
