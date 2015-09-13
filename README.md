JavaScript Expression Evaluator
===============================

Description
-----------

This library is a modified version of Raphael Graf’s ActionScript Expression
Parser. When I wrote the JavaScript Function Plotter, I wanted a better
alternative to using JavaScript’s eval function. There’s no security risk
currently, because you can only run code in your own browser, but it’s not as
convenient for math (`Math.pow(2, x)` instead of `2^x`, etc.).

Documentation (incomplete, of course)
-------------------------------------

### Parser ###

Parser is the main class in the library. It has “static” methods for parsing
and evaluating expressions.

**Parser()**

Constructor. In most cases, you don’t need this. Eventually, I’ll get around to
documenting why you would want to, but for now, you can figure it
out by reading the source ;-).

**parse({expression: string})**

Convert a mathematical expression into an Expression object.

**evaluate({expression: string} [, {variables: object}])**

Parse and immediately evaluate an expression using the values/functions from
the {variables} object.

Parser.evaluate(expr, vars) is equivalent to calling
Parser.parse(expr).evaluate(vars). In fact, that’s exactly what it does.

### Parser.Expression ###

Parser.parse returns an Expression object. Expression objects are similar to
JavaScript functions, i.e. they can be “called” with variables bound to
passed-in values. In fact, they can even be converted into JavaScript
functions.

**evaluate([{variables: object}])**

Evaluate an expression, with variables bound to the values in {variables}. Each
unbound variable in the expression is bound to the corresponding member of the
{variables} object. If there are unbound variables, evaluate will throw an
exception.

    js> expr = Parser.parse("2 ^ x");
    (2^x)
    js> expr.evaluate({ x: 3 });
    8

**substitute({variable: string}, {expr: Expression, string, or number})**

Create a new expression with the specified variable replaced with another
expression (essentially, function composition).

    js> expr = Parser.parse("2 * x + 1");
    ((2*x)+1)
    js> expr.substitute("x", "4 * x");
    ((2*(4*x))+1)
    js> expr2.evaluate({ x: 3});
    25

**simplify({variables: object>)**

Simplify constant sub-expressions and replace
variable references with literal values. This is basically a partial
evaluation, that does as much of the calcuation as it can with the provided
variables. Function calls are not evaluated (except the built-in operator
functions), since they may not be deterministic.

Simplify is pretty simple (see what I did there?). It doesn’t know that
addition and multiplication are associative, so `((2*(4*x))+1)` from the
previous example cannot be simplified unless you provide a value for x. 
`2*4*x+1` can however, because it’s parsed as `(((2*4)*x)+1)`, so the `(2*4)`
sub-expression will be replaced with “8″, resulting in `((8*x)+1)`.

    js> expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4 });
    (x*3.141592653589793)
    js> expr.evaluate({ x: 2 });
    6.283185307179586

**variables()**

    Get an array of the unbound variables in the expression.

    js> expr = Parser.parse("x * (y * atan(1))");
    (x*(y*atan(1)))
    js> expr.variables();
    x,y
    js> expr.simplify({ y: 4 }).variables();
    x

**toString()**

Convert the expression to a string. toString() surrounds every sub-expression
with parentheses (except literal values, variables, and function calls), so
it’s useful for debugging precidence errors.

**toJSFunction({parameters: Array} [, {variables: object}])**

Convert an Expression object into a callable JavaScript function. You need to
provide an array of parameter names that should normally be expr.variables().
Any unbound-variables will get their values from the global scope.

toJSFunction works by simplifying the Expression (with {variables}, if
provided), converting it to a string, and passing the string to the Function
constructor (with some of its own code to bring built-in functions and
constants into scope and return the result of the expression).

### Expression Syntax ###

The parser accepts a pretty basic grammar. Operators have the normal precidence
— f(x,y,z) (function calls), ^ (exponentiation), *, /, and % (multiplication,
division, and remainder), and finally +, -, and || (addition, subtraction, and
string concatenation) — and bind from left to right (yes, even exponentiation…
it’s simpler that way).

Inside the first argument of the if function can be used these operators to compare expressions:
	==		Equal
	!=		Not equal
	>		Greater than
	>=		Greater or equal than
	<		Less than
	<=		Less or equal than
	and		Logical AND operator
	or		Logical OR operator

Example of if function: `if(1 and 2 <= 4, 2, 0) + 2` = 4

There’s also a “,” (comma) operator that concatenates values into an array.
It’s mostly useful for passing arguments to functions, since it doesn’t always
behave like you would think with regards to multi-dimensional arrays. If the
left value is an array, it pushes the right value onto the end of the array,
otherwise, it creates a new array “[left, right]“. This makes it impossible to
create an array with another array as it’s first element.
Function operators

The parser has several built-in “functions” that are actually operators. The
only difference from an outside point of view, is that they cannot be called
with multiple arguments and they are evaluated by the simplify method if their
arguments are constant.

	Function  Description
	sin(x)    Sine of x (x is in radians)
	cos(x)    Cosine of x (x is in radians)
	tan(x)    Tangent of x (x is… well, you know)
	asin(x)   Arc sine of x (in radians)
	acos(x)   Arc cosine of x (in radians)
	atan(x)   Arc tangent of x (in radians)
	sinh(x)   Hyperbolic sine of x (x is in radians)
	cosh(x)   Hyperbolic cosine of x (x is in radians)
	tanh(x)   Hyperbolic tangent of x (x is… well, you know)
	asinh(x)  Hyperbolic arc sine of x (in radians)
	acosh(x)  Hyperbolic arc cosine of x (in radians)
	atanh(x)  Hyperbolic arc tangent of x (in radians)
	sqrt(x)   Square root of x. Result is NaN (Not a Number) if x is negative.
	log(x)    Natural logarithm of x (not base-10). It’s log instead of ln because that’s what JavaScript calls it.
	abs(x)    Absolute value (magnatude) of x
	ceil(x)   Ceiling of x — the smallest integer that’s >= x.
	floor(x)  Floor of x — the largest integer that’s <= x.
	round(x)  X, rounded to the nearest integer, using “gradeschool rounding”.
	trunc(x)  Integral part of a X, looks like floor(x) unless for negative number.
	exp(x)    ex (exponential/antilogarithm function with base e) Pre-defined functions

Besides the “operator” functions, there are several pre-defined functions. You
can provide your own, by binding variables to normal JavaScript functions.
These are not evaluated by simplify.

	Function 	Description
	random(n) 	Get a random number in the range [0, n). If n is zero, or not provided, it defaults to 1.
	fac(n) 	n! (factorial of n: “n * (n-1) * (n-2) * … * 2 * 1″)
	min(a,b,…) 	Get the smallest (“minimum”) number in the list
	max(a,b,…) 	Get the largest (“maximum”) number in the list
	pyt(a, b) 	Pythagorean function, i.e. the c in “c2 = a2 + b2“
	pow(x, y) 	xy. This is exactly the same as “x^y”. It’s just provided since it’s in the Math object from JavaScript
	atan2(y, x) Arc tangent of x/y. i.e. the angle between (0, 0) and (x, y) in radians.
	hypot(a,b)  The square root of the sum of squares of its arguments.
	if(c, a, b) The condition function where c is condition, a is result if c is true, b is result if c is false

### Tests ###

To run tests, you need:

1. [Install NodeJS](https://github.com/nodejs/node)
2. Install Mocha `npm install -g mocha`
3. Install Chai `npm install chai`
4. Execute `mocha`
