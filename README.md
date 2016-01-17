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

### Quick start ###

**Installation**

```bash
npm install js-expression
```

**Usage**

```javascript
var Parser = require('js-expression').Parser;

function Complex(r, i){
  this.r = r;
  this.i = i || 0;
}

Complex.prototype.toString = function(){
  return this.r + '+' + this.i + 'i';
}

var parser = new Parser();

parser.overload('+', Complex, function(a, b){
  return new Complex(a.r + b.r, a.i + b.i);
});

var c = parser.parse("a + b + 1");
var a = new Complex(1, 2);
var b = new Complex(3, 4);

//Complex { r: 5, i: 6 }
console.log(c.evaluate({a:a, b:b}));
```

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

**addOperator({operator: string}, {priority: number}, {handler: function})**

Add a new operator to evaluate an expression.

```javascript
var parser = new Parser();

function Vector(x, y){
  this.x = x;
  this.y = y;
}

//vector cross
parser.addOperator('**', 3, function(a,b){
  return new Vector(a.x * b.y, -b.x * a.y);
});

var expr = parser.parse("a ** b");

//Vector { x: 4, y: -6 }
console.log(expr.evaluate({
  a: new Vector(1, 2),
  b: new Vector(3, 4)
}));
```

**addFunction({name: string}, {handler: function}[, {can_simplify: boolean} = true])**

Add a new function to evaluate an expression.

```javascript
var parser = new Parser();

parser.addFunction('time', function(){
  return Date.now();
},false);


var expr = parser.parse("'abc?t='+time()");

console.log(expr.evaluate());

parser.addFunction('xor', function(a, b){
    return a ^ b;
});

var expr = parser.parse("xor(5, 7) + x + 1");

//((2+x)+1)
console.log(expr.simplify().toString());
```

**suffix operator**

You can add an operator with a prefix `~` to make it be a suffix operator.

```javascript
var parser = new Parser();

parser.addOperator('~%', 4, function(a){
  return a / 100;
});

var expr1 = parser.parse("((300% % 2)*10)!");

//3628800
console.log(expr1.evaluate());
```

**overload({operator: string}, {Class: constructor}, {handler: function})**

Overload an operator for a new datatype.

```javascript
var parser = new Parser();

function Vector(x, y){
  this.x = x;
  this.y = y;
}

//vector cross
parser.addOperator('**', 3, function(a,b){
  return new Vector(a.x * b.y, -b.x * a.y);
});

//vector add
parser.overload('+', Vector, function(a, b){
  return new Vector(a.x + b.x, a.y + b.y);
});

var expr = parser.parse("a ** b + c");

console.log(expr.toString()); //((a**b)+c)
console.log(expr.evaluate({ //Vector { x: 9, y: -7 }
  a: new Vector(1, 2),
  b: new Vector(3, 4),
  c: new Vector(5, -1),
}));
```

Another example:

```javascript
var parser = new Parser();

parser.overload('+', Array, function(a, b){
  return a.concat(b);
});

var expr3 = parser.parse("(1,2,3) + (4,5,6)");

//got [1,2,3,4,5,6]
console.log(expr3.evaluate());
```

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

```javascript
var expr = Parser.parse("2 ^ x");

//8
expr.evaluate({ x: 3 });
```

**substitute({variable: string}, {expr: Expression, string, or number})**

Create a new expression with the specified variable replaced with another
expression (essentially, function composition).

```javascript
var expr = Parser.parse("2 * x + 1");
//((2*x)+1)

expr.substitute("x", "4 * x");
//((2*(4*x))+1)

expr2.evaluate({ x: 3});
//25
```

**simplify({variables: object})**

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

```javascript
var expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4 });
//(x*3.141592653589793)

var expr.evaluate({ x: 2 });
//6.283185307179586
```

**simplify_exclude_functions**

Some of the functions are not the pure functions. It means you may get a different value during each call, such as `random`. These functions cannot be simplified.

```javascript
var expr = Parser.parse("1 + random()").simplify();
//(1+random())
```

**variables([{include_functions: boolean}])**

```javascript
//Get an array of the unbound variables in the expression.

var expr = Parser.parse("x * (y * atan(1))");
//(x*(y*atan(1)))

expr.variables();
//x,y

expr.variables(true);
//x,y,atan

expr.simplify({ y: 4 }).variables();
//x
```

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

```javascript
var expr = Parser.parse("x ^ 2 + y ^ 2 + 1");
var func1 = expr.toJSFunction(['x', 'y']);
var func2 = expr.toJSFunction(['x'], {y: 2});

func1(1, 1);
//3

func2(2);
//9
```

### Expression Syntax ###

The parser accepts a pretty basic grammar. Operators have the normal precidence
— f(x,y,z) (function calls), ^ (exponentiation), *, /, and % (multiplication,
division, and remainder), and finally +, -, and || (addition, subtraction, and
string concatenation) — and bind from left to right (yes, even exponentiation…
it’s simpler that way).

Inside the first argument of the cond function can be used these operators to compare expressions:
	==		Equal
	!=		Not equal
	>		Greater than
	>=		Greater or equal than
	<		Less than
	<=		Less or equal than
	and		Logical AND operator
	or		Logical OR operator

Example of cond function: `cond(1 and 2 <= 4, 2, 0) + 2` = 4

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
	cond(c, a, b) The condition function where c is condition, a is result if c is true, b is result if c is false

### Tests ###

To run tests, you need:

1. [Install NodeJS](https://github.com/nodejs/node)
2. Install Mocha `npm install -g mocha`
3. Install Chai `npm install chai`
4. Execute `mocha`
