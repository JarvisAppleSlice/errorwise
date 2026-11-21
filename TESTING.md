# Testing Errorwise: start here

Thanks for helping test Errorwise! It is an add-on for VS Code that explains error messages in plain English.

This guide takes about 10 minutes. You don't need to know much about coding to follow it. Do the steps in order.

**Keyboard keys:** this guide shows Mac keys first, with Windows keys in brackets. On a Mac, `Cmd` is the ⌘ key and `Option` is the ⌥ key.

## Before you start

You need two things:

- **VS Code** installed on your computer. If you don't have it, download it free from https://code.visualstudio.com
- **A GitHub account**, for the free AI explanations in Step 4. You don't need one to download Errorwise.

## Step 1: Download Errorwise

1. Open the downloads page: https://github.com/JarvisAppleSlice/errorwise/releases
2. The newest version is at the top. Under it, find the heading **Assets** (click it if it's folded shut).
3. Click the file whose name starts with **errorwise-** and ends with **.vsix**, for example **errorwise-0.1.1.vsix**. The numbers are the version. It downloads to your **Downloads** folder.

Don't double-click the file after it downloads. It only opens from inside VS Code, which is the next step.

## Step 2: Install it in VS Code

1. Open VS Code.
2. Press `Cmd+Shift+X` (Windows: `Ctrl+Shift+X`). A panel called **Extensions** opens on the left.
3. At the top of that panel, click the three dots **...**
4. Click **Install from VSIX...**
5. Open your **Downloads** folder, click the **errorwise-....vsix** file you downloaded, then click **Install**. If there are several, pick the one with the highest numbers.

A small message appears in the bottom-right corner when it's done.

## Step 3: Check that it works

This first test needs nothing else installed.

1. Select the line below and copy it (`Cmd+C`, Windows: `Ctrl+C`):

   ```
   NameError: name 'totl' is not defined
   ```

2. In VS Code, press `Cmd+Shift+P` (Windows: `Ctrl+Shift+P`). A search box opens at the top.
3. Type `Errorwise` and click **Errorwise: Explain selected text or a copied error**.

A panel opens on the right, titled **The computer doesn't know what "totl" is**. It has an everyday comparison and steps to fix the problem.

If you see that panel, Errorwise is installed and working. 🎉

## Step 4: Turn on the AI explanations (free)

Errorwise works without AI. With AI turned on, it reads your actual code and writes an explanation that uses your own names and line numbers. It uses GitHub Copilot, which has a free plan.

1. Press `Cmd+Shift+X` (Windows: `Ctrl+Shift+X`) to open Extensions.
2. Type `GitHub Copilot` in the search box.
3. Click **Install** on the one made by **GitHub**. If it says **Installed** already, skip this.
4. VS Code asks you to sign in. Click **Sign in with GitHub** and follow the steps in your browser.
5. If it asks you to pick a plan, choose **Copilot Free**.

Now repeat Step 3. The first time, VS Code asks if Errorwise may use Copilot. Click **Allow**.

Watch the small label at the top of the panel. It starts as **Quick guide**. After a few seconds it should change to **Tailored to your code**. That change means the AI is working.

The free plan has a monthly limit on AI requests. If you reach it, Errorwise keeps working with its built-in guides.

## Step 5: Use it on your own code

Use Errorwise whenever you get an error while coding. There are three ways.

**A squiggly line under your code:**

- Hover your mouse over the squiggle and click **Explain simply**, or
- Click on that line and press `Cmd+Option+E` (Windows: `Ctrl+Alt+E`).

**An error in the terminal** (the panel at the bottom where your program runs):

1. Drag your mouse over the error to highlight it, from its first line to its last line.
2. Press `Cmd+Option+E` (Windows: `Ctrl+Alt+E`).

**Any other error**, such as one from a website: copy it, then do Step 3 again.

### Buttons in the panel

| Button | What it does |
| --- | --- |
| The numbered circles | Tick off each step as you do it |
| **Stuck? Show me the fix** | Shows the answer. Try the steps first! |
| **Go to line 15** | Jumps to the line with the problem |
| **Reference line 8** | Jumps to another line that is part of the problem. Only appears sometimes |
| **Explain it a different way** | Asks the AI for a different everyday comparison |

## Step 6: Try the practice files (optional)

Samuel made a folder of code with mistakes in it on purpose, so you can try lots of different errors.

1. Go to https://github.com/JarvisAppleSlice/errorwise
2. Click the green **Code** button, then **Download ZIP**.
3. Open your **Downloads** folder and double-click the ZIP file to unpack it.
4. In VS Code, click **File → Open Folder...** and choose the **examples** folder inside the unpacked folder.
5. Open **mistakes.py** and hover over a squiggle.

No squiggles in the Python files? Install the **Python** extension made by **Microsoft**, the same way you installed Copilot in Step 4.

The file **README.md** inside the examples folder lists every practice error. On a Mac, type `python3` wherever it says `python`.

## What to tell Samuel

All feedback helps, and these three kinds help the most:

1. **Explanations that confused you.** For example, a "Think of it like this" comparison that didn't make sense. A screenshot of the panel is perfect.
2. **Errors Errorwise didn't recognise.** It keeps a private list of these on your computer. To send it:
   1. Press `Cmd+Shift+P` (Windows: `Ctrl+Shift+P`).
   2. Type `Errorwise` and click **Errorwise: Copy errors that had no guide**.
   3. Paste into a message to Samuel.

   The list holds only the error messages, not your code.
3. **Anything that didn't work.** Say what you clicked and what you expected to happen.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| "The AI explanation didn't come through" | The built-in guide is shown instead, so you can carry on. If it keeps happening, send Samuel the log (see below) |
| The label stays on **Quick guide** | Read the note at the top of the panel. It says why the AI wasn't used |
| No **Explain simply** link when you hover | Click on the line and press `Cmd+Option+E` (Windows: `Ctrl+Alt+E`) instead |
| Nothing happens at all | Press `Cmd+Shift+P` (Windows: `Ctrl+Shift+P`), type `Reload Window`, press Enter, and try again |

**To send the log:** in VS Code's top menu click **View → Output**. In the dropdown on the right of that panel, choose **Errorwise**. Copy what's there and send it to Samuel.

## Getting a newer version

When Samuel says there's an update, do Steps 1 and 2 again with the new file. It replaces the old one.

## Settings

To change how Errorwise explains things, press `Cmd+,` (Windows: `Ctrl+,`) and type `Errorwise` in the search box.

- **Experience Level:** "brand new" explains every term. "a few months" assumes you know the basics.
- **Metaphor Theme:** pick what the everyday comparisons are about: cooking, sports, video games, school, building or cars.
- **Use AI:** untick this to use only the built-in guides.
