JavaScript Expression Evaluator
===============================

[![npm](https://img.shields.io/npm/v/expr-eval.svg)](https://www.npmjs.com/package/expr-eval)
[![Build Status](https://travis-ci.org/silentmatt/expr-eval.svg?branch=master)](https://travis-ci.org/silentmatt/expr-eval)

Description
-------------------------------------

Parses and evaluates mathematical expressions. It's a safer and more
math-oriented alternative to using JavaScript’s `eval` function for mathematical
expressions.

It has built-in support for common math operators and functions. Additionally,
you can add your own JavaScript functions. Expressions can be evaluated
directly, or compiled into native JavaScript functions.

Installation
-------------------------------------

    npm install expr-eval

Basic Usage
-------------------------------------

    var Parser = require('expr-eval').Parser;

    var parser = new Parser();
    var expr = parser.parse('2 * x + 1');
    console.log(expr.evaluate({ x: 3 })); // 7

    // or
    Parser.evaluate('6 * x', { x: 7 }) // 42

Documentation
-------------------------------------

### Parser ###

Parser is the main class in the library. It has as single `parse` method, and
"static" methods for parsing and evaluating expressions.

#### Parser()

Constructs a new `Parser` instance.

#### parse(expression: string)

Convert a mathematical expression into an `Expression` object.

#### Parser.parse(expression: string)

Static equivalent of `new Parser().parse(expression)`.

#### Parser.evaluate(expression: string, variables?: object)

Parse and immediately evaluate an expression using the values and functions from
the `variables` object.

Parser.evaluate(expr, vars) is equivalent to calling
Parser.parse(expr).evaluate(vars).

### Expression ###

`Parser.parse(str)` returns an `Expression` object. `Expression`s are similar to
JavaScript functions, i.e. they can be "called" with variables bound to
passed-in values. In fact, they can even be converted into JavaScript
functions.

#### evaluate(variables?: object)

Evaluate the expression, with variables bound to the values in {variables}. Each
variable in the expression is bound to the corresponding member of the
`variables` object. If there are unbound variables, `evaluate` will throw an
exception.

    js> expr = Parser.parse("2 ^ x");
    (2^x)
    js> expr.evaluate({ x: 3 });
    8

#### substitute(variable: string, expression: Expression | string | number)

Create a new `Expression` with the specified variable replaced with another
expression. This is similar to function composition. If `expression` is a string
or number, it will be parsed into an `Expression`.

    js> expr = Parser.parse("2 * x + 1");
    ((2*x)+1)
    js> expr.substitute("x", "4 * x");
    ((2*(4*x))+1)
    js> expr2.evaluate({ x: 3 });
    25

#### simplify(variables: object)

Simplify constant sub-expressions and replace variable references with literal
values. This is basically a partial evaluation, that does as much of the
calculation as it can with the provided variables. Function calls are not
evaluated (except the built-in operator functions), since they may not be
deterministic.

Simplify is pretty simple. For example, it doesn’t know that addition and
multiplication are associative, so `((2*(4*x))+1)` from the previous example
cannot be simplified unless you provide a value for x. `2*4*x+1` can however,
because it’s parsed as `(((2*4)*x)+1)`, so the `(2*4)` sub-expression will be
replaced with "8", resulting in `((8*x)+1)`.

    js> expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4 });
    (x*3.141592653589793)
    js> expr.evaluate({ x: 2 });
    6.283185307179586

#### variables()

Get an array of the unbound variables in the expression.

    js> expr = Parser.parse("x * (y * atan(1))");
    (x*(y*atan(1)))
    js> expr.variables();
    x,y
    js> expr.simplify({ y: 4 }).variables();
    x

#### symbols()

Get an array of variables, including any built-in functions used in the
expression.

    js> expr = Parser.parse("min(x, y, z)");
    (min(x, y, z))
    js> expr.variables();
    min,x,y,z
    js> expr.simplify({ y: 4, z: 5 }).variables();
    min,x

#### toString()

Convert the expression to a string. `toString()` surrounds every sub-expression
with parentheses (except literal values, variables, and function calls), so
it’s useful for debugging precedence errors.

#### toJSFunction(parameters: array | string, variables?: object)

Convert an `Expression` object into a callable JavaScript function. `parameters`
is an array of parameter names, or a string, with the names separated by commas.

If the optional `variables` argument is provided, the expression will be
simplified with variables bound to the supplied values.

    js> expr = Parser.parse("x + y + z");
    ((x + y) + z)
    js> f = expr.toJSFunction("x,y,z");
    [Function] // function (x, y, z) { return x + y + z; };
    js> f(1, 2, 3)
    6
    js> f = expr.toJSFunction("y,z", { x: 100 });
    [Function] // function (y, z) { return 100 + y + z; };
    js> f(2, 3)
    105

### Expression Syntax ###

The parser accepts a pretty basic grammar. It's similar to normal JavaScript
expressions, but is more math-oriented. For example, the `^` operator is
exponentiation, not xor.

#### Operator Precedence

Operator              | Associativity | Description
:-------------------- | :------------ | :----------
(...)                 | None          | Grouping
f(), x.y              | Left          | Function call, property access
!                     | Left          | Factorial
^                     | Right         | Exponentiation
+, -, not, sqrt, etc. | Right         | Unary prefix operators (see below for the full list)
\*, /, %              | Left          | Multiplication, division, remainder
+, -, \|\|            | Left          | Addition, subtraction, concatenation
==, !=, >=, <=, >, <  | Left          | Equals, not equals, etc.
and                   | Left          | Logical AND
or                    | Left          | Logical OR
x ? y : z             | Right         | Ternary conditional (if x then y else z)

#### Unary operators

The parser has several built-in "functions" that are actually unary operators.
The primary difference between these and functions are that they can only accept
exactly one argument, and parentheses are optional. With parentheses, they have
the same precedence as function calls, but without parentheses, they keep their
normal precedence (just below `^`). For example, `sin(x)^2` is equivalent to
`(sin x)^2`, and `sin x^2` is equivalent to `sin(x^2)`.

The unary `+` and `-` operators are an exception, and always have their normal
precedence.

Operator | Description
:------- | :----------
-x       | Negation
+x       | Unary plus. This converts it's operand to a number, but has no other effect.
x!       | Factorial (x * (x-1) * (x-2) * … * 2 * 1). gamma(x + 1) for non-integers.
abs x    | Absolute value (magnatude) of x
acos x   | Arc cosine of x (in radians)
acosh x  | Hyperbolic arc cosine of x (in radians)
asin x   | Arc sine of x (in radians)
asinh x  | Hyperbolic arc sine of x (in radians)
atan x   | Arc tangent of x (in radians)
atanh x  | Hyperbolic arc tangent of x (in radians)
ceil x   | Ceiling of x — the smallest integer that’s >= x
cos x    | Cosine of x (x is in radians)
cosh x   | Hyperbolic cosine of x (x is in radians)
exp x    | e^x (exponential/antilogarithm function with base e)
floor x  | Floor of x — the largest integer that’s <= x
length x | String length of x
ln x     | Natural logarithm of x
log x    | Natural logarithm of x (synonym for ln, not base-10)
log10 x  | Base-10 logarithm of x
not x    | Logical NOT operator
round x  | X, rounded to the nearest integer, using "gradeschool rounding"
sin x    | Sine of x (x is in radians)
sinh x   | Hyperbolic sine of x (x is in radians)
sqrt x   | Square root of x. Result is NaN (Not a Number) if x is negative.
tan x    | Tangent of x (x is in radians)
tanh x   | Hyperbolic tangent of x (x is in radians)
trunc x  | Integral part of a X, looks like floor(x) unless for negative number

#### Pre-defined functions

Besides the "operator" functions, there are several pre-defined functions. You
can provide your own, by binding variables to normal JavaScript functions.
These are not evaluated by simplify.

Function     | Description
:----------- | :----------
random(n)    | Get a random number in the range [0, n). If n is zero, or not provided, it defaults to 1.
fac(n)       | n! (factorial of n: "n * (n-1) * (n-2) * … * 2 * 1") Deprecated. Use the ! operator instead.
min(a,b,…)   | Get the smallest (minimum) number in the list
max(a,b,…)   | Get the largest (maximum) number in the list
hypot(a,b)   | Hypotenuse, i.e. the square root of the sum of squares of its arguments.
pyt(a, b)    | Alias for hypot
pow(x, y)    | Equivalent to x^y. For consistency with JavaScript's Math object.
atan2(y, x)  | Arc tangent of x/y. i.e. the angle between (0, 0) and (x, y) in radians.
if(c, a, b)  | Function form of c ? a : b

### Tests ###

To run tests, you need:

1. [Install NodeJS](https://github.com/nodejs/node)
2. Install Mocha `npm install -g mocha`
3. Install Chai `npm install chai`
4. Execute `mocha`
