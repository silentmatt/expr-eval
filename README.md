JavaScript Expression Evaluator
===============================

Description
-----------

This library is a modified version of Raphael Graf’s ActionScript Expression
Parser. When I wrote the JavaScript Function Plotter, I wanted a better
alternative to using JavaScript’s eval function. There’s no security
risk using eval in this context, because you can only run code in your own browser, but it’s not as
convenient for math (Math.pow(2,x) instead of 2^x, etc.).

## Documentation (incomplete, of course) ##

The parser is written as an [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) module.
The methods are:

* `parse({expression: string})`:  Convert a mathematical expression into an Expression object.

* `evaluate({expression: string} [, {variables: object}])`:  Parse
and immediately evaluate an expression using the values/functions from 
the {variables} object. `evaluate(expr, vars)` is equivalent to calling
`parse(expr).evaluate(vars)`. In fact, that’s exactly what it does.

* `isVariable({expression: string})`:  Tests whether an expression
  parses as a single variable.

### Expression Object ###

`parse()`  returns an Expression object. Expression objects are similar to
JavaScript functions, i.e. they can be “called” with variables bound to
passed-in values. In fact, they can even be converted into JavaScript
functions.  The associated methods are:

* `evaluate([{variables: object}])`:
Evaluate an expression, with variables bound to the values in {variables}. Each
unbound variable in the expression is bound to the corresponding member of the
{variables} object. If there are unbound variables, evaluate will throw an
exception.

	    require(["./parser"], function(Parser){
	        var expr = Parser.parse("2 ^ x");  // Returns an Expression object
            console.log(expr.evaluate({ x: 3 }));  // 8
        })

* `substitute({variable: string}, {expr: Expression, string, or number})`:
Modifies an expression with the specified variable replaced with another
expression (essentially, function composition).

        require(["./parser"], function(Parser){
	        var expr = Parser.parse("2 * x + 1");
            expr.substitute("x", "4 * x");  //     ((2*(4*x))+1)
            console.log(expr.evaluate({ x: 3}));  // 25
        })

* `simplify({variables: object>)`:
Simplify constant sub-expressions and replace
variable references with literal values. This is basically a partial
evaluation, that does as much of the calcuation as it can with the provided
variables. Function calls are not evaluated (except the built-in operator
functions), since they may not be deterministic.

    Simplify is pretty simple (see what I did there?). It doesn’t know that
addition and multiplication are associative, so ((2\*(4\*x))+1) from the
previous example cannot be simplified unless you provide a value for x.
2\*4\*x + 1 can however, because it’s parsed as (((2\*4)\*x)+1), so the (2\*4)
sub-expression will be replaced with 8, resulting in ((8\*x)+1).

        require(["./parser"], function(Parser){
            var expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4});  // (x*3.141592653589793)
            console.log(expr.evaluate({ x: 2 }));    //    6.283185307179586
        })

* `variables()`:
Get an array of the unbound variables in the expression.

        require(["./parser"], function(Parser){
            var expr = Parser.parse("x * (y * atan(1))");  // (x*(y*atan(1)))
            console.log(expr.variables());   //  x,y
            console.log(expr.simplify({ y: 4 }).variables());  // x
        })

* `toString({verbose: boolean})`: Convert the expression to a string.  Setting verbose to true
will print all parentheses, allowing one to see the parse structure
and more easily debug operator precedence errors.

* `toJSFunction({parameters: Array} [, {variables: object}])`:
Convert an Expression object into a callable JavaScript function. You need to
provide an array of parameter names that should normally be expr.variables().
Any unbound-variables will get their values from the global scope.

* `toJSFunction()`:   Simplifies the Expression (with `{variables}`, if
provided), converting it to a string, and passing the string to the Function
constructor (with some of its own code to bring built-in functions and
constants into scope and return the result of the expression).

* `operators()`: Returns an object containing a count of each kind of operator
  in the expression as well as a tally of the number of variables and
  numbers.  Note that this does not distinguish between unary and
  binary minus.

### Expression Syntax ###

The parser accepts a pretty basic grammar. Operators have the normal precidence
— f(x,y,z) (function calls), ^ (exponentiation), \*, /, and % (multiplication,
division, and remainder), and finally +, -, and || (addition, subtraction, and
string concatenation) — and bind from left to right.
Exponentiation is also left to right associative; see **Bugs** below.

There’s also a “,” (comma) operator that concatenates values into an array.
It’s mostly useful for passing arguments to functions, since it doesn’t always
behave like you would think with regards to multi-dimensional arrays. If the
left value is an array, it pushes the right value onto the end of the array,
otherwise, it creates a new array “[left, right]“. This makes it impossible to
create an array with another array as it’s first element.

### Function operators ###

The parser has several built-in “functions” that are actually operators. The
only difference from an outside point of view, is that they cannot be called
with multiple arguments and they are evaluated by the simplify method if their
arguments are constant.

	Function  Description
	sin(x)  Sine of x (x is in radians)
	cos(x)  Cosine of x (x is in radians)
	tan(x)  Tangent of x (x is… well, you know)
	asin(x)  Arc sine of x (in radians)
	acos(x)  Arc cosine of x (in radians)
	atan(x)  Arc tangent of x (in radians)
	sqrt(x)  Square root of x. Result is NaN (Not a Number) if x is negative.
	log(x)  Natural logarithm of x (following the Javascript naming convention).
	abs(x)  Absolute value (magnatude) of x
	ceil(x)  Ceiling of x — the smallest integer that’s >= x.
	floor(x)  Floor of x — the largest integer that’s <= x
	round(x)  x, rounded to the nearest integer, using “gradeschool rounding”.
	exp(x)  Exponential of x

Besides the “operator” functions, there are several pre-defined functions. You
can provide your own, by binding variables to normal JavaScript functions.
These are not evaluated by simplify.

	Function 	Description
	random(n)  Get a random number in the range [0, n). If n is zero, or not provided, it defaults to 1.
	fac(n) 	n! (factorial of n: “n * (n-1) * (n-2) * … * 2 * 1″)
	min(a,b,…) 	Get the smallest (“minimum”) number in the list
	max(a,b,…) 	Get the largest (“maximum”) number in the list
	pyt(a, b) 	Pythagorean function, i.e. the c in “c2 = a2 + b2“
	pow(x, y)  Returns “x^y”. It’s just provided since it’s in the Math object from JavaScript
	atan2(y, x)  Arc tangent of x/y. i.e. the angle between (0, 0) and (x, y) in radians.


## Bugs ##


Here are some bugs:

* Powers `^` should be right-to-left associative:  `a^b^c` should parse as `a^(b^c)`, not `(a^b)^c`.

* The expression `a^-b` gives an error.  Should parse as `a^(-b)`.

