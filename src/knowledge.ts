/**
 * Hand-written explanations for the errors beginners hit most.
 *
 * These work offline and with no AI at all. When AI is on, the matching
 * metaphor is also passed to the AI as a "teacher's note" so the tailored
 * explanation stays consistent with these.
 *
 * This file must NOT import 'vscode' so it can be unit-tested with plain Node.
 *
 * Writing guide for new entries:
 *  - Short sentences, everyday words. No "simply", "just", "obviously".
 *  - One metaphor from daily life that matches how the error REALLY works.
 *  - Steps start with an action word and can be done right now.
 *  - Wrap code in backticks with the c() helper so it renders as code.
 */
import { Explanation } from './types';

type Built = Omit<Explanation, 'source'>;

interface Entry {
  id: string;
  patterns: RegExp[];
  build: (groups: string[]) => Built;
}

/** Wrap a piece of code in backticks so the panel shows it as code. */
const c = (code: string) => '`' + code + '`';

/** First non-empty capture group (patterns put the same thing in different slots). */
const pick = (g: string[], ...idx: number[]) => {
  for (const i of idx) {
    if (g[i] !== undefined && g[i] !== '') {
      return g[i];
    }
  }
  return undefined;
};

/**
 * Order matters: more specific entries come first.
 * e.g. "NoneType has no attribute" must win over the general attribute error.
 */
export const ENTRIES: Entry[] = [
  {
    id: 'unbound-local',
    patterns: [
      /cannot access local variable ['"](\w+)['"]/i,
      /local variable ['"](\w+)['"] referenced before assignment/i,
      /["'](\w+)["'] is possibly unbound/i,
    ],
    build: (g) => {
      const n = pick(g, 1, 2, 3) ?? 'this variable';
      return {
        title: `"${n}" is used before it gets a value`,
        whatHappened: `Inside this function, ${c(n)} gets a value somewhere. That makes it the function's own private ${c(n)}. But this line uses it before that value is set, or on a path where it never gets set.`,
        metaphor: `Imagine your family has a TV in the living room. Then you buy your own TV for your bedroom, but haven't plugged it in. Now "turn on the TV" in your room means YOUR TV, and it doesn't work yet. The function got its own ${c(n)}, but it isn't set up yet.`,
        steps: [
          `Give ${c(n)} a starting value at the top of the function, before you use it.`,
          `If ${c(n)} only gets a value inside an ${c('if')}, it won't exist when that ${c('if')} is skipped. Set a default value before the ${c('if')}.`,
          `If you meant to change a ${c(n)} from outside the function, pass it in as an input and ${c('return')} the new value instead.`,
        ],
        remember: 'Inside a function, give a variable a value before you use it.',
      };
    },
  },
  {
    id: 'undefined-name',
    patterns: [
      /name ['"](\w+)['"] is not defined/i, // Python runtime: NameError
      /^['"](\w+)['"] is not defined/m, // Pylance, ESLint
      /Cannot find name ['"](\w+)['"]/i, // TypeScript
      /The name ['"](\w+)['"] does not exist in the current context/i, // C#
      /ReferenceError: (\w+) is not defined/i, // JavaScript runtime
    ],
    build: (g) => {
      const n = pick(g, 1, 2, 3, 4, 5) ?? 'this name';
      return {
        title: `The computer doesn't know what "${n}" is`,
        whatHappened: `Your code uses the name ${c(n)}, but nothing with that name exists yet. Either it was never created, it's spelled differently, or it was created somewhere this line can't see.`,
        metaphor: `It's like asking a friend to "grab the box labeled ${n}" when no box has that label. Your friend isn't being difficult. They looked, and it isn't there. Variables are labeled boxes, and the computer can only grab boxes that are already on the shelf.`,
        steps: [
          `Check the spelling of ${c(n)}. Capital letters count: ${c('Total')} and ${c('total')} are two different names.`,
          `Press Ctrl+F and search for ${c(n)} to find where you meant to create it.`,
          `If you never created it, add a line that gives it a starting value above this line.`,
          `If you did create it, make sure that line runs first and isn't hidden inside a different function.`,
          `If ${c(n)} was meant to be a word of text, not a name, put quote marks around it: ${c(`"${n}"`)}.`,
        ],
        remember: 'You have to create a name before you can use it.',
      };
    },
  },
  {
    id: 'expected-indent',
    patterns: [/expected an indented block/i, /Expected indented block/i],
    build: () => ({
      title: 'Python expected some indented code here',
      whatHappened: `A line ending with a colon (like ${c('if')}, ${c('for')}, ${c('def')} or ${c('while')}) promises that the next lines will be pushed to the right. Python reached the next line, and it wasn't.`,
      metaphor: `Think of the colon as a chapter heading in a book. Python expects the chapter's text to start right under it, indented. Right now there's a heading followed by a blank page.`,
      steps: [
        'Find the line just above this one that ends with a colon (:).',
        'Put your cursor at the start of the next line and press Tab, so it sits further right than the colon line.',
        `If you haven't written that part yet, type ${c('pass')} there as a placeholder. It means "nothing to do yet."`,
      ],
      remember: 'A colon at the end of a line means: indent the next line.',
    }),
  },
  {
    id: 'unexpected-indent',
    patterns: [/unexpected indent/i, /Unexpected indentation/i],
    build: () => ({
      title: "This line is pushed in when it shouldn't be",
      whatHappened: `This line starts further right than Python expects. In Python, the spaces at the start of a line aren't decoration. They show which lines belong together.`,
      metaphor: `It's like a shopping list where one item is indented as a sub-item, but there's no main item above it to belong to. Python can't tell what group this line is part of.`,
      steps: [
        'Look at the line above. Does it end with a colon (:)? If not, this line should line up with it, not sit further right.',
        'Delete the extra spaces so this line starts in the same column as the line above.',
        'Watch for one stray space at the start of the line. It is easy to miss.',
      ],
      remember: 'In Python, lines that line up belong together.',
    }),
  },
  {
    id: 'unindent-mismatch',
    patterns: [
      /unindent does not match any outer indentation level/i,
      /Unindent not expected/i,
      /inconsistent use of tabs and spaces/i,
      /Unindent amount does not match previous indent/i,
    ],
    build: () => ({
      title: "This line's spacing doesn't line up with anything",
      whatHappened: `This line moved left, but it doesn't line up exactly with any line above it. Usually it's one space off, or a mix of tabs and spaces that look the same but aren't.`,
      metaphor: `Picture parking spaces painted on the ground. Each line has to park exactly in one of the spaces used above it. This line parked halfway between two spaces.`,
      steps: [
        'Compare where the text starts on this line with the lines above it.',
        'Delete all the spaces at the start of this line, then press Tab until it lines up with the right block.',
        `To clean up the whole file, press Ctrl+Shift+P and run ${c('Convert Indentation to Spaces')}.`,
      ],
      remember: "Pick tabs or spaces, and don't mix them.",
    }),
  },
  {
    id: 'missing-colon',
    patterns: [/Expected ['"]:['"]/i, /expected ':'/i],
    build: () => ({
      title: 'This line needs a colon (:) at the end',
      whatHappened: `Lines that start a block (${c('if')}, ${c('else')}, ${c('for')}, ${c('while')}, ${c('def')}, ${c('class')}) must end with a colon. Python found one without it.`,
      metaphor: `The colon works like "Ingredients:" on a recipe card. It tells the reader "the list starts now." Without it, Python doesn't know the indented lines below belong to this line.`,
      steps: [
        'Go to the end of this line, or the line just above it.',
        'Type a colon (:) at the very end.',
        'Check that the lines that belong to it are indented underneath.',
      ],
      remember: 'if, else, for, while, def, class: end the line with a colon.',
    }),
  },
  {
    id: 'unclosed-bracket',
    patterns: [
      /['"]?([\(\[\{])['"]? was never closed/i,
      /["']?([\(\[\{])["']? was not closed/i,
      /unexpected EOF while parsing/i,
    ],
    build: (g) => {
      const b = pick(g, 1, 2);
      return {
        title: 'A bracket was opened but never closed',
        whatHappened: `There's an opening ${b ? c(b) : 'bracket'} with no matching closing one. Python kept reading, waiting for it to close, until it hit something that made no sense.`,
        metaphor: `Brackets are like a pair of bookends. You set one down and Python waits for the other. Without the second bookend, everything after it slides into the wrong place.`,
        steps: [
          'Look at this line and the line above it. The missing bracket is usually close by, even if the error points a bit later.',
          'Count the opening and closing brackets on the line. They should match.',
          "Click right after an opening bracket. VS Code highlights its partner. If nothing lights up, that's the one missing its partner.",
        ],
        remember: 'Every ( [ { needs a matching ) ] }.',
      };
    },
  },
  {
    id: 'unterminated-string',
    patterns: [
      /unterminated string literal/i,
      /String literal is unterminated/i,
      /EOL while scanning string literal/i,
      /Unterminated string/i,
      /Newline in constant/i, // C#
    ],
    build: () => ({
      title: 'Some text is missing its closing quote',
      whatHappened: `Text in code goes between quote marks, like ${c('"hello"')}. This line opens a quote but never closes it, so the rest of the line gets swallowed into the text.`,
      metaphor: `It's like a story where a character starts talking and the closing quote mark is missing. The reader can't tell where the character stops and the narrator starts again.`,
      steps: [
        'Find the text on this line that starts with " or \'.',
        'Add the same kind of quote mark at the end of the text.',
        `If the text contains a quote itself, like don't, wrap it in the other kind: ${c(`"don't"`)}.`,
      ],
      remember: 'Quotes come in pairs, and both must be the same kind.',
    }),
  },
  {
    id: 'str-int-concat',
    patterns: [
      /can only concatenate str \(not ["']?(\w+)["']?\) to str/i,
      /unsupported operand type\(s\) for \+: ['"](int|float)['"] and ['"](str)['"]/i,
      /Operator "\+" not supported for types "(?:str|int|float|Literal[^"]*)" and "(?:str|int|float|Literal[^"]*)"/i,
    ],
    build: () => ({
      title: "You're adding text and a number together",
      whatHappened: `One side of the ${c('+')} is text (a "string") and the other is a number. Python won't guess whether you want math or want to join words, so it stops.`,
      metaphor: `It's like asking someone to add 3 to the word "banana." Should they write "3banana"? Count something? Python refuses to guess. You have to make both sides the same kind of thing first.`,
      steps: [
        `Find the ${c('+')} on this line. Work out which side is text and which is a number.`,
        `To join them as words, turn the number into text with ${c('str()')}: ${c('"Age: " + str(age)')}.`,
        `To do math, turn the text into a number with ${c('int()')} or ${c('float()')}: ${c('int(answer) + 1')}.`,
        `For building sentences, an f-string is easiest: ${c('f"Age: {age}"')}.`,
      ],
      remember: "Text and numbers don't mix with +. Convert one of them first.",
    }),
  },
  {
    id: 'none-value',
    patterns: [
      /['"]NoneType['"] object/i,
      /is not a known attribute of "None"/i,
      /Object of type "None" (?:is not|cannot)/i,
    ],
    build: () => ({
      title: 'Something you are using is empty (None)',
      whatHappened: `This line uses a value that turned out to be ${c('None')}, Python's word for "nothing here." Very often it comes from a function that didn't ${c('return')} anything.`,
      metaphor: `It's like ordering a pizza, opening the box, and finding it empty. The box (your variable) arrived, but nothing was put in it. Usually the kitchen (a function) forgot to put the pizza in, which means it's missing a ${c('return')}.`,
      steps: [
        `Find which value on this line is ${c('None')}. Add ${c('print(...)')} just before this line to check each one.`,
        `Trace back where that value came from. If it came from a function, check the function has a ${c('return')} line.`,
        `Watch for methods that change a list and hand back ${c('None')}: ${c('nums = nums.sort()')} empties ${c('nums')}. Write ${c('nums.sort()')} on its own line instead.`,
      ],
      remember: 'A function with no return hands back None.',
    }),
  },
  {
    id: 'undefined-property-js',
    patterns: [
      /Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading ['"]([^'"]+)['"]\))?/i,
      /undefined is not an object/i,
      /Object is possibly '(undefined|null)'/i,
    ],
    build: (g) => {
      const what = pick(g, 1, 3) ?? 'undefined';
      const prop = pick(g, 2);
      return {
        title: `The code looked inside something that is ${what}`,
        whatHappened: `The code tried to get ${prop ? c('.' + prop) : 'something'} from a value, but that value is ${c(what)}, JavaScript's way of saying "there's nothing here."`,
        metaphor: `It's like reaching into a drawer for a spoon, but the drawer itself isn't there. You can't take something out of a drawer that doesn't exist.`,
        steps: [
          `Find what comes just before ${prop ? c('.' + prop) : 'the dot'} on this line. That's the empty value.`,
          `Add ${c('console.log(thatValue)')} just before this line to see what it really holds.`,
          'Check whether the data has not loaded yet, a name is misspelled, or a function forgot to return.',
          `To be safe, use ${c('?.')}: ${c('user?.name')} gives ${c('undefined')} instead of crashing.`,
        ],
        remember: 'Make sure something exists before looking inside it.',
      };
    },
  },
  {
    id: 'not-callable',
    patterns: [/['"](\w+)['"] object is not callable/i, /(\S+) is not a function/i],
    build: (g) => {
      const t = pick(g, 1, 2) ?? 'value';
      return {
        title: 'Your code tried to "run" something that isn\'t a function',
        whatHappened: `Putting ${c('( )')} after a name means "run this." But ${c(t)} isn't a function, so there's nothing to run.`,
        metaphor: `It's like pressing "start" on a cookbook. A cookbook holds recipes, but it doesn't do anything when you press it. Only machines (functions) can be started.`,
        steps: [
          `Look for a name followed by ${c('( )')} on this line.`,
          `Check whether you reused a built-in name for a variable, like ${c('list = [1, 2]')} or ${c('str = "hi"')}. That replaces the original function.`,
          `If you meant to get an item, use square brackets: ${c('items[0]')}, not ${c('items(0)')}.`,
          `If you meant to multiply, add the ${c('*')}: ${c('2 * (3 + 4)')}, not ${c('2(3 + 4)')}.`,
        ],
        remember: '( ) means "run it". [ ] means "look inside it".',
      };
    },
  },
  {
    id: 'wrong-arg-count',
    patterns: [
      /takes (\d+) positional arguments? but (\d+) (?:were|was) given/i,
      /missing (\d+) required positional arguments?/i,
      /Expected (\d+) (?:positional )?arguments?, but got (\d+)/i,
      /Expected (\d+) positional arguments?/i,
      /Argument missing for parameter/i,
      /No overload for method ['"](\w+)['"] takes (\d+) arguments/i, // C#
    ],
    build: () => ({
      title: 'The function got the wrong number of inputs',
      whatHappened: 'When a function is created, it says how many inputs it needs. This line gives it a different number.',
      metaphor: `It's like a vending machine that takes exactly two coins. Put in one and it just waits. Put in three and it jams. A function needs exactly the inputs it was built for.`,
      steps: [
        `Find where the function is created (the ${c('def')} line) and count the names in its parentheses.`,
        'Count the values you pass in on this line, and make the two counts match.',
        `If the function is inside a class, don't count ${c('self')}. Python fills that in for you, but ${c('self')} must be listed in the ${c('def')}.`,
        'Hover over the function name in VS Code to see the inputs it expects.',
      ],
      remember: 'The inputs you pass in must match the inputs the function asks for.',
    }),
  },
  {
    id: 'index-out-of-range',
    patterns: [/list index out of range/i, /index out of range/i, /Index was outside the bounds of the array/i],
    build: () => ({
      title: "You asked for a spot in the list that doesn't exist",
      whatHappened: 'Lists number their items starting from 0. This line asked for a position past the end of the list.',
      metaphor: `Picture an egg carton holding 3 eggs, in spots 0, 1 and 2. Asking for egg number 3 is reaching for a spot that isn't there. The carton ends at 2.`,
      steps: [
        `Print the list's length just before this line: ${c('print(len(my_list))')}.`,
        `Remember the last item is at ${c('len(my_list) - 1')}, not ${c('len(my_list)')}.`,
        `In a loop, use ${c('for item in my_list:')} so Python does the counting for you.`,
        `If the list could be empty, check ${c('if my_list:')} before reading from it.`,
      ],
      remember: 'A list of 3 items has spots 0, 1 and 2.',
    }),
  },
  {
    id: 'key-error',
    patterns: [/KeyError: ['"]?([^'"\n]+?)['"]?\s*$/m, /The given key ['"]([^'"]+)['"] was not present/i],
    build: (g) => {
      const k = pick(g, 1, 2) ?? 'that key';
      return {
        title: `There's no "${k}" in this dictionary`,
        whatHappened: `You looked up ${c(k)} in a dictionary, but the dictionary doesn't have that key.`,
        metaphor: `A dictionary works like a coat check. You hand over a ticket (the key) and get your coat back (the value). This ticket was never handed out, so there's no coat to return.`,
        steps: [
          `Print the keys just before this line to see what's really there: ${c('print(my_dict.keys())')}.`,
          `Check spelling and capital letters. ${c('"Name"')} and ${c('"name"')} are different keys.`,
          `If the key might be missing, use ${c(`my_dict.get("${k}")`)}. It gives back ${c('None')} instead of crashing.`,
        ],
        remember: "Use .get() when you're not sure a key is there.",
      };
    },
  },
  {
    id: 'no-attribute',
    patterns: [
      /['"](\w+)['"] object has no attribute ['"](\w+)['"]/i,
      /Cannot access attribute ["'](\w+)["'] for class ["']([^"']+)["']/i,
      /Property ['"](\w+)['"] does not exist on type ['"]([^'"]+)['"]/i,
      /['"]([^'"]+)['"] does not contain a definition for ['"](\w+)['"]/i, // C#
    ],
    build: (g) => {
      // Pylance / TS / C# put attribute and type in a different order.
      let type = g[1];
      let attr = g[2];
      if (g[3] !== undefined) {
        attr = g[3];
        type = g[4];
      } else if (g[5] !== undefined) {
        attr = g[5];
        type = g[6];
      } else if (g[7] !== undefined) {
        type = g[7];
        attr = g[8];
      }
      type = type ?? 'value';
      attr = attr ?? 'that';
      return {
        title: `A ${type} doesn't have anything called "${attr}"`,
        whatHappened: `After a dot you can only use things that belong to that kind of value. This line uses ${c('.' + attr)}, but a ${c(type)} doesn't have it.`,
        metaphor: `It's like looking for the "play music" button on a toaster. Toasters have buttons, just not that one. Every kind of value comes with its own set of buttons, and ${c(attr)} isn't one of the ${type}'s.`,
        steps: [
          `Check the spelling and capital letters of ${c(attr)}.`,
          `Make sure the value really is a ${c(type)}. Hover over it in VS Code, or print ${c('type(...)')} in Python.`,
          'Type the value followed by a dot and wait a moment. VS Code will list the buttons it really has.',
        ],
        remember: 'After the dot, use only what belongs to that type.',
      };
    },
  },
  {
    id: 'module-not-found',
    patterns: [
      /No module named ['"]([\w\.]+)['"]/i,
      /Import ["']([\w\.]+)["'] could not be resolved/i,
      /Cannot find module ['"]([^'"]+)['"]/i,
    ],
    build: (g) => {
      const m = pick(g, 1, 2, 3) ?? 'that package';
      const isJs = g[3] !== undefined;
      return {
        title: `Your code can't find "${m}"`,
        whatHappened: `Your code brings in ${c(m)}, but it isn't installed where this code runs, or the name is spelled differently.`,
        metaphor: `It's like a recipe that says "use the stand mixer" when there's no mixer in this kitchen. You either need to get one (install it), or make sure you're cooking in the kitchen that has it (the right environment).`,
        steps: [
          `Check the spelling of ${c(m)}.`,
          isJs
            ? `Install it from the VS Code terminal: ${c('npm install ' + m)}. If it's your own file, start the path with ${c('./')}.`
            : `Install it from the VS Code terminal: ${c('pip install ' + m)}.`,
          isJs
            ? 'Make sure the terminal is open in the same folder as your package.json.'
            : 'If it is already installed, VS Code may be using a different Python. Click the Python version in the bottom-right corner and pick the one you installed it into.',
          isJs
            ? 'Restart VS Code if the error stays after installing.'
            : `Some packages install under a different name than you import. For example, you import ${c('cv2')} but install ${c('opencv-python')}.`,
        ],
        remember: 'Packages must be installed before you can import them.',
      };
    },
  },
  {
    id: 'zero-division',
    patterns: [/division by zero/i, /ZeroDivisionError/i, /Attempted to divide by zero/i],
    build: () => ({
      title: 'The code tried to divide by zero',
      whatHappened: 'Something on this line is being divided by a value that is 0. Math has no answer for that, so the program stops.',
      metaphor: `Try sharing 10 cookies among 0 friends. How many does each friend get? The question has no answer, and the computer agrees.`,
      steps: [
        `Find the ${c('/')}, ${c('//')} or ${c('%')} on this line and look at the value on the right side.`,
        'Print that value just before this line to find out why it is 0.',
        `If 0 can happen (like an empty list's length), check first: ${c('if count != 0:')}.`,
      ],
      remember: 'Check for zero before you divide.',
    }),
  },
  {
    id: 'bad-number-text',
    patterns: [
      /invalid literal for int\(\) with base 10: ['"](.*)['"]/i,
      /could not convert string to float: ['"](.*)['"]/i,
      /Input string was not in a correct format/i,
    ],
    build: (g) => {
      const raw = g[1] ?? g[2]; // may be '' when the input was empty
      const v = raw === undefined ? 'this text' : raw.trim() === '' ? '(empty)' : raw;
      return {
        title: `"${v}" can't be turned into a number`,
        whatHappened: `${c('int()')} and ${c('float()')} turn text into numbers. But ${c(v)} doesn't look like a number, so Python doesn't know which number you mean.`,
        metaphor: `It's like asking a cashier to ring up "twelve-ish dollars." They need real digits. ${c('int()')} is a very literal cashier: plain digits only.`,
        steps: [
          'Print the value just before this line to see exactly what it holds. Look for spaces, letters or an empty value.',
          `If it came from ${c('input()')}, the person may have typed something that isn't a number. Use ${c('.strip()')} to remove extra spaces.`,
          `For decimals like 3.5, use ${c('float()')} instead of ${c('int()')}.`,
          `To handle bad typing gracefully, wrap it in ${c('try:')} / ${c('except ValueError:')} and ask again.`,
        ],
        remember: 'int() only accepts text made of digits.',
      };
    },
  },
  {
    id: 'recursion',
    patterns: [/maximum recursion depth exceeded/i, /Maximum call stack size exceeded/i, /Stack overflow/i],
    build: () => ({
      title: 'A function kept calling itself and never stopped',
      whatHappened: 'A function calls itself, which calls itself again, over and over, until the computer runs out of room to keep track.',
      metaphor: `It's like two mirrors facing each other: the reflections go on forever. A function that calls itself needs a moment where it stops and answers without calling itself again.`,
      steps: [
        'Find the function that calls itself.',
        `Make sure it has a stopping point: an ${c('if')} that returns an answer without calling itself.`,
        `Check that each call gets closer to that stopping point (for example ${c('n - 1')}, not ${c('n')}).`,
      ],
      remember: 'Every self-calling function needs a way to stop.',
    }),
  },
  {
    id: 'type-mismatch',
    patterns: [
      /Type ['"]([^'"]+)['"] is not assignable to type ['"]([^'"]+)['"]/i,
      /Cannot implicitly convert type ['"]([^'"]+)['"] to ['"]([^'"]+)['"]/i, // C#
      /Argument of type ['"]([^'"]+)['"] is not assignable to parameter of type ['"]([^'"]+)['"]/i,
    ],
    build: (g) => {
      const a = pick(g, 1, 3, 5) ?? 'value';
      const b = pick(g, 2, 4, 6) ?? 'something else';
      return {
        title: `A ${a} is going where a ${b} belongs`,
        whatHappened: `This spot was set up to hold a ${c(b)}, but the code is putting a ${c(a)} there.`,
        metaphor: `Think of a shape-sorter toy. This hole is shaped for a ${b}, and the code is pushing a ${a} into it. It won't fit, even if it's close.`,
        steps: [
          'Hover over the variable or input on this line to see which type it expects.',
          `Hover over the value you're giving it to see what type it really is.`,
          `Convert the value to the right type, or change what you're storing. For example, text "5" becomes the number 5 with ${c('Number("5")')} in JavaScript or ${c('int.Parse("5")')} in C#.`,
        ],
        remember: 'Each box only holds the type it was made for.',
      };
    },
  },
  {
    id: 'missing-semicolon',
    patterns: [/['"]?;['"]? expected/i],
    build: () => ({
      title: 'A semicolon (;) is missing',
      whatHappened: 'In this language, each instruction ends with a semicolon. One instruction here is missing its semicolon.',
      metaphor: `Semicolons are like the period at the end of a sentence. Without one, two sentences run together and the reader can't tell where one ends.`,
      steps: [
        'Look at the end of this line. Is there a ; there?',
        'If this line looks fine, check the end of the line above. The error often shows up one line late.',
        'Add the missing ; and the red squiggle should disappear.',
      ],
      remember: 'Every instruction ends with ;',
    }),
  },
  {
    id: 'invalid-syntax',
    patterns: [/invalid syntax/i, /SyntaxError/i, /Expected expression/i],
    build: () => ({
      title: "The computer couldn't read how this line is written",
      whatHappened: 'Something on this line breaks the language\'s grammar rules, like a typo that makes a sentence unreadable. The error usually points where the computer got confused, which can be just after the real mistake.',
      metaphor: `Imagine reading "I went the store to." You can tell something is wrong, but the real problem is a few words before where you got stuck. The computer is the same: look where it points, and a little before.`,
      steps: [
        'Check the line above this one for a missing ) or quote mark. Those often cause errors on the next line.',
        `Look for a missing colon (:) at the end of ${c('if')}, ${c('for')}, ${c('def')} or ${c('while')} lines.`,
        `Inside an ${c('if')}, check you used ${c('==')} (compare) and not ${c('=')} (store).`,
        'Look for missing commas between items in a list.',
      ],
      remember: 'Syntax errors are often one line earlier than where they show up.',
    }),
  },
];

/** Shown when nothing matches and AI is off or unavailable. */
export const GENERAL: Explanation = {
  title: "Here's how to read this message",
  whatHappened:
    "There's no ready-made guide for this one yet. The good news: most error messages follow the same pattern, so you can decode them step by step.",
  metaphor:
    "Reading an error message is like reading a note from a car mechanic. One part says WHAT is broken and another says WHERE to look. You don't need to understand every word to get started.",
  steps: [
    'Read the last line of the message first. It usually names the kind of problem.',
    'Go to the line number it mentions and read that line slowly, word by word.',
    'Copy the main part of the message (without your own file names) and search for it online.',
    'Change one small thing, run again, and see if the message changes.',
  ],
  remember: 'The error tells you where to look, even when it doesn\'t say what to do.',
  source: 'general',
};

export interface KnownMatch {
  id: string;
  explanation: Explanation;
}

/** Find a hand-written explanation for an error message, if there is one. */
export function matchKnown(...texts: (string | undefined)[]): KnownMatch | undefined {
  for (const text of texts) {
    if (!text) {
      continue;
    }
    for (const entry of ENTRIES) {
      for (let p = 0; p < entry.patterns.length; p++) {
        const m = text.match(entry.patterns[p]);
        if (m) {
          // Place this pattern's groups into a shared numbering so build()
          // can find them: pattern 0 → slots 1..k, pattern 1 → next slots, etc.
          const groups: string[] = [m[0]];
          let slot = 1;
          for (let q = 0; q < entry.patterns.length; q++) {
            const count = countGroups(entry.patterns[q]);
            for (let i = 1; i <= count; i++) {
              groups[slot++] = q === p ? m[i] : (undefined as unknown as string);
            }
          }
          return { id: entry.id, explanation: { ...entry.build(groups), source: 'built-in' } };
        }
      }
    }
  }
  return undefined;
}

/** Number of capturing groups in a regex. */
function countGroups(re: RegExp): number {
  return new RegExp(re.source + '|').exec('')!.length - 1;
}
