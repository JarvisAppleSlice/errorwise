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
| `csharp_shop/` | 10 C# errors that happen while the program runs | `dotnet run --project csharp_shop` lists them, `dotnet run --project csharp_shop -- 2` runs one |
| `csharp_squiggles/` | 21 C# squiggles (needs the C# extension) | Open `Program.cs` and `Syntax.cs`. Nothing to run |

For errors in the terminal: select the error text, then press Ctrl+Alt+E (Cmd+Option+E on a Mac), or right-click the selection and pick **Errorwise: Explain this error**.

On a Mac, type `python3` wherever these instructions say `python`.

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
| 18 | `FileNotFoundError: No such file or directory` | file-not-found |
| 19 | `TypeError: 'int' object is not iterable` | not-iterable |
| 20 | `TypeError: list indices must be integers or slices, not str` | bad-index-type |
| 21 | `ValueError: too many values to unpack` | unpack-mismatch |
| 22 | `TypeError: 'int' object is not subscriptable` | not-subscriptable |
| 23 | `TypeError: unsupported operand type(s) for -: 'str' and 'int'` | wrong-types-math |
| 24 | `TypeError: '>=' not supported between instances of 'str' and 'int'` | comparison-types |
| 25 | `TypeError: 'str' object does not support item assignment` | immutable-item |

## C# Shop scenarios and the guide each should show

| # | Error | Built-in guide |
| --- | --- | --- |
| 1 | `NullReferenceException: Object reference not set to an instance of an object` | null-reference |
| 2 | `FormatException: The input string 'three' was not in a correct format` | bad-number-text |
| 3 | `IndexOutOfRangeException: Index was outside the bounds of the array` | index-out-of-range |
| 4 | `ArgumentOutOfRangeException: Index was out of range` | index-out-of-range |
| 5 | `KeyNotFoundException: The given key 'milk' was not present` | key-error |
| 6 | `DivideByZeroException: Attempted to divide by zero` | zero-division |
| 7 | `InvalidCastException: Unable to cast object of type 'System.String'...` | invalid-cast |
| 8 | `FileNotFoundException: Could not find file ...` | file-not-found |
| 9 | `InvalidOperationException: Collection was modified` | none yet |
| 10 | `Stack overflow.` | recursion |

C# scenario 9 has no built-in guide on purpose. It tests what Errorwise shows when it doesn't recognise an error.

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
| `syntax_mistakes/invalid_syntax.py` | `Expected ":"` (Errorwise reads the line and sees `=` in the `if`) | assign-in-condition |
| `syntax_mistakes/missing_comma.py` | `"[" was not closed` (the line has two values with no comma) | missing-comma |
| `syntax_mistakes/bracket_mismatch.py` | `"(" was not closed` (the line closes brackets in the wrong order) | bracket-mismatch |
| `csharp_squiggles/Program.cs` | `Use of unassigned local variable 'count'` | unassigned-local |
| | `The type or namespace name 'StringBuilder' could not be found` | missing-using |
| | `An object reference is required for the non-static ... 'Program.ShowTotal()'` | static-context |
| | `Cannot implicitly convert type 'int' to 'bool'` on `if (count = 5)` | assign-in-condition |
| | `Operator '>' cannot be applied to operands of type 'string' and 'int'` | comparison-types |
| | `Converting null literal or possible null value...` (green squiggle) | possibly-null |
| | `Possible null reference argument...` (green squiggle) | possibly-null |
| | `Dereference of a possibly null reference.` (green squiggle) | possibly-null |
| | Plus: name not found, wrong types, missing return, misspelled `Lenght`, a name created twice, wrong number of inputs | the matching guides above |
| `csharp_squiggles/Syntax.cs` | `; expected` | missing-semicolon |
| | `) expected` | unclosed-bracket |

The `invalid_syntax.py`, `missing_comma.py`, `bracket_mismatch.py` and `if (count = 5)` squiggles have messages that only describe a symptom. Errorwise reads the line of code to find the real mistake.
