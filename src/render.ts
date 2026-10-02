/**
 * Builds the HTML for the explanation panel.
 * No 'vscode' import, so the page can be previewed or tested outside VS Code.
 */
import { ErrorContext, Explanation } from './types';

export interface PanelState {
  ctx: ErrorContext;
  explanation?: Explanation;
  /** True while waiting for the AI. */
  loading: boolean;
  /** A short note to show at the top (e.g. why AI wasn't used). */
  notice?: string;
  /** Whether "Try a different metaphor" can work (needs AI). */
  canRetry: boolean;
}

export function renderHtml(state: PanelState, opts: { nonce: string; cspSource: string }): string {
  const { ctx, explanation: ex } = state;
  const body = ex ? renderExplanation(ex, state) : renderLoadingOnly();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${opts.cspSource} 'unsafe-inline'; script-src 'nonce-${opts.nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Code Coach</title>
<style>${CSS}</style>
</head>
<body>
<main>
  ${state.notice ? `<p class="notice">${inline(state.notice)}</p>` : ''}
  ${body}
  <details class="original">
    <summary>Original message${ctx.line ? ` · line ${ctx.line}` : ''}${ctx.fileName ? ` · ${esc(ctx.fileName)}` : ''}</summary>
    <pre>${esc(ctx.fullOutput ?? ctx.message)}</pre>
  </details>
</main>
<script nonce="${opts.nonce}">
  const vscode = acquireVsCodeApi();
  document.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', () => vscode.postMessage({ action: el.dataset.action }));
  });
  document.querySelectorAll('.steps input').forEach((box) => {
    box.addEventListener('change', () => box.closest('li').classList.toggle('done', box.checked));
  });
</script>
</body>
</html>`;
}

function renderExplanation(ex: Explanation, state: PanelState): string {
  const badge =
    ex.source === 'ai'
      ? '<span class="badge ai">Tailored to your code</span>'
      : ex.source === 'built-in'
        ? '<span class="badge">Quick guide</span>'
        : '<span class="badge">General tips</span>';

  const loading = state.loading
    ? `<p class="loading" role="status"><span class="dot"></span>Writing an explanation that fits your code…</p>`
    : '';

  const steps = ex.steps
    .map(
      (s, i) =>
        `<li><label><input type="checkbox" aria-label="Mark step ${i + 1} done"><span class="num">${i + 1}</span><span class="text">${inline(s)}</span></label></li>`
    )
    .join('');

  const fix = ex.fix
    ? `<details class="fix">
        <summary>Stuck? Show me the fix</summary>
        <p>${inline(ex.fix.explanation)}</p>
        ${ex.fix.code ? `<pre><code>${esc(ex.fix.code)}</code></pre>` : ''}
      </details>`
    : '';

  const actions = [
    state.ctx.uri && state.ctx.line ? `<button data-action="goToLine">Go to line ${state.ctx.line}</button>` : '',
    state.canRetry && !state.loading ? `<button class="secondary" data-action="anotherMetaphor">Explain it a different way</button>` : '',
  ].join('');

  return `
  <header>
    ${badge}
    <h1>${inline(ex.title)}</h1>
  </header>
  ${loading}
  <section>
    <h2>What happened</h2>
    <p>${inline(ex.whatHappened)}</p>
  </section>
  <section class="metaphor">
    <h2><span aria-hidden="true">💡</span> Think of it like this</h2>
    <p>${inline(ex.metaphor)}</p>
  </section>
  <section>
    <h2>How to fix it</h2>
    <ol class="steps">${steps}</ol>
    ${fix}
  </section>
  ${ex.remember ? `<p class="remember"><strong>Remember:</strong> ${inline(ex.remember)}</p>` : ''}
  ${actions ? `<div class="actions">${actions}</div>` : ''}`;
}

function renderLoadingOnly(): string {
  return `<p class="loading big" role="status"><span class="dot"></span>Reading the error and thinking of a good way to explain it…</p>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Escape text, then turn `backticks` into <code>. */
export function inline(s: string): string {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
}

const CSS = `
:root { --gap: 18px; }
body {
  font-family: var(--vscode-font-family);
  font-size: calc(var(--vscode-font-size) * 1.08);
  line-height: 1.6;
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
  padding: 0 16px;
}
main { max-width: 640px; margin: 0 auto; padding: 20px 0 40px; }
header { margin-bottom: 8px; }
h1 { font-size: 1.45em; line-height: 1.3; margin: 8px 0 4px; font-weight: 600; }
h2 {
  font-size: 0.78em; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--vscode-descriptionForeground); margin: 0 0 6px; font-weight: 600;
}
section { margin-top: var(--gap); }
p { margin: 0; }
code {
  font-family: var(--vscode-editor-font-family);
  font-size: 0.92em;
  background: var(--vscode-textCodeBlock-background);
  padding: 1px 5px; border-radius: 4px;
}
pre {
  font-family: var(--vscode-editor-font-family);
  background: var(--vscode-textCodeBlock-background);
  padding: 10px 12px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; margin: 8px 0 0;
}
pre code { background: none; padding: 0; }
.badge {
  display: inline-block; font-size: 0.75em; padding: 2px 9px; border-radius: 999px;
  background: var(--vscode-badge-background); color: var(--vscode-badge-foreground);
}
.badge.ai { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
.metaphor {
  background: color-mix(in srgb, var(--vscode-editorInfo-foreground, #3794ff) 10%, transparent);
  border-left: 3px solid var(--vscode-editorInfo-foreground, #3794ff);
  padding: 12px 14px; border-radius: 0 8px 8px 0;
}
.metaphor h2 { color: var(--vscode-foreground); }
.steps { list-style: none; padding: 0; margin: 0; }
.steps li { margin: 0 0 8px; }
.steps label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
.steps input { position: absolute; opacity: 0; pointer-events: none; }
.steps .num {
  flex: none; width: 24px; height: 24px; border-radius: 50%; margin-top: 1px;
  display: inline-flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: 600;
  border: 1.5px solid var(--vscode-button-background); color: var(--vscode-foreground);
}
.steps input:focus-visible + .num { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
.steps li.done .num { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
.steps li.done .num::before { content: "✓"; }
.steps li.done .num { font-size: 0; }
.steps li.done .num::before { font-size: 13px; }
.steps li.done .text { opacity: 0.6; text-decoration: line-through; }
details summary { cursor: pointer; color: var(--vscode-textLink-foreground); }
.fix { margin-top: 12px; }
.fix p { margin-top: 8px; }
.remember {
  margin-top: var(--gap); padding: 10px 14px; border-radius: 8px;
  border: 1px dashed var(--vscode-panel-border, var(--vscode-descriptionForeground));
}
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: var(--gap); }
button {
  font: inherit; font-size: 0.92em; padding: 6px 14px; border-radius: 4px; border: none; cursor: pointer;
  background: var(--vscode-button-background); color: var(--vscode-button-foreground);
}
button:hover { background: var(--vscode-button-hoverBackground); }
button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
.notice {
  font-size: 0.9em; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px;
  background: var(--vscode-inputValidation-infoBackground, transparent);
  border: 1px solid var(--vscode-inputValidation-infoBorder, var(--vscode-panel-border));
}
.loading { display: flex; align-items: center; gap: 8px; color: var(--vscode-descriptionForeground); font-size: 0.9em; margin-top: 6px; }
.loading.big { font-size: 1em; margin-top: 30px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--vscode-progressBar-background, currentColor); animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.25; } }
@media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
.original { margin-top: 28px; font-size: 0.88em; }
.original summary { color: var(--vscode-descriptionForeground); }
`;
