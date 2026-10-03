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

/** A keyboard shortcut written for this computer: Ctrl on Windows and Linux, Cmd on a Mac. */
const key = (shortcut: string) => (process.platform === 'darwin' ? shortcut.replace('Ctrl', 'Cmd') : shortcut);

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
 * Pylance describes a value it already knows as Literal[5] or Literal['hi'].
 * Turn that into the plain type name a learner would recognise.
 */
const plainType = (type: string | undefined) => {
  const literal = type?.match(/^Literal\[(.*)\]$/);
  if (!literal) {
    return type;
  }
  if (/^['"]/.test(literal[1])) {
    return 'str';
  }
  return /^(True|False)$/.test(literal[1]) ? 'bool' : 'int';
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
      /["'](\w+)["'] is unbound/i,
    ],
    build: (g) => {
      const n = pick(g, 1, 2, 3, 4) ?? 'this variable';
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
          `Press ${key('Ctrl+F')} and search for ${c(n)} to find where you meant to create it.`,
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
        `To clean up the whole file, press ${key('Ctrl+Shift+P')} and run ${c('Convert Indentation to Spaces')}.`,
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
      /(?:^|\s)['"]?([\)\]\}])['"]? expected/i, // TypeScript "')' expected.", C# ") expected"
    ],
    build: (g) => {
      // TypeScript names the closing bracket it wanted, so work out its opening partner.
      const partner: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
      const b = pick(g, 1, 2) ?? partner[g[3]];
      return {
        title: 'A bracket was opened but never closed',
        whatHappened: `There's an opening ${b ? c(b) : 'bracket'} with no matching closing one. The computer kept reading, waiting for it to close, until it hit something that made no sense.`,
        metaphor: `Brackets are like a pair of bookends. You set one down and the computer waits for the other. Without the second bookend, everything after it slides into the wrong place.`,
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
      /['"]NoneType['"]/i,
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
      /'([^']+)' is possibly '(undefined|null)'/i, // newer TypeScript wording
    ],
    build: (g) => {
      const what = pick(g, 1, 3, 5) ?? 'undefined';
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
    patterns: [
      /['"](\w+)['"] object is not callable/i,
      /(\S+) is not a function/i,
      /Object of type "([^"]+)" is not callable/i, // Pylance
    ],
    build: (g) => {
      const t = pick(g, 1, 2) ?? plainType(g[3]) ?? 'value';
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
      /There is no argument given that corresponds to the required parameter/i, // C#
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
    patterns: [
      /list index out of range/i,
      /index out of range/i,
      /Index was outside the bounds of the array/i, // C# array
      /Index was out of range\. Must be non-negative/i, // C# List
    ],
    build: (g) => {
      const isCs = g[0] !== undefined && /^Index was/i.test(g[0]);
      return {
        title: "You asked for a spot in the list that doesn't exist",
        whatHappened: 'Lists number their items starting from 0. This line asked for a position past the end of the list.',
        metaphor: `Picture an egg carton holding 3 eggs, in spots 0, 1 and 2. Asking for egg number 3 is reaching for a spot that isn't there. The carton ends at 2.`,
        steps: isCs
          ? [
              `Print the size before this line: ${c('Console.WriteLine(items.Length);')} for an array, or ${c('items.Count')} for a List.`,
              `Remember the last item is at ${c('items.Length - 1')}, not ${c('items.Length')}.`,
              `In a loop, use ${c('foreach (var item in items)')} so C# does the counting for you.`,
              `In a ${c('for')} loop, check the condition uses ${c('<')}, not ${c('<=')}: ${c('i < items.Length')}.`,
            ]
          : [
              `Print the list's length just before this line: ${c('print(len(my_list))')}.`,
              `Remember the last item is at ${c('len(my_list) - 1')}, not ${c('len(my_list)')}.`,
              `In a loop, use ${c('for item in my_list:')} so Python does the counting for you.`,
              `If the list could be empty, check ${c('if my_list:')} before reading from it.`,
            ],
        remember: 'A list of 3 items has spots 0, 1 and 2.',
      };
    },
  },
  {
    id: 'key-error',
    patterns: [/KeyError: ['"]?([^'"\n]+?)['"]?\s*$/m, /The given key ['"]([^'"]+)['"] was not present/i],
    build: (g) => {
      const k = pick(g, 1, 2) ?? 'that key';
      const isCs = g[2] !== undefined;
      return {
        title: `There's no "${k}" in this dictionary`,
        whatHappened: `The code looked up ${c(k)} in a dictionary, but the dictionary doesn't have that key.`,
        metaphor: `A dictionary works like a coat check. You hand over a ticket (the key) and get your coat back (the value). This ticket was never handed out, so there's no coat to return.`,
        steps: isCs
          ? [
              `Print the keys before this line to see what's really there: ${c('Console.WriteLine(string.Join(", ", stock.Keys));')}.`,
              `Check spelling and capital letters. ${c('"Milk"')} and ${c('"milk"')} are different keys.`,
              `If the key might be missing, check first: ${c(`if (stock.TryGetValue("${k}", out int count))`)}.`,
            ]
          : [
              `Print the keys just before this line to see what's really there: ${c('print(my_dict.keys())')}.`,
              `Check spelling and capital letters. ${c('"Name"')} and ${c('"name"')} are different keys.`,
              `If the key might be missing, use ${c(`my_dict.get("${k}")`)}. It gives back ${c('None')} instead of crashing.`,
            ],
        remember: isCs ? "Use TryGetValue when you're not sure a key is there." : "Use .get() when you're not sure a key is there.",
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
    id: 'not-iterable',
    patterns: [
      /['"](\w+)['"] object is not iterable/i, // Python runtime
      /["']([^"']+)["'] is not iterable/i, // Pylance
    ],
    build: (g) => {
      const t = plainType(pick(g, 1, 2)) ?? 'value';
      return {
        title: `This ${t} isn't something you can loop over`,
        whatHappened: `A ${c('for')} loop goes through a group of things one at a time, like the items in a list or the letters in a word. This line gives it a ${c(t)}, which is one single value with nothing inside to go through.`,
        metaphor: `It's like being asked to read out every name on a guest list, then being handed the number 5 instead of the list. There are no names to read. A loop needs the list itself, not a count of how many there are.`,
        steps: [
          `Find the ${c('for')} loop on this line and look at what comes after ${c('in')}.`,
          `To repeat something a number of times, wrap the number in ${c('range()')}: ${c('for i in range(5):')}.`,
          `To go through a list, loop over the list itself, not its length: ${c('for item in items:')}, not ${c('for item in len(items):')}.`,
          'Print the value before the loop to check what it really holds.',
        ],
        remember: 'Loop over a list or a range(), not a single number.',
      };
    },
  },
  {
    id: 'not-subscriptable',
    patterns: [
      /['"](\w+)['"] object is not subscriptable/i, // Python runtime
      /"__getitem__" method not defined on type "([^"]+)"/i, // Pylance
    ],
    build: (g) => {
      const t = plainType(pick(g, 1, 2)) ?? 'value';
      return {
        title: `You can't use [ ] on this ${t}`,
        whatHappened: `Square brackets pull one item out of a group, like a list, a dictionary or a piece of text. This line uses them on a ${c(t)}, which is a single value with no items inside.`,
        metaphor: `Square brackets are like asking for "page 3" of something. That works for a book. It doesn't work for a single coin, because a coin has no pages.`,
        steps: [
          'Find the square brackets on this line and look at the name right before them.',
          `Print that value before this line to see what it really is: ${c('print(type(value))')}.`,
          `If you wanted one digit of a number, turn it into text first: ${c('str(price)[0]')}.`,
          'If you expected a list here, trace back to where the name got its value. It may have been replaced by a single number.',
        ],
        remember: '[ ] only works on things that hold other things.',
      };
    },
  },
  {
    id: 'bad-index-type',
    patterns: [
      /(?:list|tuple|string|str) indices must be integers/i, // Python runtime
      /No overloads for "__getitem__"/i, // Pylance
      /in function "__getitem__"/i, // Pylance (second message on the same line)
    ],
    build: () => ({
      title: 'A position in [ ] has to be a whole number',
      whatHappened: `Items in a list, and letters in a piece of text, are found by their position: 0, 1, 2 and so on. This line asks for one using something else, like a name in quotes. Looking things up by name is what a dictionary does.`,
      metaphor: `A list is like a row of numbered lockers. You can ask for locker 2, but you can't ask for "Ada's locker", because these lockers only have numbers on them. A dictionary is the row where every locker has a name tag.`,
      steps: [
        'Look inside the square brackets on this line. That value needs to be a whole number.',
        `If it is text that holds a number, like ${c('"2"')}, convert it first: ${c('items[int(position)]')}.`,
        `If you have a list of dictionaries, pick the dictionary first, then the key: ${c('members[0]["name"]')}.`,
        `If you want to look things up by name, store them in a dictionary: ${c('points = {"Ada": 120}')}.`,
      ],
      remember: 'Lists use numbers in [ ]. Dictionaries use keys.',
    }),
  },
  {
    id: 'immutable-item',
    patterns: [
      /['"](\w+)['"] object does not support item assignment/i, // Python runtime
      /"__setitem__" method not defined on type "([^"]+)"/i, // Pylance
    ],
    build: (g) => {
      const t = plainType(pick(g, 1, 2)) ?? 'value';
      return {
        title: `One piece of this ${t} can't be swapped for another`,
        whatHappened: `This line tries to replace one item inside a ${c(t)} using square brackets. Lists allow that. Text (${c('str')}) and tuples don't: once they are made, what is inside them stays fixed.`,
        metaphor: `Text in Python is like a printed sign. You can read any letter on it, but you can't rub one letter out and write a different one. To change the wording, you print a new sign.`,
        steps: [
          'Find the square brackets on the left of the = sign on this line.',
          `For text, build a new piece of text and store that: ${c('label = "b" + label[1:]')} or ${c('label = label.replace("B", "b")')}.`,
          `For a tuple, use a list instead so the items can change: ${c('[1, 2, 3]')}, not ${c('(1, 2, 3)')}.`,
          `If you need to change text one letter at a time, turn it into a list first: ${c('letters = list(label)')}.`,
        ],
        remember: 'To change text, make new text. Lists are the ones you can edit in place.',
      };
    },
  },
  {
    id: 'unpack-mismatch',
    patterns: [
      /too many values to unpack/i, // Python runtime
      /not enough values to unpack/i,
      /Tuple size mismatch/i, // Pylance
      /cannot be assigned to target tuple/i,
    ],
    build: () => ({
      title: "The number of names doesn't match the number of values",
      whatHappened: `This line splits a group of values into separate names, like ${c('name, points = record')}. That only works when there is exactly one value for each name. Here the two counts are different.`,
      metaphor: `It's like dealing cards to the players at a table, one card each. With three cards and two players, one card has nowhere to go. With two cards and three players, someone gets nothing. Python stops instead of guessing.`,
      steps: [
        'Count the names on the left of the = sign.',
        `Count the values on the right. If they come from ${c('.split()')} or a function, print the result first to see how many there are.`,
        'Add or remove names on the left so the two counts match.',
        `If you only need the first few values, catch the rest in a spare name with a star: ${c('name, points, *rest = record')}.`,
      ],
      remember: 'One name on the left for every value on the right.',
    }),
  },
  {
    id: 'comparison-types',
    patterns: [
      /['"]([<>]=?)['"] not supported between instances of ['"](\w+)['"] and ['"](\w+)['"]/i, // Python runtime
      /Operator "([<>]=?)" not supported for types "([^"]+)" and "([^"]+)"/i, // Pylance
      /Operator '([<>]=?)' cannot be applied to types '([^']+)' and '([^']+)'/i, // TypeScript
      /Operator '([<>]=?)' cannot be applied to operands of type '([^']+)' and '([^']+)'/i, // C#
    ],
    build: (g) => {
      const op = pick(g, 1, 4, 7, 10) ?? '<';
      const a = plainType(pick(g, 2, 5, 8, 11)) ?? 'value';
      const b = plainType(pick(g, 3, 6, 9, 12)) ?? 'value';
      const steps =
        g[7] !== undefined // TypeScript
          ? [
              `If the text is a number written in quotes, like ${c("'10'")}, remove the quotes.`,
              `Otherwise turn the text into a number before comparing: ${c('Number(text) > 10')}.`,
              'Hover over each side in VS Code to see what type it is.',
            ]
          : g[10] !== undefined // C#
            ? [
                `If the text is a number written in quotes, like ${c('"18"')}, remove the quotes.`,
                `If it came from ${c('Console.ReadLine()')}, turn it into a number before comparing: ${c('int.Parse(age) > 17')}.`,
                'Hover over each side in VS Code to see what type it is.',
              ]
            : [
                `Remember that ${c('input()')} always gives back text, even when someone types digits.`,
                `Turn the text into a number before comparing: ${c('int(age) >= 18')}.`,
                'Print both values before this line to see what each one really holds.',
              ];
      return {
        title: "You're comparing two different kinds of things",
        whatHappened: `The ${c(op)} on this line compares a ${c(a)} with a ${c(b)}. The computer can only say which is bigger when both sides are the same kind of thing.`,
        metaphor: `It's like asking which is bigger: a card with "eighteen" written on it, or 18 apples. One is writing and the other is an amount. You have to read the card and turn it into an amount before the question makes sense.`,
        steps: [`Find the ${c(op)} on this line and work out which side is text and which is a number.`, ...steps],
        remember: 'Compare numbers with numbers, and text with text.',
      };
    },
  },
  {
    id: 'wrong-types-math',
    patterns: [
      /unsupported operand type\(s\) for ([-+*\/%]+): ['"](\w+)['"] and ['"](\w+)['"]/i, // Python runtime
      /Operator "([-*\/%]+)" not supported for types "([^"]+)" and "([^"]+)"/i, // Pylance
      /can't multiply sequence by non-int of type ['"](\w+)['"]/i,
      /Operator '([-*\/%])' cannot be applied to operands of type '([^']+)' and '([^']+)'/i, // C#
    ],
    build: (g) => {
      const op = pick(g, 1, 4, 8) ?? '*';
      const a = plainType(pick(g, 2, 5, 9)) ?? 'list or text';
      const b = plainType(pick(g, 3, 6, 7, 10)) ?? 'value';
      const isCs = g[8] !== undefined;
      return {
        title: `You can't use ${op} between ${a} and ${b}`,
        whatHappened: `The ${c(op)} on this line has a ${c(a)} on one side and a ${c(b)} on the other. This kind of math only works when both sides are numbers. Very often one side is text that looks like a number, such as ${c('"4"')}.`,
        metaphor: `It's like trying to subtract 4 from a price tag. The tag has "10" printed on it, but it is a piece of card, not an amount of money. Read the number off the tag first, then do the math.`,
        steps: isCs
          ? [
              `Find the ${c(op)} on this line and work out which side isn't a number.`,
              `Remember that ${c('Console.ReadLine()')} always gives back text, even when someone types digits.`,
              `Turn text into a number before doing math: ${c('int.Parse(paid) - 4')} for whole numbers, ${c('double.Parse(paid) - 4')} for decimals.`,
              'Hover over each side in VS Code to see what type it is.',
            ]
          : [
              `Find the ${c(op)} on this line and work out which side isn't a number.`,
              `Remember that ${c('input()')} always gives back text, even when someone types digits.`,
              `Turn text into a number before doing math: ${c('int(paid) - 4')} for whole numbers, ${c('float(paid) - 4')} for decimals.`,
              'Print both values before this line to see what each one really holds.',
            ],
        remember: 'Turn text into a number before doing math with it.',
      };
    },
  },
  {
    id: 'null-reference',
    patterns: [/Object reference not set to an instance of an object/i, /NullReferenceException/], // C# runtime
    build: () => ({
      title: 'The code used something that is empty (null)',
      whatHappened: `This line uses a value that is ${c('null')}, C#'s word for "nothing here." Putting a dot after ${c('null')}, like ${c('name.Length')}, has nothing to look inside, so the program stops.`,
      metaphor: `It's like a pizza box that arrives empty. The box (the variable) is there, but nothing was put in it, so there is no slice to take. Somewhere earlier, the code that should have filled it didn't.`,
      steps: [
        `Look at each name followed by a dot on this line. One of them is ${c('null')}.`,
        `Print each one before this line to find which: ${c('Console.WriteLine(nickname == null);')}.`,
        `Trace back to where that value came from. A method that can hand back ${c('null')}, like a search that finds nothing, is the usual cause.`,
        `Check before using it, ${c('if (nickname != null)')}, or skip safely with ${c('?.')}: ${c('nickname?.Length')}.`,
      ],
      remember: "Check that something isn't null before putting a dot after it.",
    }),
  },
  {
    id: 'possibly-null',
    patterns: [
      /Dereference of a possibly null reference/i, // C# warning CS8602
      /Converting null literal or possible null value to non-nullable type/i, // CS8600
      /Possible null reference (?:argument|assignment|return)/i, // CS8604, CS8601, CS8603
    ],
    build: () => ({
      title: 'This value might be empty (null)',
      whatHappened: `C# noticed that this value could be ${c('null')} ("nothing here") at this point, and the code uses it as if it always holds something. This is a warning, not an error: the program still runs, but it may crash here.`,
      metaphor: `It's like a parcel tracker that says "may not have been delivered." You can still go and open the parcel, but you might find nothing on the doorstep. C# is suggesting you check the doorstep first.`,
      steps: [
        `Find where the value comes from. ${c('Console.ReadLine()')}, and searches that find nothing, can both hand back ${c('null')}.`,
        `Check for ${c('null')} before using it: ${c('if (name != null)')}.`,
        `Or give it a backup value with ${c('??')}: ${c('string name = Console.ReadLine() ?? "";')}.`,
      ],
      remember: 'When a value might be null, check it or give it a backup.',
    }),
  },
  {
    id: 'unassigned-local',
    patterns: [/Use of unassigned local variable '(\w+)'/i], // C#
    build: (g) => {
      const n = g[1] ?? 'this variable';
      return {
        title: `"${n}" is used before it gets a value`,
        whatHappened: `C# requires every variable to be given a value before it is read. ${c(n)} is created on an earlier line, but nothing has been stored in it by the time this line uses it.`,
        metaphor: `It's like a jar with a label on it but nothing inside. The label (the variable's name) is there, but nobody has filled the jar, so there is nothing to scoop out.`,
        steps: [
          `Find the line where ${c(n)} is created, like ${c('int ' + n + ';')}.`,
          `Give it a starting value there: ${c('int ' + n + ' = 0;')}.`,
          `If it only gets a value inside an ${c('if')}, set a starting value before the ${c('if')} so every path has one.`,
        ],
        remember: 'Give a variable a value before you read it.',
      };
    },
  },
  {
    id: 'missing-using',
    patterns: [/The type or namespace name '(\w+)' could not be found/i], // C#
    build: (g) => {
      const n = g[1] ?? 'this name';
      return {
        title: `C# can't find "${n}"`,
        whatHappened: `C# keeps its ready-made tools in namespaces (named toolboxes). ${c(n)} lives in a toolbox this file hasn't opened, or the name is spelled differently.`,
        metaphor: `It's like looking for the stapler in your desk when it's kept in the supply cupboard. It exists, but you have to open the right cupboard first. A ${c('using')} line at the top of the file opens it.`,
        steps: [
          `Check the spelling and capital letters of ${c(n)}.`,
          `Click on ${c(n)} and press ${key('Ctrl+.')}. VS Code usually offers to add the missing ${c('using')} line for you.`,
          `Or add it by hand at the top of the file. For example, ${c('StringBuilder')} needs ${c('using System.Text;')}.`,
          'If it is a class you wrote yourself, check that its file is inside this project folder.',
        ],
        remember: 'Some tools need a using line at the top of the file.',
      };
    },
  },
  {
    id: 'static-context',
    patterns: [/An object reference is required for the non-static field, method, or property '([^']+)'/i], // C#
    build: (g) => {
      const full = g[1] ?? 'this method';
      const name = full.replace(/\(.*\)$/, '').split('.').pop() ?? full;
      return {
        title: `"${name}" needs an object, and this code doesn't have one`,
        whatHappened: `${c('static')} code, like ${c('Main')}, runs on its own, without an object (one made with ${c('new')}). ${c(name)} isn't ${c('static')}, so it only works on a particular object, and this line doesn't have one.`,
        metaphor: `It's like the horn button in a car: it belongs to one particular car. Standing in the car park, you can't press "honk" until you pick a car. ${c('static')} code is the car park: it has no car of its own until you make one with ${c('new')}.`,
        steps: [
          `For a small program, the quickest fix is to add ${c('static')} to the start of ${c(name)}'s first line, like ${c('static int ' + name + '()')}.`,
          `Or make an object first and call it on that: ${c('var program = new Program();')} then ${c('program.' + name + '();')}.`,
          `Remember: inside a ${c('static')} method, you can only use other ${c('static')} things directly.`,
        ],
        remember: 'static methods can only call other static methods directly.',
      };
    },
  },
  {
    id: 'invalid-cast',
    patterns: [/Unable to cast object of type '([^']+)' to type '([^']+)'/i], // C# runtime
    build: (g) => {
      // .NET names types like System.Int32. Show the names a learner types instead.
      const friendly: Record<string, string> = { Int32: 'int', Int64: 'long', String: 'string', Double: 'double', Boolean: 'bool', Decimal: 'decimal' };
      const short = (t: string | undefined) => {
        const last = (t ?? 'value').split('.').pop()!;
        return friendly[last] ?? last;
      };
      const from = short(g[1]);
      const to = short(g[2]);
      return {
        title: `A ${from} can't become a ${to} with a cast`,
        whatHappened: `A cast like ${c(`(${to})value`)} only works when the value already is a ${c(to)} underneath. This value is really a ${c(from)}, so C# can't treat it as a ${c(to)}.`,
        metaphor: `A cast is like relabelling a box. If the box really holds apples, an "apples" label is fine. If it holds oranges, a new label doesn't turn them into apples.`,
        steps: [
          'Find the cast on this line: a type in round brackets in front of a value.',
          from === 'string'
            ? `To turn text into a number, use ${c(`${to}.Parse(text)`)} instead of a cast.`
            : `Use a conversion instead of a cast, like ${c(`Convert.To${g[2]?.split('.').pop() ?? 'Int32'}(value)`)}.`,
          'Hover over the value to see its real type, and trace back to where it came from.',
          `To check the type safely first, use ${c(`if (value is ${to} result)`)}.`,
        ],
        remember: 'A cast relabels a value. It does not convert it.',
      };
    },
  },
  {
    id: 'file-not-found',
    patterns: [
      /No such file or directory: ['"]([^'"]+)['"]/i, // Python
      /Could not find (?:file|a part of the path) ['"]([^'"]+)['"]/i, // C#
      /ENOENT: no such file or directory, \w+ ['"]([^'"]+)['"]/i, // Node
    ],
    build: (g) => {
      const file = (pick(g, 1, 2, 3) ?? 'that file').split(/[\\/]/).pop()!;
      return {
        title: `The file "${file}" couldn't be found`,
        whatHappened: `The code tried to open ${c(file)}, but there's no file with that name where it looked. A file name with no folder in front is looked for in the folder the program is running from, which isn't always the folder the code is in.`,
        metaphor: `It's like asking someone to "grab the folder from the top drawer" without saying which desk. They check the drawer of the desk they're standing at. If the folder is in a different desk, they come back empty-handed.`,
        steps: [
          `Check the file name's spelling and its ending, like ${c('.csv')} or ${c('.txt')}.`,
          'Look at which folder the terminal is in. It is shown at the start of each terminal line.',
          'Move the file into that folder, or run the program from the folder that holds the file.',
          "Or use the file's full location: right-click the file in VS Code's Explorer, choose Copy Path, and paste that into your code.",
        ],
        remember: 'A file name on its own is looked for in the folder the program runs from.',
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
      /Input string was not in a correct format/i, // C# (older .NET)
      /input string ['"](.*)['"] was not in a correct format/i, // C# (.NET 8 and later)
    ],
    build: (g) => {
      const raw = g[1] ?? g[2] ?? g[3]; // may be '' when the input was empty
      const v = raw === undefined ? 'this text' : raw.trim() === '' ? '(empty)' : raw;
      const isCs = g[0] !== undefined && /correct format/i.test(g[0]);
      if (isCs) {
        return {
          title: `"${v}" can't be turned into a number`,
          whatHappened: `${c('int.Parse()')} and ${c('double.Parse()')} turn text into numbers. But ${c(v)} doesn't look like a number, so C# doesn't know which number you mean.`,
          metaphor: `It's like asking a cashier to ring up "twelve-ish dollars." They need real digits. ${c('int.Parse()')} is a very literal cashier: plain digits only.`,
          steps: [
            'Print the text before this line to see exactly what it holds. Look for spaces, letters or an empty value.',
            `If it came from ${c('Console.ReadLine()')}, the person may have typed something that isn't a number.`,
            `For decimals like 3.5, use ${c('double.Parse()')} instead of ${c('int.Parse()')}.`,
            `To handle bad typing gracefully, use ${c('int.TryParse(text, out int number)')}. It gives back ${c('false')} instead of crashing.`,
          ],
          remember: 'int.Parse() only accepts text made of digits.',
        };
      }
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
    id: 'missing-property',
    patterns: [/Property '(\w+)' is missing in type '.*' but required in type '([^']+)'/i],
    build: (g) => {
      const prop = g[1] ?? 'a required piece';
      const type = g[2] ?? 'object';
      return {
        title: `This ${type} is missing "${prop}"`,
        whatHappened: `Every ${c(type)} is defined as having a ${c(prop)}. The one created on this line leaves ${c(prop)} out.`,
        metaphor: `It's like handing in a form with a required box left empty. The office won't accept it until every required box is filled in. ${c(prop)} is a required box on the ${type} form.`,
        steps: [
          `Find where the object is created on this line (the part inside ${c('{ }')}).`,
          `Add the missing piece inside the braces: ${c(prop + ': ...')}, with a value of the right type.`,
          `If ${c(prop)} is meant to be optional, add a question mark after its name where ${c(type)} is defined: ${c(prop + '?')}.`,
        ],
        remember: 'An object must include every required piece of its type.',
      };
    },
  },
  {
    id: 'implicit-any',
    patterns: [/Parameter '(\w+)' implicitly has an 'any' type/i],
    build: (g) => {
      const n = g[1] ?? 'input';
      return {
        title: `TypeScript needs to know what kind of value "${n}" is`,
        whatHappened: `In TypeScript, each input to a function is labelled with its type (the kind of value it holds), like ${c('number')} or ${c('string')}. The input ${c(n)} has no label, so TypeScript can't check that it is used correctly.`,
        metaphor: `It's like a row of storage jars where one has no label. Flour, sugar or salt? The label is what lets everyone use the jar correctly. A type is the label on an input.`,
        steps: [
          `Find ${c(n)} in the parentheses on the function's first line.`,
          `Add a colon and the type after it: ${c(n + ': number')} for a number, ${c(n + ': string')} for text, ${c(n + ': boolean')} for true or false.`,
          'Do the same for any other inputs that have a squiggle.',
        ],
        remember: 'In TypeScript, label every function input with its type.',
      };
    },
  },
  {
    id: 'const-reassign',
    patterns: [
      /Assignment to constant variable/i, // JavaScript runtime
      /Cannot assign to '(\w+)' because it is a constant/i, // TypeScript
    ],
    build: (g) => {
      const n = g[1];
      return {
        title: n ? `"${n}" was made with const, so it can't be given a new value` : "A name made with const can't be given a new value",
        whatHappened: `${c('const')} creates a name whose value is set once and stays that way. This line tries to give ${n ? c(n) : 'one of those names'} a new value.`,
        metaphor: `Think of a name tag pinned to a thing. With ${c('let')}, you can unpin the tag and pin it on something else. With ${c('const')}, the tag is glued on for good. This line is trying to move a glued tag.`,
        steps: [
          `Find where ${n ? c(n) : 'the name'} is created with ${c('const')}.`,
          `Change ${c('const')} to ${c('let')} there if the value is meant to change later.`,
          `Or keep ${c('const')} and store the new value under a new name: ${c('const newTotal = total + 5;')}.`,
        ],
        remember: 'Use let for values that change, and const for values that stay the same.',
      };
    },
  },
  {
    id: 'redeclared',
    patterns: [
      /Cannot redeclare block-scoped variable '(\w+)'/i, // TypeScript
      /Identifier '(\w+)' has already been declared/i, // JavaScript runtime
      /A local variable (?:or function )?named '(\w+)' is already defined/i, // C#
    ],
    build: (g) => {
      const n = pick(g, 1, 2, 3) ?? 'this name';
      const isCs = g[3] !== undefined;
      return {
        title: `"${n}" has been created twice`,
        whatHappened: isCs
          ? `Putting a type like ${c('int')} or ${c('string')} in front of a name creates a new variable. This code creates ${c(n)} twice in the same place, and each name can only be created once.`
          : `Words like ${c('let')} and ${c('const')} create a new name. This code creates ${c(n)} twice in the same place, and each name can only be created once.`,
        metaphor: `It's like two people in one classroom both writing "Sam" on their name badge. When the teacher calls "Sam", nobody knows who is meant. In one room, each name can belong to only one person.`,
        steps: [
          `Press ${key('Ctrl+F')} and search for ${c(n)} to find both places where it is created.`,
          isCs
            ? `If you meant to change the value, remove the type from the second one, so it reads ${c(n + ' = ...;')}.`
            : `If you meant to change the value, remove ${c('let')} or ${c('const')} from the second one, so it reads ${c(n + ' = ...')}.`,
          'If they are meant to be two different things, give one of them a different name.',
        ],
        remember: isCs
          ? 'Create a variable once. After that, use its name without the type in front.'
          : 'Create a name once. After that, use it without let or const.',
      };
    },
  },
  {
    id: 'missing-return',
    patterns: [
      /Function lacks ending return statement/i, // TypeScript
      /Not all code paths return a value/i, // TypeScript, C#
    ],
    build: () => ({
      title: "This function doesn't always give back an answer",
      whatHappened: `This function promises to hand back a value. But there is a way through it, usually when an ${c('if')} is skipped, where it reaches the end without a ${c('return')}.`,
      metaphor: `It's like a plan that says "if it rains, I'll take the bus" and says nothing about dry days. The plan only covers one case. A function that promises an answer needs one for every case.`,
      steps: [
        `Find each ${c('if')} in the function and ask: what happens when it is false?`,
        `Add a ${c('return')} at the very end of the function for the cases the ${c('if')} doesn't cover.`,
        `Or add an ${c('else')} with its own ${c('return')}.`,
      ],
      remember: 'Every path through a function should end with return.',
    }),
  },
  {
    id: 'unreachable-code',
    patterns: [/Unreachable code detected/i, /Code is unreachable/i],
    build: () => ({
      title: 'This code can never run',
      whatHappened: `This line comes after something that always ends the function or loop first, like ${c('return')} or ${c('break')}. The computer leaves at that point and never gets here.`,
      metaphor: `${c('return')} is like walking out of a room and closing the door behind you. Anything on your to-do list for that room after "leave" will never get done, because you are already gone.`,
      steps: [
        `Look at the lines above this one for a ${c('return')}, ${c('break')} or ${c('continue')}.`,
        'Move this line above it if it is meant to run.',
        `Check whether the ${c('return')} was meant to sit inside an ${c('if')}, so it only happens some of the time.`,
        'Delete this line if it is not needed.',
      ],
      remember: 'Nothing after return runs.',
    }),
  },
  {
    id: 'return-outside-function',
    patterns: [
      /'return' outside function/i, // Python runtime
      /"return" can be used only within a function/i, // Pylance
      /A 'return' statement can only be used within a function body/i, // TypeScript
      /Illegal return statement/i, // JavaScript runtime
    ],
    build: (g) => {
      // g[0] is the part of the message that matched.
      const isJs = /function body|Illegal return/i.test(g[0]);
      return {
        title: '"return" is being used outside a function',
        whatHappened: `${c('return')} means "hand this answer back to whoever ran this function." This line isn't inside a function, so there is nobody to hand the answer back to.`,
        metaphor: `${c('return')} is like a waiter carrying a dish back to the table that ordered it. Here nobody placed an order, so the waiter has no table to take the dish to.`,
        steps: [
          isJs
            ? `Check the curly braces. If this line belongs to a function, it must sit between that function's ${c('{')} and ${c('}')}.`
            : `Check the indentation. If this line belongs to a function, it must be indented under the ${c('def')} line.`,
          isJs
            ? `If you wanted to show the value, use ${c('console.log(...)')} instead of ${c('return')}.`
            : `If you wanted to show the value, use ${c('print(...)')} instead of ${c('return')}.`,
          isJs
            ? `If you wanted to reuse this code, wrap it in a function: ${c('function getTotal() { ... }')}.`
            : `If you wanted to reuse this code, put a ${c('def')} line above it and indent the lines underneath.`,
        ],
        remember: 'return only works inside a function.',
      };
    },
  },
  {
    id: 'assign-in-condition',
    patterns: [/Maybe you meant '=='/i], // Python runtime
    build: () => ({
      title: 'This line uses = where it needs ==',
      whatHappened: `A single ${c('=')} stores a value in a name. A double ${c('==')} asks "are these two the same?" An ${c('if')} needs a question, and this line gives it a storing instruction instead.`,
      metaphor: `${c('=')} is like sticking a label on a jar: "this jar is now sugar." ${c('==')} is like looking at the jar and asking "is this sugar?" After ${c('if')}, you want to ask, not to label.`,
      steps: [
        `Find the single ${c('=')} in the ${c('if')} or ${c('while')} on this line.`,
        `Change it to ${c('==')}.`,
        'Run your code again to check that the message is gone.',
      ],
      remember: '= stores a value. == compares two values.',
    }),
  },
  {
    id: 'missing-comma',
    patterns: [
      /Perhaps you forgot a comma/i, // Python runtime
      /(?:^|\s)['"],['"] expected/i, // TypeScript: "',' expected."
    ],
    build: () => ({
      title: 'A comma is missing between two items',
      whatHappened: `Items in a list, and inputs to a function, are separated by commas. Two items here sit next to each other with no comma between them, so the computer can't tell where one ends and the next begins.`,
      metaphor: `It's like a shopping list written as "milk eggs bread" on one line with no breaks. Is "milk eggs" one thing or two? Commas are the breaks that separate one item from the next.`,
      steps: [
        'Look along this line for two values side by side with only a space between them.',
        'Type a comma between them.',
        'Check the rest of the list or the function inputs for other missing commas.',
        'If this line looks right, check the line above. A missing comma or bracket there can show up here.',
      ],
      remember: 'Every item in a list is separated from the next by a comma.',
    }),
  },
  {
    id: 'bracket-mismatch',
    patterns: [
      /closing parenthesis ['"]([\)\]\}])['"] does not match opening parenthesis ['"]([\(\[\{])['"]/i, // Python runtime
      /unmatched ['"]([\)\]\}])['"]/i,
    ],
    build: (g) => {
      const extra = g[3]; // a closing bracket with no opening partner at all
      return {
        title: "A closing bracket doesn't match the one that was opened",
        whatHappened: extra
          ? `This line has a closing ${c(extra)} with no opening bracket before it to pair with.`
          : `This line opens a ${c(g[2] ?? '(')} but then closes with ${c(g[1] ?? ')')}. Each kind of bracket has to be closed by its own partner, and the one opened last has to close first.`,
        metaphor: extra
          ? `Brackets work like boxes and lids. Every lid needs a box to go on. Here there is a lid with no box.`
          : `Brackets nest like boxes inside boxes. You have to put the lid on the small inner box before you can close the big one around it. Here the outer lid is going on while the inner box is still open.`,
        steps: [
          'Click right after each bracket on this line. VS Code highlights its partner.',
          `Check the order. Brackets close in the reverse order they opened: ${c('print(prices[0])')}, not ${c('print(prices[0)]')}.`,
          'Remove any extra closing bracket, or add the missing opening one.',
        ],
        remember: 'The last bracket opened is the first one closed.',
      };
    },
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
    patterns: [/(?:^|\s)['"]?;['"]? expected/i],
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

/**
 * Like matchKnown, but also reads the line of code the error points at.
 *
 * Some squiggles describe a symptom, not the mistake. Pylance reports
 * `if price = 3:` as `Expected ":"`, and `[0.5 2.25]` as `"[" was not closed`.
 * C# reports `if (count = 5)` as "Cannot implicitly convert type 'int' to 'bool'".
 * When the line itself shows the real mistake, that guide wins.
 */
export function matchError(ctx: { message: string; fullOutput?: string; codeLine?: string }): KnownMatch | undefined {
  const known = matchKnown(ctx.message, ctx.fullOutput);
  if (!ctx.codeLine) {
    return known;
  }
  const isSymptom = !known || ['missing-colon', 'unclosed-bracket', 'invalid-syntax'].includes(known.id);
  const isBoolMismatch = known?.id === 'type-mismatch' && /'int' to 'bool'|to type 'bool'/i.test(ctx.message);
  if (!isSymptom && !isBoolMismatch) {
    return known;
  }
  const line = withoutStringsOrComments(ctx.codeLine);

  if (isSymptom) {
    const brackets = bracketProblem(line);
    if (brackets) {
      return build('bracket-mismatch', brackets);
    }
    // Only Pylance's "was not closed" wording is used for a missing comma: in C#,
    // `(double price, int quantity)` puts two names side by side on purpose.
    if (/^"[\(\[\{]" was not closed/.test(ctx.message) && hasNeighbouringValues(line)) {
      return build('missing-comma', []);
    }
  }
  if (assignsInCondition(line)) {
    return build('assign-in-condition', []);
  }
  return known;
}

/** Build one guide by its id, with the capture groups it would normally get. */
function build(id: string, groups: (string | undefined)[]): KnownMatch {
  const entry = ENTRIES.find((e) => e.id === id)!;
  return { id, explanation: { ...entry.build(groups as string[]), source: 'built-in' } };
}

/** Swap text in quotes for a placeholder, and drop comments, so they can't confuse the checks below. */
function withoutStringsOrComments(line: string): string {
  return line
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, ' "" ')
    .replace(/\s(#|\/\/).*$/, '')
    .replace(/^\s*(#|\/\/).*$/, '');
}

/**
 * A closing bracket that doesn't match the last one opened, like `print(prices[0)]`,
 * as the capture groups the bracket-mismatch guide expects:
 * [match, closing, opening] or [match, , , extra closing].
 */
function bracketProblem(line: string): (string | undefined)[] | undefined {
  const partner: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const open: string[] = [];
  for (const ch of line) {
    if ('([{'.includes(ch)) {
      open.push(ch);
    } else if (ch in partner) {
      const last = open.pop();
      if (last === undefined) {
        return [ch, undefined, undefined, ch];
      }
      if (last !== partner[ch]) {
        return [ch, ch, last];
      }
    }
  }
  return undefined;
}

const KEYWORDS = new Set(
  'for in if else elif and or not is lambda await async yield from as new typeof instanceof of return out ref'.split(' ')
);

/** Two values side by side inside brackets with nothing between them, like `[0.5 2.25]`. */
function hasNeighbouringValues(line: string): boolean {
  const tokens = line.match(/""|[A-Za-z_]\w*|\d+(?:\.\d+)?|\S/g) ?? [];
  const isValue = (t: string) => t === '""' || /^\d/.test(t) || (/^[A-Za-z_]/.test(t) && !KEYWORDS.has(t));
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if ('([{'.includes(t)) {
      depth++;
    } else if (')]}'.includes(t)) {
      depth--;
    } else if (depth > 0 && i > 0 && isValue(t) && isValue(tokens[i - 1])) {
      return true;
    }
  }
  return false;
}

/** An `if` or `while` whose condition stores a value with a single =, like `if price = 3:`. */
function assignsInCondition(line: string): boolean {
  const condition = line.match(/^\s*(?:if|elif|while)\b\s*(.*)$/)?.[1];
  // A single = that isn't part of ==, !=, <=, >=, :=, +=, => and so on.
  return condition !== undefined && /(?:^|[^=!<>:+\-*\/%&|^])=(?:$|[^=>])/.test(condition);
}

/** Number of capturing groups in a regex. */
function countGroups(re: RegExp): number {
  return new RegExp(re.source + '|').exec('')!.length - 1;
}
