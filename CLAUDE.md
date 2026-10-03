# Errorwise: notes for Claude

A VS Code extension that explains error messages to people learning to code, using plain language, step-by-step fixes and everyday metaphors. The owner is a newer developer (C# certification, more comfortable in Python, has used TypeScript). Explain changes clearly and keep the code readable for them.

## Commands

- `npm install`: install dependencies
- `npm run compile`: build TypeScript into `out/`
- `npm test`: compile, then run `out/test/knowledge.test.js` (plain Node, no VS Code needed)
- F5: launch the Extension Development Host with the `examples/` folder
- `npm run package`: build a `.vsix`

## How it fits together

- `src/extension.ts`: entry point. Registers commands, the lightbulb (code action) provider, and the hover link.
- `src/coach.ts`: the flow. Shows the built-in guide immediately, then replaces it with an AI explanation. Owns the webview panel, cache and cancellation.
- `src/ai.ts`: calls the VS Code Language Model API (`vscode.lm`), preferring Copilot.
- `src/prompt.ts`: the AI prompt and the JSON reply parser. No `vscode` import, so it is testable.
- `src/knowledge.ts`: hand-written guides matched by regex (Python runtime, Pylance, JS/TS, C#). No `vscode` import. Order of `ENTRIES` matters: specific before general.
- `src/context.ts`: builds `ErrorContext` from a diagnostic or from pasted text, and pulls the code around the problem line.
- `src/traceback.ts`: reads pasted terminal output: picks the line that states the error, and finds the file and line in Python and Node tracebacks. No `vscode` import, so it is testable.
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

- 40 built-in guides. `npm test` passes (90 checks). The panel tab icon uses `images/icon.png`, because `WebviewPanel.iconPath` needs an image file in 1.90, not a `ThemeIcon`.
- Runs in VS Code (F5). The AI path is untested because the owner doesn't have Copilot installed yet.
- To check guide wording against real messages, run Pyright (`npx pyright --outputjson` in `examples/`, the engine inside Pylance) and `tsc --strict` on `examples/web_shop/*.ts`. Pyright's command line doesn't print hints, so `"x" is not accessed` and `Code is unreachable` are unverified.
- `publisher` in package.json is a placeholder (`your-publisher-id`).
- `examples/` is a set of practice files with deliberate mistakes (see `examples/README.md` for the scenario list and the guide each should show). Never "fix" the mistakes in them.

## Known gaps

Some Pylance squiggles describe a symptom, not the mistake, and matching on the message alone can't tell them apart. Fixing these would mean looking at the code line too.

- `if price = 3:` squiggle says `Expected ":"`, so it gets the missing-colon guide. The real mistake is `=` instead of `==`. (Running the file gives the right guide.)
- `[0.5 2.25, 0.3]` squiggle says `"[" was not closed`, so it gets the unclosed-bracket guide. The real mistake is a missing comma. (Running the file gives the right guide.)
- `print(prices[0)]` squiggle also says `was not closed`. The real mistake is brackets closed in the wrong order.
- No guide matches `Statements must be separated by newlines or semicolons`, which usually follows another syntax error.
- FileNotFoundError has no guide yet (corner_shop scenario 18 tests the fallback).

## Ideas for next steps

- Option for an Anthropic or OpenAI API key when Copilot isn't available
- More built-in guides (loops, `while True`, file not found, permission errors, Java)
- Rate the explanation (👍/👎) to improve guides and prompts
- Marketplace screenshots (icon is done: images/icon.png, source in images/icon.svg)
- Unit test for `context.ts` traceback parsing
