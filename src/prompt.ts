import { ErrorContext, Explanation } from './types';

export interface AiOptions {
  experienceLevel: string;
  metaphorTheme: string;
  /** A metaphor that works well for this kind of error (from the built-in guide). */
  teacherHint?: string;
  /** A metaphor the learner already saw and wants replaced. */
  avoidMetaphor?: string;
}

const THEMES: Record<string, string> = {
  'anything relatable': 'home life, cooking, shopping, school, sports, travel, or mail and packages',
  'cooking and the kitchen': 'cooking, recipes, and the kitchen',
  sports: 'sports, teams, and games',
  'video games': 'video games (levels, inventories, save points, controllers)',
  'school and the classroom': 'school, classrooms, homework, and lockers',
  'building and construction': 'building, construction, tools, and blueprints',
  'cars and driving': 'cars, driving, and road trips',
};

/** The instructions that make explanations readable and the metaphors relatable. */
export function buildPrompt(ctx: ErrorContext, o: AiOptions): string {
  const reader =
    o.experienceLevel === 'a few months'
      ? 'someone who has been learning to code for a few months. They know what variables, loops and functions are, but error messages still confuse them'
      : 'someone who started learning to code last week. Assume they know nothing about programming terms';

  const where: string[] = [];
  if (ctx.fileName) {
    where.push(`File: ${ctx.fileName}${ctx.languageId ? ` (language: ${ctx.languageId})` : ''}`);
  } else if (ctx.languageId) {
    where.push(`Language: ${ctx.languageId}`);
  }
  if (ctx.diagnosticSource) {
    where.push(`Reported by: ${ctx.diagnosticSource}${ctx.diagnosticCode ? ` (${ctx.diagnosticCode})` : ''}`);
  }

  const code = ctx.codeSnippet
    ? `Their code around the problem (line ${ctx.line} is marked with >>):\n\`\`\`\n${ctx.codeSnippet}\n\`\`\``
    : 'Their code is not available, only the message.';

  const output =
    ctx.fullOutput && ctx.fullOutput.trim() !== ctx.message.trim()
      ? `\nFull output they copied:\n"""\n${ctx.fullOutput.slice(0, 4000)}\n"""`
      : '';

  // A knock-on error: an earlier mistake may have made the compiler misread this line.
  const e = ctx.earlierError;
  const earlier = e
    ? `\n\nIMPORTANT: there is an earlier error just before this one, on line ${e.line}${e.code ? ` (\`${e.code}\`)` : ''}:
"${e.note}"
One mistake often makes the compiler misread the code after it, so this error may only be a knock-on effect of that one. Check whether it is. If it is, say so plainly, point them to line ${e.line}, and make fixing that the first step. Do not tell them to change code that is only broken because of the earlier mistake.`
    : '';

  return `You are Errorwise, a patient tutor inside VS Code for people learning to code.

The learner is ${reader}.

They just got this error:
"""
${ctx.message}
"""
${where.join('\n')}${output}${earlier}

${code}

Explain the error so they understand it and can fix it themselves.

WRITING RULES
- Write like you are talking to a friend. Warm, calm, never condescending.
- Keep sentences under 20 words. Use everyday words.
- Avoid jargon. If you must use a technical word, explain it in a few plain words right after, in parentheses.
- Never use the words "simply", "just", "obviously", "easy", "trivial" or "of course".
- Describe the code, not the learner: write "this line is missing a colon", not "you forgot a colon".
- Use their real names and line numbers from the code above.
- Wrap any code, names or symbols in backticks, like \`total\`.

THE METAPHOR
- Use ONE metaphor from ordinary daily life that nearly everyone has experienced. Draw it from: ${THEMES[o.metaphorTheme] ?? THEMES['anything relatable']}.
- It must match how the error really works, not just sound nice. If the metaphor would teach something false, choose another.
- Make it concrete and visual: a specific object or moment, not an abstract idea.
- Finish by linking it back to their code in one short sentence, like: "In your code, the empty box is \`result\`."
- 2 to 4 sentences in total.${o.teacherHint ? `\n- Teacher's note, a metaphor that works well for this kind of error: "${o.teacherHint}" Adapt it to their code, or use a better one.` : ''}${o.avoidMetaphor ? `\n- The learner already heard the metaphor below and wants a fresh angle. Use a completely different everyday situation:\n  "${o.avoidMetaphor}"` : ''}

THE STEPS
- 2 to 5 steps they can do right now, in order.
- Start each step with an action word: Look, Find, Change, Add, Delete, Type, Run, Hover.
- Point to exact places: line numbers, names, symbols.
- Guide them to the fix. Don't hand over the finished code in the steps; the fix goes in its own field.

Reply with ONLY a JSON object. No text before or after it. Use this shape:
{
  "title": "Under 10 words, plain language, says what is wrong",
  "whatHappened": "1 to 3 short sentences about what actually happened",
  "metaphor": "The metaphor, 2 to 4 sentences, ending with the link back to their code",
  "steps": ["First step", "Second step"],
  "fix": { "explanation": "One sentence on what the fix changes", "code": "Only the corrected line or lines" },
  "remember": "One short sentence they can remember next time"
}
Use null for "fix" if you can't tell what the fix is.`;
}

/** Turn the model's reply into an Explanation, tolerating code fences and stray text. */
export function parseExplanation(text: string): Explanation {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error('The AI reply did not contain an explanation.');
  }
  const data = JSON.parse(text.slice(start, end + 1));

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const title = str(data.title);
  const whatHappened = str(data.whatHappened);
  const metaphor = str(data.metaphor);
  const steps = Array.isArray(data.steps) ? data.steps.map(str).filter((s: string | undefined): s is string => !!s) : [];
  if (!title || !whatHappened || !metaphor || steps.length === 0) {
    throw new Error('The AI reply was missing some parts.');
  }

  let fix: Explanation['fix'];
  if (data.fix && typeof data.fix === 'object' && str(data.fix.explanation)) {
    fix = { explanation: str(data.fix.explanation)!, code: str(data.fix.code) };
  }

  return { title, whatHappened, metaphor, steps, fix, remember: str(data.remember), source: 'ai' };
}
