# Practice files for testing Errorwise

Every file here contains mistakes on purpose. Press F5 in the main project to open this folder in a test window, then try Errorwise on them.

| Folder | What it tests | How to use it |
| --- | --- | --- |
| `mistakes.py` | The first three classic mistakes | Hover over a squiggle, or run `python mistakes.py` |
| `squiggles/stock_report.py` | 8 Python squiggles, one per function | Open the file. Nothing to run |
| `corner_shop/` | 25 Python errors that happen while the code runs, spread over six files. Most also show as squiggles in those files | `python corner_shop/run.py` lists them, `python corner_shop/run.py 4` runs one |
| `syntax_mistakes/` | 10 Python errors that stop the file from starting | Open a file for the squiggle, or run it: `python syntax_mistakes/missing_colon.py` |
| `web_shop/orders.js` | 6 JavaScript errors that happen while the code runs | `node web_shop/orders.js` lists them, `node web_shop/orders.js 2` runs one |
| `web_shop/cart.ts`, `checkout.ts` | 16 TypeScript squiggles | Open the file. Nothing to run |
| `web_shop/semicolon.ts`, `comma.ts`, `bracket.ts`, `return.ts` | One TypeScript syntax mistake each | Open the file. Nothing to run |

For errors in the terminal: select the error text, right-click, and pick **Errorwise: Explain this error**.

`pyrightconfig.json` makes Pylance underline more kinds of mistakes in this folder than it does by default.

## Corner Shop scenarios and the guide each should show

| # | Error | Built-in guide |
| --- | --- | --- |
| 1 | `NameError: name 'subtotl' is not defined` | undefined-name |
| 2 | `TypeError: can only concatenate str (not "int") to str` | str-int-concat |
| 3 | `TypeError: unsupported operand type(s) for +: 'int' and 'str'` | str-int-concat |
| 4 | `TypeError: 'NoneType' object is not subscriptable` | none-value |
| 5 | `AttributeError: 'NoneType' object has no attribute 'append'` | none-value |
| 6 | `TypeError: 'int' object is not callable` | not-callable |
| 7 | `TypeError: line() takes 2 positional arguments but 3 were given` | wrong-arg-count |
| 8 | `TypeError: apply_discount() missing 1 required positional argument` | wrong-arg-count |
| 9 | `IndexError: list index out of range` | index-out-of-range |
| 10 | `KeyError: 'milk'` | key-error |
| 11 | `AttributeError: 'list' object has no attribute 'push'` | no-attribute |
| 12 | `ModuleNotFoundError: No module named 'matplotlb'` | module-not-found |
| 13 | `ZeroDivisionError: division by zero` | zero-division |
| 14 | `ValueError: invalid literal for int() with base 10: 'three'` | bad-number-text |
| 15 | `ValueError: could not convert string to float: '4,50'` | bad-number-text |
| 16 | `RecursionError: maximum recursion depth exceeded` | recursion |
| 17 | `UnboundLocalError: cannot access local variable 'items_sold'` | unbound-local |
| 18 | `FileNotFoundError: No such file or directory` | none yet (general guide or AI) |
| 19 | `TypeError: 'int' object is not iterable` | not-iterable |
| 20 | `TypeError: list indices must be integers or slices, not str` | bad-index-type |
| 21 | `ValueError: too many values to unpack` | unpack-mismatch |
| 22 | `TypeError: 'int' object is not subscriptable` | not-subscriptable |
| 23 | `TypeError: unsupported operand type(s) for -: 'str' and 'int'` | wrong-types-math |
| 24 | `TypeError: '>=' not supported between instances of 'str' and 'int'` | comparison-types |
| 25 | `TypeError: 'str' object does not support item assignment` | immutable-item |

Scenario 18 has no built-in guide on purpose. It tests what Errorwise shows when it doesn't recognise an error.

## Squiggles and the guide each should show

| File | Squiggle | Built-in guide |
| --- | --- | --- |
| `squiggles/stock_report.py` | `"Literal[5]" is not iterable` | not-iterable |
| | `"__getitem__" method not defined on type "Literal[250]"` | not-subscriptable |
| | `Expression with type "tuple[...]" cannot be assigned to target tuple` | unpack-mismatch |
| | `Operator ">=" not supported for types "str" and "Literal[18]"` | comparison-types |
| | `Operator "-" not supported for types "str" and "Literal[4]"` | wrong-types-math |
| | `No overloads for "__getitem__" match the provided arguments` | bad-index-type |
| | `"__setitem__" method not defined on type "Literal['Bread']"` | immutable-item |
| | `Code is unreachable` (faded text, no squiggle) | unreachable-code |
| `web_shop/checkout.ts` | `Cannot assign to 'taxRate' because it is a constant.` | const-reassign |
| | `Cannot redeclare block-scoped variable 'shipping'.` | redeclared |
| | `Function lacks ending return statement...` | missing-return |
| | `Parameter 'price' implicitly has an 'any' type.` | implicit-any |
| | `Property 'quantity' is missing in type ... but required in type 'Order'.` | missing-property |
| | `Unreachable code detected.` (faded text) | unreachable-code |
| | `Operator '>' cannot be applied to types 'number' and 'string'.` | comparison-types |
| `web_shop/comma.ts` | `',' expected.` | missing-comma |
| `web_shop/bracket.ts` | `')' expected.` | unclosed-bracket |
| `web_shop/return.ts` | `A 'return' statement can only be used within a function body.` | return-outside-function |
| `syntax_mistakes/return_outside_function.py` | `"return" can be used only within a function` | return-outside-function |

Three syntax files show a squiggle that points at a symptom rather than the mistake: `invalid_syntax.py`, `missing_comma.py` and `bracket_mismatch.py`. In the editor they get a less fitting guide. Run them in the terminal to get the right one.
