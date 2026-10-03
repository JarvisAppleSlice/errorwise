# Errorwise: Errors in Plain English

> **Here to help test Errorwise?** Follow the step-by-step guide: [TESTING.md](TESTING.md)

A VS Code extension for people learning to code. It turns confusing error messages into:

- **What happened**: one to three short, plain sentences
- **💡 Think of it like this**: one everyday metaphor that matches how the error really works
- **How to fix it**: two to five steps you can check off
- **Stuck? Show me the fix**: hidden until you ask, so you try first
- **Remember**: one line to keep for next time

When the error points at another line too, such as where a missing property is declared, the panel adds a **Reference line** button that jumps there.

## How to use it

- **Hover** over a red squiggle and click **Explain simply**
- **Click the lightbulb** 💡 and pick **🎓 Explain simply**
- **Put your cursor** on a line with an error and press **Ctrl+Alt+E** (Cmd+Option+E on Mac)
- **Terminal errors**: select the error text, then press **Ctrl+Alt+E** (Cmd+Option+E on Mac), or right-click the selection and choose **Errorwise: Explain this error**
- **Anything else**: copy an error, then run **Errorwise: Explain selected text or a copied error** from the Command Palette

Works on Windows, Mac and Linux.

## AI or no AI

If an AI model is available in VS Code (for example GitHub Copilot, including the free plan), Errorwise writes an explanation tailored to your actual code, using your variable names and line numbers. Without Copilot, you can add your own Anthropic API key with **Errorwise: Add an Anthropic API key**. The key is stored encrypted by VS Code, and each explanation is billed to your Anthropic account.

Without AI, it uses built-in guides for about 50 of the most common beginner errors and squiggles in Python, JavaScript/TypeScript and C#. These also appear instantly while the AI is still writing.

## Settings

| Setting | What it does |
| --- | --- |
| `errorwise.useAI` | Use AI for tailored explanations (default: on) |
| `errorwise.aiProvider` | `auto` (Copilot first, then your API key), `copilot`, or `anthropic` |
| `errorwise.anthropicModel` | The Claude model used with your API key (default: `claude-opus-5-5`) |
| `errorwise.experienceLevel` | `brand new` or `a few months` |
| `errorwise.metaphorTheme` | Where metaphors come from: cooking, sports, video games, school, building, cars, or anything relatable |
| `errorwise.showHoverLink` | Show the "Explain simply" link on hover |

## Commands

| Command | What it does |
| --- | --- |
| Errorwise: Explain the error at my cursor | Explain the squiggle on the current line |
| Errorwise: Explain selected text or a copied error | Explain any error text |
| Errorwise: Add an Anthropic API key | Use your own key when Copilot isn't available |
| Errorwise: Remove the Anthropic API key | Delete the stored key |
| Errorwise: Copy errors that had no guide | Copy the error messages that had no built-in guide, to share as feedback |

## Developing

```bash
npm install
npm test          # compiles and runs the tests
```

Press **F5** to open a test window with the extension loaded. It opens the `examples` folder, which is full of deliberate mistakes to try (see `examples/README.md`).

To build an installable file: `npm run package` → `errorwise-0.1.0.vsix`, then in VS Code run **Extensions: Install from VSIX…**. `TESTING.md` is a guide for testers.
