# Errorwise: Errors in Plain English

A VS Code extension for people learning to code. It turns confusing error messages into:

- **What happened**: one to three short, plain sentences
- **💡 Think of it like this**: one everyday metaphor that matches how the error really works
- **How to fix it**: two to five steps you can check off
- **Stuck? Show me the fix**: hidden until you ask, so you try first
- **Remember**: one line to keep for next time

## How to use it

- **Hover** over a red squiggle and click **Explain simply**
- **Click the lightbulb** 💡 and pick **🎓 Explain simply**
- **Put your cursor** on a line with an error and press **Ctrl+Alt+E** (Cmd+Alt+E on Mac)
- **Terminal errors**: select the error text, right-click, and choose **Errorwise: Explain this error**
- **Anything else**: copy an error, then run **Errorwise: Explain selected text or a copied error** from the Command Palette

## AI or no AI

If an AI model is available in VS Code (for example GitHub Copilot, including the free plan), Errorwise writes an explanation tailored to your actual code, using your variable names and line numbers.

Without AI, it uses built-in guides for about 20 of the most common beginner errors in Python, JavaScript/TypeScript and C#. These also appear instantly while the AI is still writing.

## Settings

| Setting | What it does |
| --- | --- |
| `errorwise.useAI` | Use AI for tailored explanations (default: on) |
| `errorwise.experienceLevel` | `brand new` or `a few months` |
| `errorwise.metaphorTheme` | Where metaphors come from: cooking, sports, video games, school, building, cars, or anything relatable |
| `errorwise.showHoverLink` | Show the "Explain simply" link on hover |

## Developing

```bash
npm install
npm test          # compiles and runs the built-in guide tests
```

Press **F5** to open a test window with the extension loaded. It opens the `examples` folder, where `mistakes.py` has some classic beginner errors to try.

To build an installable file: `npm run package` → `errorwise-0.1.0.vsix`, then in VS Code run **Extensions: Install from VSIX…**.
