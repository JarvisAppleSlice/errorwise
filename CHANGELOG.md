# Changelog

## Unreleased

- The extension is now packed into one small file (116 KB instead of about 730 files), so it installs and starts faster.
- The README now explains what is sent to the AI and what stays on your computer.
- AI explanations no longer say "just", "simply", "obviously", "basically" or "of course", even when the AI slips them in.
- AI steps guide you to the fix without giving the answer away, even for one-letter typos.
- "Check line N first" no longer appears for two separate mistakes that happen to sit side by side, like two parameters with no type. It now needs a syntax error that really confuses the computer.
- Screenshots in the README.

## 0.1.1 (test build)

- When one typo makes the compiler misread the lines after it, Errorwise now points back to the line that caused it ("Check line N first"), and the AI is told not to fix lines that are only broken because of it.

## 0.1.0 (test build)

- Plain-language explanations for errors in Python, JavaScript/TypeScript and C#, with an everyday metaphor, steps to try, and a hidden "Show me the fix".
- 47 built-in guides that work without AI.
- AI explanations through GitHub Copilot (the free plan works) or your own Anthropic API key.
- Explain an error from a squiggle (hover, lightbulb or Ctrl+Alt+E), from the terminal, or from copied text.
- "Reference line" buttons for errors that point at another line too.
- Works on Windows, Mac and Linux.
