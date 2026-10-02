/**
 * Plain Node tests (no VS Code needed): run with `npm test`.
 * Checks that real error messages match the right built-in guide,
 * and that AI replies are parsed safely.
 */
import assert from 'node:assert/strict';
import { matchKnown } from '../knowledge';
import { buildPrompt, parseExplanation } from '../prompt';

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
  // Pylance (squiggles in the editor)
  ['"totl" is not defined', 'undefined-name', 'totl'],
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
  // C#
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
