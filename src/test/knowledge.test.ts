/**
 * Plain Node tests (no VS Code needed): run with `npm test`.
 * Checks that real error messages match the right built-in guide,
 * and that AI replies are parsed safely.
 */
import assert from 'node:assert/strict';
import { matchKnown } from '../knowledge';
import { buildPrompt, parseExplanation } from '../prompt';
import { findLocation, lastMeaningfulLine } from '../traceback';

const cases: [message: string, expectedId: string, mustMention?: string][] = [
  // Python runtime
  ["NameError: name 'totl' is not defined", 'undefined-name', 'totl'],
  ['IndentationError: expected an indented block after \'if\' statement on line 3', 'expected-indent'],
  ['IndentationError: unexpected indent', 'unexpected-indent'],
  ['IndentationError: unindent does not match any outer indentation level', 'unindent-mismatch'],
  ["SyntaxError: expected ':'", 'missing-colon'],
  ["SyntaxError: '(' was never closed", 'unclosed-bracket'],
  ['SyntaxError: unterminated string literal (detected at line 1)', 'unterminated-string'],
  ['SyntaxError: invalid syntax', 'invalid-syntax'],
  ['TypeError: can only concatenate str (not "int") to str', 'str-int-concat'],
  ["TypeError: unsupported operand type(s) for +: 'int' and 'str'", 'str-int-concat'],
  ["TypeError: 'NoneType' object is not subscriptable", 'none-value'],
  ["AttributeError: 'NoneType' object has no attribute 'append'", 'none-value'],
  ["TypeError: 'int' object is not callable", 'not-callable', 'int'],
  ['TypeError: greet() takes 1 positional argument but 2 were given', 'wrong-arg-count'],
  ["TypeError: greet() missing 1 required positional argument: 'name'", 'wrong-arg-count'],
  ['IndexError: list index out of range', 'index-out-of-range'],
  ["KeyError: 'age'", 'key-error', 'age'],
  ["AttributeError: 'str' object has no attribute 'push'", 'no-attribute', 'push'],
  ["ModuleNotFoundError: No module named 'requests'", 'module-not-found', 'pip install requests'],
  ['ZeroDivisionError: division by zero', 'zero-division'],
  ["ValueError: invalid literal for int() with base 10: 'abc'", 'bad-number-text', 'abc'],
  ["ValueError: invalid literal for int() with base 10: ''", 'bad-number-text', '(empty)'],
  ['RecursionError: maximum recursion depth exceeded', 'recursion'],
  ["UnboundLocalError: cannot access local variable 'count' where it is not associated with a value", 'unbound-local', 'count'],
  ["TypeError: 'int' object is not iterable", 'not-iterable', 'int'],
  ["TypeError: 'int' object is not subscriptable", 'not-subscriptable', 'int'],
  ['TypeError: list indices must be integers or slices, not str', 'bad-index-type'],
  ["TypeError: 'str' object does not support item assignment", 'immutable-item', 'str'],
  ['ValueError: too many values to unpack (expected 2, got 3)', 'unpack-mismatch'],
  ['ValueError: not enough values to unpack (expected 3, got 2)', 'unpack-mismatch'],
  ["TypeError: '>=' not supported between instances of 'str' and 'int'", 'comparison-types', 'int(age)'],
  ["TypeError: unsupported operand type(s) for -: 'str' and 'int'", 'wrong-types-math', 'between str and int'],
  ["TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'", 'none-value'],
  ["SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?", 'assign-in-condition'],
  ['SyntaxError: invalid syntax. Perhaps you forgot a comma?', 'missing-comma'],
  ["SyntaxError: closing parenthesis ')' does not match opening parenthesis '['", 'bracket-mismatch', 'opens a `[`'],
  ["SyntaxError: unmatched ')'", 'bracket-mismatch', 'no opening bracket'],
  ["SyntaxError: 'return' outside function", 'return-outside-function', 'def'],
  // Pylance (squiggles in the editor)
  ['"totl" is not defined', 'undefined-name', 'totl'],
  ['"items_sold" is unbound', 'unbound-local', 'items_sold'],
  ['Object of type "Literal[100]" is not callable\n  Attribute "__call__" is unknown', 'not-callable', '`int`'],
  ['"Literal[5]" is not iterable\n  "__iter__" method not defined', 'not-iterable', 'This int'],
  ['"__getitem__" method not defined on type "Literal[250]"', 'not-subscriptable', 'this int'],
  ['No overloads for "__getitem__" match the provided arguments\n  Argument types: (Literal[\'Ada\'])', 'bad-index-type'],
  ['"__setitem__" method not defined on type "Literal[\'Bread\']"', 'immutable-item', 'this str'],
  [
    'Expression with type "tuple[Literal[\'Ada\'], Literal[120], Literal[\'gold\']]" cannot be assigned to target tuple\n  Type "tuple[Literal[\'Ada\'], Literal[120], Literal[\'gold\']]" is incompatible with target tuple\n    Tuple size mismatch; expected 2 but received 3',
    'unpack-mismatch',
  ],
  ['Operator ">=" not supported for types "str" and "Literal[18]"', 'comparison-types', '`int`'],
  ['Operator "-" not supported for types "str" and "Literal[4]"', 'wrong-types-math', 'between str and int'],
  ['"return" can be used only within a function', 'return-outside-function', 'print('],
  ['Code is unreachable', 'unreachable-code'],
  ['Expected indented block', 'expected-indent'],
  ['Import "numpy" could not be resolved', 'module-not-found', 'numpy'],
  ['Cannot access attribute "push" for class "list[int]"', 'no-attribute', 'push'],
  ['"x" is possibly unbound', 'unbound-local', 'x'],
  ['String literal is unterminated', 'unterminated-string'],
  // JavaScript / TypeScript
  ["Cannot find name 'conut'.", 'undefined-name', 'conut'],
  ['ReferenceError: total is not defined', 'undefined-name', 'total'],
  ["TypeError: Cannot read properties of undefined (reading 'name')", 'undefined-property-js', '.name'],
  ['TypeError: user.getName is not a function', 'not-callable', 'user.getName'],
  ["Type 'string' is not assignable to type 'number'.", 'type-mismatch', 'number'],
  ["Property 'lenght' does not exist on type 'string[]'.", 'no-attribute', 'lenght'],
  ["';' expected.", 'missing-semicolon'],
  ["Cannot find module './utils' or its corresponding type declarations.", 'module-not-found', 'npm install'],
  ["'found' is possibly 'undefined'.", 'undefined-property-js'],
  ["')' expected.", 'unclosed-bracket', 'opening `(`'],
  ["',' expected.", 'missing-comma'],
  ["Cannot assign to 'taxRate' because it is a constant.", 'const-reassign', 'taxRate'],
  ['TypeError: Assignment to constant variable.', 'const-reassign'],
  ["Cannot redeclare block-scoped variable 'shipping'.", 'redeclared', 'shipping'],
  ["SyntaxError: Identifier 'shipping' has already been declared", 'redeclared', 'shipping'],
  ["Function lacks ending return statement and return type does not include 'undefined'.", 'missing-return'],
  ["Parameter 'price' implicitly has an 'any' type.", 'implicit-any', 'price: number'],
  ["Property 'quantity' is missing in type '{ id: number; item: string; }' but required in type 'Order'.", 'missing-property', 'quantity: ...'],
  ['Unreachable code detected.', 'unreachable-code'],
  ["Operator '>' cannot be applied to types 'number' and 'string'.", 'comparison-types', 'Number(text)'],
  ["A 'return' statement can only be used within a function body.", 'return-outside-function', 'console.log'],
  // C#
  ["A local variable or function named 'total' is already defined in this scope", 'redeclared', 'total'],
  ["The name 'totl' does not exist in the current context", 'undefined-name', 'totl'],
  ["Cannot implicitly convert type 'string' to 'int'", 'type-mismatch', 'int'],
];

let passed = 0;
for (const [message, id, mention] of cases) {
  const m = matchKnown(message);
  assert.ok(m, `No match for: ${message}`);
  assert.equal(m.id, id, `Wrong guide for: ${message}`);
  const all = JSON.stringify(m.explanation);
  if (id !== 'undefined-property-js') {
    assert.ok(!all.includes('undefined'), `A missing name leaked as "undefined" in: ${message}`);
  }
  if (mention) {
    assert.ok(all.includes(mention), `Expected "${mention}" in explanation for: ${message}`);
  }
  // Writing rules apply to built-in text too.
  assert.ok(!/\b(simply|obviously|trivial)\b/i.test(all), `Banned word in: ${id}`);
  passed++;
}

// A full traceback: the last line should decide.
const traceback = `Traceback (most recent call last):
  File "/home/sam/app.py", line 4, in <module>
    print("Total: " + total)
TypeError: can only concatenate str (not "int") to str`;
assert.equal(matchKnown(traceback.split('\n').pop())?.id, 'str-int-concat');
passed++;

// Something we don't know.
assert.equal(matchKnown('PermissionError: [Errno 13] Permission denied: data.csv'), undefined);
passed++;

// Error text copied from the terminal: find the error line, and the file and line it points at.
assert.equal(lastMeaningfulLine(traceback), 'TypeError: can only concatenate str (not "int") to str');
assert.deepEqual(findLocation(traceback), { file: '/home/sam/app.py', line: 4 });
passed++;

// Node prints its version last, and this folder name has a space in it.
const nodeError = `C:\\My Code\\web shop\\orders.js:25
  return order.customer.name;
                        ^

TypeError: Cannot read properties of undefined (reading 'name')
    at customerName (C:\\My Code\\web shop\\orders.js:25:25)
    at Object.<anonymous> (C:\\My Code\\web shop\\orders.js:62:37)
    at Module._compile (node:internal/modules/cjs/loader:1730:14)

Node.js v25.3.0`;
assert.equal(lastMeaningfulLine(nodeError), "TypeError: Cannot read properties of undefined (reading 'name')");
assert.deepEqual(findLocation(nodeError), { file: 'C:\\My Code\\web shop\\orders.js', line: 25 });
assert.equal(matchKnown(lastMeaningfulLine(nodeError))?.id, 'undefined-property-js');
passed++;

// Node's "module not found" puts other lines between the error and the "at" lines.
const nodeMissingModule = `Error: Cannot find module './discounts'
Require stack:
- /home/sam/shop/orders.js
    at Function._resolveFilename (node:internal/modules/cjs/loader:1401:15)
    at loadDiscounts (/home/sam/shop/orders.js:37:10)`;
assert.equal(lastMeaningfulLine(nodeMissingModule), "Error: Cannot find module './discounts'");
assert.deepEqual(findLocation(nodeMissingModule), { file: '/home/sam/shop/orders.js', line: 37 });
passed++;

// A stack with no brackets around the file, and a library frame before the learner's own code.
const libraryFirst = `ReferenceError: totl is not defined
    at helper (/home/sam/shop/node_modules/lib/index.js:3:1)
    at /home/sam/shop/app.js:12:5`;
assert.equal(lastMeaningfulLine(libraryFirst), 'ReferenceError: totl is not defined');
assert.deepEqual(findLocation(libraryFirst), { file: '/home/sam/shop/app.js', line: 12 });
passed++;

// A single line stays as it is, and text with no file in it has no location.
assert.equal(lastMeaningfulLine("NameError: name 'totl' is not defined"), "NameError: name 'totl' is not defined");
assert.equal(findLocation("NameError: name 'totl' is not defined"), undefined);
passed++;

// AI replies: fenced JSON with chatter around it.
const reply = 'Sure!\n```json\n{"title":"Missing colon","whatHappened":"Line 3 has no colon.","metaphor":"Like a recipe card.","steps":["Find line 3.","Add a colon."],"fix":{"explanation":"Adds the colon.","code":"if x > 3:"},"remember":"Colons start blocks."}\n```';
const parsed = parseExplanation(reply);
assert.equal(parsed.title, 'Missing colon');
assert.equal(parsed.steps.length, 2);
assert.equal(parsed.fix?.code, 'if x > 3:');
assert.equal(parsed.source, 'ai');
passed++;

assert.throws(() => parseExplanation('I am not sure.'));
assert.throws(() => parseExplanation('{"title":"x"}'));
passed++;

// Prompt includes the learner's code, hint, and avoided metaphor.
const prompt = buildPrompt(
  { message: 'NameError', codeSnippet: '>> 3 | print(totl)', line: 3, languageId: 'python' },
  { experienceLevel: 'brand new', metaphorTheme: 'video games', teacherHint: 'labeled boxes', avoidMetaphor: 'jars on a shelf' }
);
for (const piece of ['print(totl)', 'video games', 'labeled boxes', 'jars on a shelf', 'started learning to code last week']) {
  assert.ok(prompt.includes(piece), `Prompt missing: ${piece}`);
}
passed++;

console.log(`✔ ${passed} checks passed (${cases.length} error messages matched)`);
