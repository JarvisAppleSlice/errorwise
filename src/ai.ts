import * as vscode from 'vscode';
import { ErrorContext, Explanation } from './types';
import { AiOptions, buildPrompt, parseExplanation } from './prompt';

export type { AiOptions };

/** Thrown when no AI model can be used. The message is shown to the learner. */
export class AiUnavailableError extends Error {}

/** Ask an AI model (e.g. Copilot) for a tailored, beginner-friendly explanation. */
export async function explainWithAI(
  ctx: ErrorContext,
  options: AiOptions,
  token: vscode.CancellationToken
): Promise<Explanation> {
  const model = await pickModel();
  if (!model) {
    throw new AiUnavailableError(
      'No AI model is available, so this is the built-in explanation. Install and sign in to GitHub Copilot (the free plan works) to get explanations tailored to your code.'
    );
  }

  const prompt = buildPrompt(ctx, options);
  let text = '';
  try {
    const response = await model.sendRequest(
      [vscode.LanguageModelChatMessage.User(prompt)],
      { justification: 'Errorwise explains error messages in plain language for people learning to code.' },
      token
    );
    for await (const chunk of response.text) {
      text += chunk;
    }
  } catch (err) {
    if (err instanceof vscode.LanguageModelError) {
      throw new AiUnavailableError(
        err.code === vscode.LanguageModelError.NoPermissions.name
          ? 'Errorwise needs your permission to use the AI model. Click "Explain" again and choose Allow.'
          : `The AI model couldn't answer right now (${err.message}). Showing the built-in explanation instead.`
      );
    }
    throw err;
  }

  return parseExplanation(text);
}

async function pickModel(): Promise<vscode.LanguageModelChat | undefined> {
  // Prefer Copilot; fall back to any model another extension provides.
  const copilot = await vscode.lm.selectChatModels({ vendor: 'copilot' });
  if (copilot.length > 0) {
    return copilot[0];
  }
  const any = await vscode.lm.selectChatModels();
  return any[0];
}

