var assert = require("assert");
var {Parser} = require("./parser");

exports.testParser = {
    testEvaluate: function() {
        assert.strictEqual(Parser.evaluate("2 ^ x", { x: 3 }), 8);
        assert.strictEqual(Parser.evaluate("2 * x + 1", { x: 3 }), 7);
        assert.strictEqual(Parser.evaluate("2x + 1", { x: 3 }), 7);
        assert.strictEqual(Parser.evaluate("2 + 3 * x", { x: 4 }), 14);
        assert.strictEqual(Parser.evaluate("2 + 3x", { x: 4 }), 14);
        assert.strictEqual(Parser.evaluate("2PI"), 2 * Math.PI);
        assert.strictEqual(Parser.evaluate("2 + 3 4"), 14);
        assert.strictEqual(Parser.evaluate("2 || 'x' * 3"), '2xxx');
        assert.strictEqual(Parser.evaluate("2 || 'x' 3", { x: 1.5 }), '2xxx');
        assert.strictEqual(Parser.evaluate("2 || 3^2 'x'"), '2xxxxxxxxx');
        assert.strictEqual(Parser.evaluate("(2.7 + 2.3) * x", { x: 4 }), 20);
        assert.strictEqual(Parser.evaluate("[2.7 + 2.3] * x", { x: 4 }), 20);
        assert.strictEqual(Parser.evaluate("(2 + 3) x", { x: 4 }), 20);
        assert.strictEqual(Parser.evaluate("{2 + 3} x", { x: 4 }), 20);
        assert.strictEqual(Parser.evaluate("2 * (3x + 4)", { x: 4 }), 32);
        assert.strictEqual(Parser.evaluate("2-3^x", { x: 4 }), -79);
        assert.strictEqual(Parser.evaluate("-2-3^x", { x: 4 }), -83);
        assert.strictEqual(Parser.evaluate("-3^x", { x: 4 }), -81);
        assert.strictEqual(Parser.evaluate("(-3)^x", { x: 4 }), 81);
        assert.strictEqual(Parser.evaluate("sqrt(2 x)", { x: 8 }), 4);
        assert.strictEqual(Parser.evaluate("sqrt[2 x]", { x: 8 }), 4);
        assert.strictEqual(Parser.evaluate("sqrt{2 x}", { x: 8 }), 4);

        assert.strictEqual(        Parser.evaluate("({2 + 1} * [3^2]) - {12 - {3 / 2}}"), 16.5);
        assert.throws(function() { Parser.evaluate("({2 + 1} * [3^2)) - {12 - {3 / 2}}"); });
        assert.throws(function() { Parser.evaluate("({2 + 1} * [3^2]) - {12 - {3 / 2}]"); });
        assert.throws(function() { Parser.evaluate("({2 + 1} * [3^2]] - {12 - {3 / 2}}"); });

        assert.deepEqual(Parser.evaluate("1, 2, 3"), [1, 2, 3]);
        assert.deepEqual(Parser.evaluate("(1, 2 * 'a' || 'bc', 3)"), [1, 'aabc', 3]);
        assert.deepEqual(Parser.evaluate("(1, (2, 3))"), [1, [2, 3]]);
        assert.deepEqual(Parser.evaluate("(1, 2), 3"), [1, 2, 3]);
        assert.deepEqual(Parser.evaluate("((1, 2), 3)"), [1, 2, 3]);

        assert.deepEqual(JSON.stringify(Parser.evaluate("1,0,0; 0,1,0; 0,0,1")), "[[1,0,0],[0,1,0],[0,0,1]]");
        assert.deepEqual(JSON.stringify(Parser.evaluate("1,0,0; [0,1,0; 0,0,1]")), "[[1,0,0],[[0,1,0],[0,0,1]]]");
        assert.deepEqual(JSON.stringify(Parser.evaluate("1;2")), "[[1],[2]]");
        assert.deepEqual(JSON.stringify(Parser.evaluate("(1,2,3; (4,5,6)); 7,8,9")), "[[1,2,3],[4,5,6],[7,8,9]]");
        assert.deepEqual(JSON.stringify(Parser.evaluate("(1;2), 3")), "[[[1],[2]],3]");
    },

    testSubstitute: function() {
        var expr = Parser.parse("2 * x + 1");
        var expr2 = expr.substitute("x", "4 * x"); // ((2*(4*x))+1)
        assert.strictEqual(expr2.evaluate({ x: 3}), 25);

        expr2 = expr.substitute("x", "4 + x"); // ((2*(4+x))+1)
        assert.strictEqual(expr2.evaluate({ x: 3}), 15);

        expr2 = expr.substitute("x", "4 + y"); // ((2*(4+y))+1)
        assert.deepEqual(expr2.variables(), ['y']);
        assert.strictEqual(expr2.evaluate({ y: 3}), 15);
    },

    testSimplify: function() {
        var expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4 });
        assert.strictEqual(expr.toString(), '(x*3.141592653589793)');
        assert.strictEqual(expr.evaluate({ x: 2 }), 6.283185307179586);
    },

    testVariables: function() {
        var expr = Parser.parse("x * (y * atan(1))");
        assert.deepEqual(expr.variables(), ['x', 'y']);
        assert.deepEqual(expr.simplify({ y: 4 }).variables(), ['x']);
    },

    testToJSFunction: function() {
        var expr = Parser.parse("x * (y * atan(1))");
        var fn = expr.toJSFunction(['x', 'y']);
        assert.strictEqual(fn(2, 4), 6.283185307179586);
        fn = expr.toJSFunction(['y']);
        assert.throws(function() { return fn(4); });

        // Exponentiation and list operators get expanded to function calls or literals
        assert.strictEqual(Parser.parse("3^2").toJSFunction()(), 9);
        assert.strictEqual(Parser.parse("3^x").toJSFunction('x')(3), 27);
        assert.deepEqual(JSON.stringify(Parser.parse("x,0,0; 0,x,0; 0,0,x").toJSFunction('x')(2)), "[[2,0,0],[0,2,0],[0,0,2]]");
        assert.deepEqual(JSON.stringify(Parser.parse("1,0,0; [0,1,0; 0,0,1]").toJSFunction()()), "[[1,0,0],[[0,1,0],[0,0,1]]]");
        assert.deepEqual(JSON.stringify(Parser.parse("a;b").toJSFunction('a,b')(1, 2)), "[[1],[2]]");
        assert.deepEqual(JSON.stringify(Parser.parse("(1,2,3; (4,5,6)); 7,8,9").toJSFunction()()), "[[1,2,3],[4,5,6],[7,8,9]]");
        assert.deepEqual(JSON.stringify(Parser.parse("(1;2), x").toJSFunction('x')(3)), "[[[1],[2]],3]");
        assert.deepEqual(JSON.stringify(Parser.parse("(1;x), 3").toJSFunction('x')(2)), "[[[1],[2]],3]");
    },

    testFunctions: function() {
        assert.strictEqual(Parser.evaluate('sin(16)'), -0.2879033166650653);
        assert.strictEqual(Parser.evaluate('cos(12.5)'), 0.9977982791785807);
        assert.strictEqual(Parser.evaluate('tan(0.123)'), 0.12362406586927442);
        assert.strictEqual(Parser.evaluate('asin(.321)'), 0.32678517653149547);
        assert.strictEqual(Parser.evaluate('acos(-.1)'), 1.6709637479564565);
        assert.strictEqual(Parser.evaluate('atan(-0.3)'), -0.2914567944778671);
        assert.strictEqual(Parser.evaluate('sqrt(12)'), 3.4641016151377544);
        assert.strictEqual(Parser.evaluate('log(1.234)'), 0.21026092548319605);
        assert.strictEqual(Parser.evaluate('abs(-5)'), 5);
        assert.strictEqual(Parser.evaluate('ceil(0.1)'), 1);
        assert.strictEqual(Parser.evaluate('ceil(-2.1)'), -2);
        assert.strictEqual(Parser.evaluate('floor(3.9)'), 3);
        assert.strictEqual(Parser.evaluate('floor(-3.9)'), -4);
        assert.strictEqual(Parser.evaluate('round(1.9)'), 2);
        assert.strictEqual(Parser.evaluate('round(3.1)'), 3);
        assert.strictEqual(Parser.evaluate('exp(4.2)'), 66.68633104092515);
    },

    testCustomOperators: function() {
        var parser = new Parser();
        parser.ops1.string = String;
        parser.functions.string2 = String;

        assert.strictEqual(parser.evaluate('string(2) * 2'), '22');
        assert.strictEqual(parser.evaluate('string2(2) * 2'), '22');
        assert.strictEqual(parser.parse('string(2) * 2').simplify().toString(), "'22'");
        assert.strictEqual(parser.parse('string2(2) * 2').simplify().toString(), "(string2(2)*2)");
    }
};

// start the test runner if we're called directly from command line
if (require.main == module.id) {
    system.exit(require('test').run(exports));
}
