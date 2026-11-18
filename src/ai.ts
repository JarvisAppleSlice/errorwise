import type AnthropicClient from '@anthropic-ai/sdk';
import * as vscode from 'vscode';
import { ErrorContext, Explanation } from './types';
import { MAX_MODEL_TRIES, isOutOfQuota, orderModels } from './models';
import { AiOptions, buildPrompt, findBannedWords, parseExplanation } from './prompt';

export type { AiOptions };

/** Where the learner's Anthropic API key is kept: VS Code's encrypted secret storage, never settings. */
export const API_KEY_SECRET = 'errorwise.anthropicApiKey';

/** Thrown when no AI model can be used. The message is shown to the learner. */
export class AiUnavailableError extends Error {}

/** Details of what the AI part did, for working out why an explanation didn't arrive. View → Output → Errorwise. */
export const log = vscode.window.createOutputChannel('Errorwise');

/** Saved id of the VS Code model that answered last time, so it is tried first next time. */
const LAST_MODEL_KEY = 'errorwise.lastWorkingModel';

/**
 * Ask an AI model for a tailored, beginner-friendly explanation.
 * Uses GitHub Copilot (or another VS Code AI model) first, then the learner's
 * own Anthropic API key, depending on the errorwise.aiProvider setting.
 */
export async function explainWithAI(
  ctx: ErrorContext,
  options: AiOptions,
  token: vscode.CancellationToken,
  context: vscode.ExtensionContext
): Promise<Explanation> {
  const config = vscode.workspace.getConfiguration('errorwise');
  const provider = config.get<string>('aiProvider', 'auto');
  const prompt = buildPrompt(ctx, options);
  const apiKey = provider === 'copilot' ? undefined : await context.secrets.get(API_KEY_SECRET);

  let vsCodeFailure: unknown;
  if (provider !== 'anthropic') {
    try {
      const explanation = await askVsCodeModels(prompt, token, context.globalState);
      if (explanation) {
        return explanation;
      }
    } catch (err) {
      // With an API key to fall back on, a Copilot problem isn't the end of the road.
      if (!apiKey || token.isCancellationRequested) {
        throw err;
      }
      vsCodeFailure = err;
    }
    if (provider === 'copilot') {
      throw new AiUnavailableError(
        'No AI model is available, so this is the built-in explanation. Install and sign in to GitHub Copilot (the free plan works) to get explanations tailored to your code.'
      );
    }
  }

  if (apiKey) {
    const model = config.get<string>('anthropicModel', 'claude-opus-5-5').trim() || 'claude-opus-5-5';
    log.appendLine(`Asking Anthropic (${model})${vsCodeFailure ? ' because the VS Code models failed' : ''}.`);
    return reportBannedWords(model, parseExplanation(await askAnthropic(apiKey, model, prompt, token)));
  }

  throw new AiUnavailableError(
    provider === 'anthropic'
      ? 'There is no Anthropic API key yet, so this is the built-in explanation. Run "Errorwise: Add an Anthropic API key" from the Command Palette to add one.'
      : 'No AI model is available, so this is the built-in explanation. Install and sign in to GitHub Copilot (the free plan works), or add your own Anthropic API key, to get explanations tailored to your code.'
  );
}

/**
 * parseExplanation already removed banned words like "just". Words it can't remove safely,
 * like "easy", are written to the Output channel so you can see how often models use them.
 */
function reportBannedWords(modelId: string, explanation: Explanation): Explanation {
  const words = findBannedWords(explanation);
  if (words.length > 0) {
    log.appendLine(`${modelId} used a banned word the extension can't remove: ${words.join(', ')}.`);
  }
  return explanation;
}

/**
 * Ask the AI models inside VS Code (such as Copilot), one after another, until one answers.
 * Returns undefined when VS Code has no models at all.
 */
async function askVsCodeModels(prompt: string, token: vscode.CancellationToken, memory: vscode.Memento): Promise<Explanation | undefined> {
  // Prefer Copilot; fall back to any model another extension provides.
  let models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
  if (models.length === 0) {
    models = await vscode.lm.selectChatModels();
  }
  if (models.length === 0) {
    return undefined;
  }

  let lastError: unknown;
  for (const model of orderModels(models, memory.get<string>(LAST_MODEL_KEY)).slice(0, MAX_MODEL_TRIES)) {
    try {
      const explanation = parseExplanation(await askVsCodeModel(model, prompt, token));
      log.appendLine(`${model.id} answered.`);
      void memory.update(LAST_MODEL_KEY, model.id);
      return reportBannedWords(model.id, explanation);
    } catch (err) {
      if (token.isCancellationRequested) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      log.appendLine(`${model.id} failed: ${message}`);
      if (err instanceof vscode.LanguageModelError && err.code === vscode.LanguageModelError.NoPermissions.name) {
        throw new AiUnavailableError('Errorwise needs your permission to use the AI model. Click "Explain" again and choose Allow.');
      }
      if (isOutOfQuota(message)) {
        throw new AiUnavailableError(
          "Your AI plan's allowance has run out for now (Copilot's free plan has a monthly limit), so this is the built-in explanation."
        );
      }
      // For example "model not supported" on this plan, or a reply that wasn't usable. Try the next model.
      lastError = err;
    }
  }
  throw lastError;
}

/** Ask one model provided inside VS Code. */
async function askVsCodeModel(model: vscode.LanguageModelChat, prompt: string, token: vscode.CancellationToken): Promise<string> {
  const response = await model.sendRequest(
    [vscode.LanguageModelChatMessage.User(prompt)],
    { justification: 'Errorwise explains error messages in plain language for people learning to code.' },
    token
  );
  let text = '';
  for await (const chunk of response.text) {
    text += chunk;
  }
  return text;
}

/** Models that accept the server-side refusal fallback ("fallbacks: default"). */
const FALLBACK_MODELS = new Set(['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']);

/** Ask Claude directly, using the learner's own Anthropic API key. */
async function askAnthropic(apiKey: string, model: string, prompt: string, token: vscode.CancellationToken): Promise<string> {
  // Loaded only when an API key is used, so VS Code starts up just as fast for everyone else.
  const Anthropic: typeof AnthropicClient = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey, timeout: 90_000, maxRetries: 2 });
  const abort = new AbortController();
  const cancel = token.onCancellationRequested(() => abort.abort());
  try {
    const response = await client.beta.messages.create(
      {
        model,
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }],
        // A short explanation doesn't need deep thinking. Effort only exists on newer models.
        ...(/^claude-(?:fable|mythos|opus|sonnet)-(?:5|4-[6-9])/.test(model) ? { output_config: { effort: 'medium' as const } } : {}),
        // If a safety check declines the request, let the API retry it on a suitable model.
        ...(FALLBACK_MODELS.has(model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      },
      { signal: abort.signal }
    );
    if (response.stop_reason === 'refusal') {
      throw new Error('The AI declined to answer this one.');
    }
    return response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
  } catch (err) {
    if (token.isCancellationRequested) {
      throw err;
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new AiUnavailableError(
        'Your Anthropic API key was not accepted. Run "Errorwise: Add an Anthropic API key" to replace it. Showing the built-in explanation instead.'
      );
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
      throw new AiUnavailableError("Your Anthropic API key doesn't have access to this. Showing the built-in explanation instead.");
    }
    if (err instanceof Anthropic.NotFoundError) {
      throw new AiUnavailableError(
        `The model "${model}" wasn't found. Check the "Errorwise: Anthropic Model" setting. Showing the built-in explanation instead.`
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new Error('Too many requests to the AI right now.');
    }
    if (err instanceof Anthropic.BadRequestError) {
      // For example "Your credit balance is too low". Worth showing as it is.
      throw new AiUnavailableError(`The AI couldn't answer: ${err.message}. Showing the built-in explanation instead.`);
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new Error("Couldn't reach the AI. Check your internet connection.");
    }
    throw err;
  } finally {
    cancel.dispose();
  }
}
