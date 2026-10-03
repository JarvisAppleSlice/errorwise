/** A beginner-friendly explanation of one error. */
export interface Explanation {
  /** Under ~10 words, says what's wrong in plain language. */
  title: string;
  /** 1–3 sentences: what actually happened. */
  whatHappened: string;
  /** One everyday metaphor, 2–4 sentences. */
  metaphor: string;
  /** 2–5 things to do, in order. Each starts with an action word. */
  steps: string[];
  /** The fix, kept hidden until the learner asks for it. */
  fix?: { explanation: string; code?: string };
  /** One short sentence to remember next time. */
  remember?: string;
  /** Where it came from: hand-written or tailored by AI. */
  source: 'built-in' | 'ai' | 'general';
}

/** Everything we know about the error the learner hit. */
export interface ErrorContext {
  /** The main error message (one line if possible). */
  message: string;
  /** Full output, e.g. a whole Python traceback from the terminal. */
  fullOutput?: string;
  languageId?: string;
  fileName?: string;
  /** 1-based line number of the problem. */
  line?: number;
  /** A few numbered lines around the problem, problem line marked with >>. */
  codeSnippet?: string;
  /** Where the error came from (e.g. "Pylance", "ts"). */
  diagnosticSource?: string;
  diagnosticCode?: string;
  /** File URI, so "Go to line" can jump there. */
  uri?: string;
  /** Other lines the error points at, like where a missing property is declared. */
  related?: RelatedLine[];
}

/** Another line of code that helps explain the error. */
export interface RelatedLine {
  uri: string;
  /** 1-based line number. */
  line: number;
  fileName: string;
  /** What the checker says about this line, e.g. "'quantity' is declared here." */
  note: string;
}

/** JSON-safe description of a diagnostic, passed through command links. */
export interface DiagnosticArgs {
  uri: string;
  message: string;
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
  source?: string;
  code?: string;
  /** The diagnostic's related information (0-based line numbers). */
  related?: { uri: string; line: number; message: string }[];
}
