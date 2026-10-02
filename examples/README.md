# Practice files for testing Errorwise

Every file here contains mistakes on purpose. Press F5 in the main project to open this folder in a test window, then try Errorwise on them.

| Folder | What it tests | How to use it |
| --- | --- | --- |
| `mistakes.py` | The first three classic mistakes | Hover over a squiggle, or run `python mistakes.py` |
| `corner_shop/` | 21 Python errors that happen while the code runs, spread over six files | `python corner_shop/run.py` lists them, `python corner_shop/run.py 4` runs one |
| `syntax_mistakes/` | 7 Python errors that stop the file from starting | Open a file for the squiggle, or run it: `python syntax_mistakes/missing_colon.py` |
| `web_shop/orders.js` | 6 JavaScript errors that happen while the code runs | `node web_shop/orders.js` lists them, `node web_shop/orders.js 2` runs one |
| `web_shop/cart.ts`, `semicolon.ts` | 8 TypeScript squiggles | Open the file. Nothing to run |

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
| 19 | `TypeError: 'int' object is not iterable` | none yet |
| 20 | `TypeError: list indices must be integers or slices, not str` | none yet |
| 21 | `ValueError: too many values to unpack` | none yet |

Scenarios 18 to 21 have no built-in guide on purpose. They test what Errorwise shows when it doesn't recognise an error.
