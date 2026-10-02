# Code Coach: notes for Claude

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
- `src/context.ts`: builds `ErrorContext` from a diagnostic or from pasted text (finds file and line in Python and Node tracebacks and pulls the code around it).
- `src/render.ts`: panel HTML and CSS using VS Code theme variables. No `vscode` import.
- `src/types.ts`: shared types.

## Writing rules (apply to built-in guides AND the AI prompt)

- Short sentences, everyday words. Define any unavoidable term in parentheses.
- Never use "simply", "just", "obviously", "easy", "trivial". The test checks some of these.
- One metaphor from daily life that matches how the error REALLY works. A pretty metaphor that teaches something false is worse than none.
- Steps start with an action word and point at real lines and names.
- Hide the fix behind "Show me the fix" so learners try first.
- Wrap code in backticks (the `c()` helper in knowledge.ts); the panel renders them as code.

## Status

- Compiles against the real `@types/vscode` 1.90 and `npm test` passes (45 checks). The panel tab icon uses `images/icon.png`, because `WebviewPanel.iconPath` needs an image file in 1.90, not a `ThemeIcon`.
- Not yet run inside VS Code. Try F5 with `examples/mistakes.py`: hover, lightbulb, Ctrl+Alt+E, and the terminal right-click flow.
- `publisher` in package.json is a placeholder (`your-publisher-id`).

## Ideas for next steps

- Option for an Anthropic or OpenAI API key when Copilot isn't available
- More built-in guides (loops, `while True`, file not found, permission errors, Java)
- Rate the explanation (👍/👎) to improve guides and prompts
- Marketplace screenshots (icon is done: images/icon.png, source in images/icon.svg)
- Unit test for `context.ts` traceback parsing
