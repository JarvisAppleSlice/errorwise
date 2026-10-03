# Errorwise: notes for Claude

A VS Code extension that explains error messages to people learning to code, using plain language, step-by-step fixes and everyday metaphors. The owner is a newer developer (C# certification, more comfortable in Python, has used TypeScript). Explain changes clearly and keep the code readable for them.

## Commands

- `npm install`: install dependencies
- `npm run compile`: build TypeScript into `out/`
- `npm test`: compile, then run `out/test/knowledge.test.js` (plain Node, no VS Code needed)
- F5: launch the Extension Development Host with the `examples/` folder
- `npm run package`: build a `.vsix`

## How it fits together

- `src/extension.ts`: entry point. Registers commands (explain, API key, copy unmatched errors), the lightbulb (code action) provider, and the hover link.
- `src/coach.ts`: the flow. Shows the built-in guide immediately, then replaces it with an AI explanation. Owns the webview panel, cache and cancellation. Records errors with no guide in `globalState` (local only, last 50, first line only).
- `src/ai.ts`: AI explanations. `errorwise.aiProvider` `auto` tries the VS Code Language Model API (`vscode.lm`, preferring Copilot) first, then the learner's Anthropic API key (kept in `context.secrets`, never settings). The Anthropic SDK is loaded with a dynamic `import()` only when a key is used. Default model `claude-opus-5-5` at effort `medium`, with server-side refusal fallbacks (`fallbacks: "default"`) on models that accept them.
- `src/models.ts`: the order to try VS Code's AI models in. Copilot lists models the learner's plan may not include (the free plan rejects `claude-fable-5.1` with "model not supported"), so `ai.ts` tries up to six, free-plan models first, and remembers the one that worked. No `vscode` import. Failures are written to the "Errorwise" Output channel.
- `src/prompt.ts`: the AI prompt and the JSON reply parser. No `vscode` import, so it is testable.
- `src/knowledge.ts`: hand-written guides matched by regex (Python runtime, Pylance, JS/TS, C#). No `vscode` import. Order of `ENTRIES` matters: specific before general. `matchError` also reads the code line, for squiggles whose message only describes a symptom. Shared guides branch on which pattern matched to give language-specific steps. Use `key()` for keyboard shortcuts (Cmd on a Mac).
- `src/context.ts`: builds `ErrorContext` from a diagnostic or from pasted text, and pulls the code around the problem line.
- `src/traceback.ts`: reads pasted terminal output (Python, Node, C#): picks the line that states the error, and finds the file and line. No `vscode` import, so it is testable.
- `src/render.ts`: panel HTML and CSS using VS Code theme variables. No `vscode` import. Shows "Go to line" plus a "Reference line" button and note for each of the diagnostic's related lines (e.g. where a missing property is declared).
- `src/types.ts`: shared types.

## Writing rules (apply to built-in guides AND the AI prompt)

- Short sentences, everyday words. Define any unavoidable term in parentheses.
- Never use "simply", "just", "obviously", "easy", "trivial". The test checks some of these.
- One metaphor from daily life that matches how the error REALLY works. A pretty metaphor that teaches something false is worse than none.
- Steps start with an action word and point at real lines and names.
- Hide the fix behind "Show me the fix" so learners try first.
- Wrap code in backticks (the `c()` helper in knowledge.ts); the panel renders them as code.

## Status

- 47 built-in guides. `npm test` passes (118 checks). The panel tab icon uses `images/icon.png`, because `WebviewPanel.iconPath` needs an image file in 1.90, not a `ThemeIcon`.
- Being tested by the owner (Windows) and a friend (Mac, also a beginner). `TESTING.md` is the friend's step-by-step guide and tells them to download the `.vsix` from the GitHub Releases page, so each new test build needs a new release (`gh release create`, with the `.vsix` attached; bump the version in package.json first). Not published to the Marketplace. Publishing prep comes after testing.
- The Copilot path works on the owner's free plan (answers come from `gpt-4.1`). The Anthropic path is checked up to a real request with a fake key (returns 401), not with a real key.
- The `.vsix` ships the Anthropic SDK's runtime files from `node_modules` (about 730 files, 650 KB); `.vscodeignore` drops their type definitions and ES-module copies. Bundling (esbuild) would shrink this before publishing.
- To check guide wording against real messages: Pyright (`npx pyright --outputjson` in `examples/`, the engine inside Pylance), `tsc --strict` on `examples/web_shop/*.ts`, `dotnet build` on `examples/csharp_squiggles` (move `Syntax.cs` out first: syntax errors hide the rest), and `dotnet run --project csharp_shop -- N` for runtime errors. Pyright's command line doesn't print hints, so `"x" is not accessed` and `Code is unreachable` are unverified.
- `publisher` in package.json is a placeholder (`your-publisher-id`).
- `examples/` is a set of practice files with deliberate mistakes (see `examples/README.md` for the scenario list and the guide each should show). Never "fix" the mistakes in them.

## Known gaps

- No guide matches `Statements must be separated by newlines or semicolons`, which usually follows another syntax error.
- No guide for C#'s `InvalidOperationException: Collection was modified` (csharp_shop scenario 9 tests the fallback).
- `npm audit` reports issues in `@vscode/vsce`'s dependencies. They are build tools only and never ship in the `.vsix`.

## Ideas for next steps

- Rate the explanation (👍/👎) to improve guides and prompts
- More guides from what testers' "Errorwise: Copy errors that had no guide" lists show
- Java guides
- Marketplace screenshots (icon is done: images/icon.png, source in images/icon.svg), changelog, publisher ID, bundling
