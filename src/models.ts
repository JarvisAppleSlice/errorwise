/**
 * Decides which AI model to try first.
 *
 * Copilot lists every model it knows about, including ones the learner's plan
 * doesn't include. Asking for one of those fails with "model not supported",
 * so Errorwise tries several, starting with the ones most likely to work.
 *
 * This file must NOT import 'vscode' so it can be unit-tested with plain Node.
 */

/** The parts of a VS Code language model this file needs. */
export interface ModelInfo {
  id: string;
  family: string;
}

/**
 * Model families in the order to try them: first the ones Copilot's free plan
 * includes, which are also quick. Anything not listed comes after, in Copilot's own order.
 */
const PREFERRED = [/^gpt-4\.1/i, /^gpt-5-mini/i, /^gpt-4o/i, /haiku/i, /mini/i];

/** How many models to try before giving up. Rejections are fast, so a few tries cost little. */
export const MAX_MODEL_TRIES = 6;

/** Put the models in the order to try them. The one that worked last time goes first. */
export function orderModels<T extends ModelInfo>(models: T[], lastWorkedId?: string): T[] {
  const rank = (m: T) => {
    if (m.id === lastWorkedId) {
      return -1;
    }
    const preferred = PREFERRED.findIndex((re) => re.test(m.family) || re.test(m.id));
    return preferred === -1 ? PREFERRED.length : preferred;
  };
  // Sorting on [rank, original position] keeps Copilot's order among models with the same rank.
  return models
    .map((model, position) => ({ model, position, rank: rank(model) }))
    .sort((a, b) => a.rank - b.rank || a.position - b.position)
    .map((entry) => entry.model);
}

/** Does this failure mean the learner's monthly AI allowance has run out? */
export function isOutOfQuota(message: string): boolean {
  return /quota|rate.?limit|exceeded|too many requests|\b429\b|\b402\b/i.test(message);
}
