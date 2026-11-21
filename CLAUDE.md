# Errorwise: notes for Claude

A VS Code extension that explains error messages to people learning to code, using plain language, step-by-step fixes and everyday metaphors. The owner is a newer developer (C# certification, more comfortable in Python, has used TypeScript). Explain changes clearly and keep the code readable for them.

## Commands

- `npm install`: install dependencies
- `npm run compile`: type-check into `out/` (used by the tests), then bundle with esbuild into `dist/extension.js` (what VS Code runs)
- `npm test`: type-check, then run `out/test/knowledge.test.js` (plain Node, no VS Code needed)
- F5: launch the Extension Development Host with the `examples/` folder
- `npm run package`: build a `.vsix` (runs `vscode:prepublish`, a minified esbuild bundle; `--no-dependencies` because the SDK is inside the bundle)
- Publishing to the Marketplace: `.github/workflows/publish.yml` runs when a GitHub release is published and is NOT a pre-release. It checks the tag matches `v` + package.json version, runs the tests, packages, publishes with `vsce publish --oidc` (Trusted Publishing, no token; needs vsce 4.1+ and Node 22+), and attaches the `.vsix` to the release. Global Azure DevOps PATs were retired on 2026-12-01, so `npm run publish` from a laptop no longer works without other credentials.
- Test builds for testers: make the GitHub release a **pre-release**, so the workflow skips it. TESTING.md links to the releases list (not `/latest`, which skips pre-releases).

## How it fits together

- `src/extension.ts`: entry point. Registers commands (explain, API key, copy unmatched errors), the lightbulb (code action) provider, and the hover link.
- `src/coach.ts`: the flow. Shows the built-in guide immediately, then replaces it with an AI explanation. Owns the webview panel, cache and cancellation. Records errors with no guide in `globalState` (local only, last 50, first line only).
- `src/ai.ts`: AI explanations. `errorwise.aiProvider` `auto` tries the VS Code Language Model API (`vscode.lm`, preferring Copilot) first, then the learner's Anthropic API key (kept in `context.secrets`, never settings). The Anthropic SDK is loaded with a dynamic `import()` only when a key is used. Default model `claude-opus-5-5` at effort `medium`, with server-side refusal fallbacks (`fallbacks: "default"`) on models that accept them.
- `src/models.ts`: the order to try VS Code's AI models in. Copilot lists models the learner's plan may not include (the free plan rejects `claude-fable-5.1` with "model not supported"), so `ai.ts` tries up to six, free-plan models first, and remembers the one that worked. No `vscode` import. Failures are written to the "Errorwise" Output channel.
- `src/prompt.ts`: the AI prompt and the JSON reply parser. No `vscode` import, so it is testable. The parser runs `cleanWording` on every prose field: it deletes banned words that can go without changing the meaning (`just`, `simply`, `obviously`, `basically`, `of course`), and never touches backtick code or the fix's code. `easy`/`trivial` can't be deleted safely, so `ai.ts` logs them to the Output channel.
- `src/knowledge.ts`: hand-written guides matched by regex (Python runtime, Pylance, JS/TS, C#). No `vscode` import. Order of `ENTRIES` matters: specific before general. `matchError` also reads the code line, for squiggles whose message only describes a symptom. Shared guides branch on which pattern matched to give language-specific steps. Use `key()` for keyboard shortcuts (Cmd on a Mac).
- `src/context.ts`: builds `ErrorContext` from a diagnostic or from pasted text, and pulls the code around the problem line.
- `src/cascade.ts`: finds knock-on errors. One typo (like C#'s `nnew Product { Id = 1 }`) makes the compiler misread the lines after it, and none of those later squiggles carry related information. `findEarlierError` walks back through errors at most 2 lines apart and returns the first one, but only when a syntax error (`isSyntaxError`: "; expected", "Expected expression", "was not closed"...) sits on the chain's lines. Side-by-side type errors, like two untyped parameters on one line, are separate mistakes. The panel then shows a "Check line N first" box and a Reference line button for it, the hover label adds "(check line N first)", and the AI prompt is told not to fix code that is only broken because of it. No `vscode` import.
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

- 47 built-in guides. `npm test` passes (121 checks). The panel tab icon uses `images/icon.png`, because `WebviewPanel.iconPath` needs an image file in 1.90, not a `ThemeIcon`.
- Being tested by the owner (Windows) and a friend (Mac, also a beginner). `TESTING.md` is the friend's step-by-step guide and tells them to download the `.vsix` from the GitHub Releases page, so each new test build needs a new release (`gh release create --prerelease`, with the `.vsix` attached; bump the version in package.json first). Published on the Marketplace since 2026-11-20 (0.2.0): https://marketplace.visualstudio.com/items?itemName=jarvisappleslice.errorwise. To release: bump the version, update CHANGELOG.md, push, then `gh release create vX.Y.Z` (not a pre-release); the workflow does the rest.
- The Copilot path works on the owner's free plan (answers come from `gpt-4.1`). The Anthropic path is checked up to a real request with a fake key (returns 401), not with a real key.
- esbuild (`esbuild.js`) bundles the extension and the Anthropic SDK into one file, so the `.vsix` is 8 files and about 117 KB. `.vscodeignore` leaves out `out/` and `node_modules/`. The SDK's dynamic `import()` becomes a lazy step inside the bundle; a fake-key request through the bundled SDK returns `AuthenticationError` as expected.
- Publishing prep done: bundling, `CHANGELOG.md`, privacy section in the README (what is sent to the AI), more keywords, five README screenshots in `images/screenshots/` (left out of the `.vsix`; the Marketplace loads them from GitHub, so the repo must be public). The bundled build was tested through F5 (panel, hover, lightbulb, terminal, knock-on). The repo is public; commits use the GitHub noreply email.
- To check guide wording against real messages: Pyright (`npx pyright --outputjson` in `examples/`, the engine inside Pylance), `tsc --strict` on `examples/web_shop/*.ts`, `dotnet build` on `examples/csharp_squiggles` (move `Syntax.cs` out first: syntax errors hide the rest), and `dotnet run --project csharp_shop -- N` for runtime errors. Pyright's command line doesn't print hints, so `"x" is not accessed` and `Code is unreachable` are unverified.
- `publisher` in package.json is `jarvisappleslice` (extension ID `jarvisappleslice.errorwise`). The Marketplace needs a Trusted Publishing policy for this repo and `publish.yml` before the workflow can publish.
- `examples/` is a set of practice files with deliberate mistakes (see `examples/README.md` for the scenario list and the guide each should show). Never "fix" the mistakes in them.

## Known gaps

- No guide matches `Statements must be separated by newlines or semicolons`, which usually follows another syntax error.
- No guide for C#'s `InvalidOperationException: Collection was modified` (csharp_shop scenario 9 tests the fallback).
- `npm audit` reports issues in `@vscode/vsce`'s dependencies. They are build tools only and never ship in the `.vsix`.

## Ideas for next steps

- Rate the explanation (👍/👎) to improve guides and prompts
- More guides from what testers' "Errorwise: Copy errors that had no guide" lists show
- Java guides
- Verified publisher (needs a domain), Marketplace ratings and Q&A
