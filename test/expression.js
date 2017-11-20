/* global describe, it */

'use strict';

var assert = require('assert');
var Parser = require('../dist/bundle').Parser;

describe('Expression', function () {
  describe('evaluate()', function () {
    it('2 ^ x', function () {
      assert.strictEqual(Parser.evaluate('2 ^ x', {x: 3}), 8);
    });

    it('2 * x + 1', function () {
      assert.strictEqual(Parser.evaluate('2 * x + 1', {x: 3}), 7);
    });

    it('2 + 3 * x', function () {
      assert.strictEqual(Parser.evaluate('2 + 3 * x', {x: 4}), 14);
    });

    it('(2 + 3) * x', function () {
      assert.strictEqual(Parser.evaluate('(2 + 3) * x', {x: 4}), 20);
    });

    it('2-3^x', function () {
      assert.strictEqual(Parser.evaluate('2-3^x', {x: 4}), -79);
    });

    it('-2-3^x', function () {
      assert.strictEqual(Parser.evaluate('-2-3^x', {x: 4}), -83);
    });

    it('-3^x', function () {
      assert.strictEqual(Parser.evaluate('-3^x', {x: 4}), -81);
    });

    it('(-3)^x', function () {
      assert.strictEqual(Parser.evaluate('(-3)^x', {x: 4}), 81);
    });

    it('2 ^ x.y', function () {
      assert.strictEqual(Parser.evaluate('2^x.y', {x: {y: 3}}), 8);
    });

    it('2 + 3 * foo.bar.baz', function () {
      assert.strictEqual(Parser.evaluate('2 + 3 * foo.bar.baz', {foo: {bar: {baz: 4}}}), 14);
    });

    it('10/-1', function () {
      assert.strictEqual(Parser.evaluate('10/-1'), -10);
    });

    it('10*-1', function () {
      assert.strictEqual(Parser.evaluate('10*-1'), -10);
    });

    it('10*-x', function () {
      assert.strictEqual(Parser.evaluate('10*-x', {x: 1}), -10);
    });

    it('10+-1', function () {
      assert.strictEqual(Parser.evaluate('10+-1'), 9);
    });

    it('10/+1', function () {
      assert.strictEqual(Parser.evaluate('10/+1'), 10);
    });

    it('10*+1', function () {
      assert.strictEqual(Parser.evaluate('10*+1'), 10);
    });

    it('10*+x', function () {
      assert.strictEqual(Parser.evaluate('10*+x', {x: 1}), 10);
    });

    it('10+ +1', function () {
      assert.strictEqual(Parser.evaluate('10+ +1'), 11);
    });

    it('10/-2', function () {
      assert.strictEqual(Parser.evaluate('10/-2'), -5);
    });

    it('2^-4', function () {
      assert.strictEqual(Parser.evaluate('2^-4'), 1 / 16);
    });

    it('2^(-4)', function () {
      assert.strictEqual(Parser.evaluate('2^(-4)'), 1 / 16);
    });

    it('\'as\' || \'df\'', function () {
      assert.strictEqual(Parser.evaluate('\'as\' || \'df\''), 'asdf');
    });

    it('should fail with undefined variables', function () {
      assert.throws(function () { Parser.evaluate('x + 1'); }, Error);
    });

    it('should fail trying to call a non-function', function () {
      assert.throws(function () { Parser.evaluate('f()', { f: 2 }); }, Error);
    });

    it('$x * $y_+$a1*$z - $b2', function () {
      assert.strictEqual(Parser.evaluate('$x * $y_+$a1*$z - $b2', { $a1: 3, $b2: 5, $x: 7, $y_: 9, $z: 11 }), 91);
    });

    it('max(conf.limits.lower, conf.limits.upper)', function () {
      assert.strictEqual(Parser.evaluate('max(conf.limits.lower, conf.limits.upper)', { conf: { limits: { lower: 4, upper: 9 } } }), 9);
    });

    it('fn.max(conf.limits.lower, conf.limits.upper)', function () {
      assert.strictEqual(Parser.evaluate('fn.max(conf.limits.lower, conf.limits.upper)', { fn: { max: Math.max }, conf: { limits: { lower: 4, upper: 9 } } }), 9);
    });
  });

  describe('substitute()', function () {
    var parser = new Parser();

    var expr = parser.parse('2 * x + 1');
    var expr2 = expr.substitute('x', '4 * x');
    it('((2*(4*x))+1)', function () {
      assert.strictEqual(expr2.evaluate({x: 3}), 25);
    });

    var expr3 = expr.substitute('x', '4 * x.y.z');
    it('((2*(4*x.y.z))+1)', function () {
      assert.strictEqual(expr3.evaluate({ x: { y: { z: 3 } } }), 25);
    });

    var expr4 = parser.parse('-x').substitute('x', '-4 + y');
    it('-(-4 + y)', function () {
      assert.strictEqual(expr4.toString(), '(-((-4) + y))');
      assert.strictEqual(expr4.evaluate({ y: 2 }), 2);
    });

    var expr5 = parser.parse('x + y').substitute('y', 'x ? 1 : 2');
    it('x + (x ? 1 : 2)', function () {
      assert.strictEqual(expr5.toString(), '(x + (x ? (1) : (2)))');
      assert.strictEqual(expr5.evaluate({ x: 3 }), 4);
      assert.strictEqual(expr5.evaluate({ x: 0 }), 2);
    });

    var expr6 = parser.parse('x ? y : z').substitute('y', 'x');
    it('x ? x : z', function () {
      assert.strictEqual(expr6.toString(), '(x ? (x) : (z))');
      assert.strictEqual(expr6.evaluate({ x: 1, z: 2 }), 1);
      assert.strictEqual(expr6.evaluate({ x: 0, z: 2 }), 2);
    });

    var expr7 = expr.substitute('x', parser.parse('4 * x'));
    it('should substitute expressions', function () {
      assert.strictEqual(expr7.toString(), '((2 * (4 * x)) + 1)');
      assert.strictEqual(expr7.evaluate({x: 3}), 25);
    });
  });

  describe('simplify()', function () {
    var expr = Parser.parse('x * (y * atan(1))').simplify({ y: 4 });
    it('(x*3.141592653589793)', function () {
      assert.strictEqual(expr.toString(), '(x * 3.141592653589793)');
    });

    it('6.283185307179586', function () {
      assert.strictEqual(expr.simplify({ x: 2 }).toString(), '6.283185307179586');
    });

    it('(x/2) ? y : z', function () {
      assert.strictEqual(Parser.parse('(x/2) ? y : z').simplify({ x: 4 }).toString(), '(2 ? (y) : (z))');
    });

    it('x ? (y + 1) : z', function () {
      assert.strictEqual(Parser.parse('x ? (y + 1) : z').simplify({ y: 2 }).toString(), '(x ? (3) : (z))');
    });

    it('x ? y : (z * 4)', function () {
      assert.strictEqual(Parser.parse('x ? y : (z * 4)').simplify({ z: 3 }).toString(), '(x ? (y) : (12))');
    });
  });

  describe('variables()', function () {
    var expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
    it('["x", "y", "z.y.x"]', function () {
      assert.deepEqual(expr.variables(), ['x', 'y', 'z']);
    });

    it('["x", "z.y.x"]', function () {
      assert.deepEqual(expr.simplify({y: 4}).variables(), ['x', 'z']);
    });

    it('["x"]', function () {
      assert.deepEqual(expr.simplify({ y: 4, z: { y: { x: 5 } } }).variables(), ['x']);
    });

    it('a or b ? c + d : e * f', function () {
      assert.deepEqual(Parser.parse('a or b ? c + d : e * f').variables(), ['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('$x * $y_+$a1*$z - $b2', function () {
      assert.deepEqual(Parser.parse('$x * $y_+$a1*$z - $b2').variables(), ['$x', '$y_', '$a1', '$z', '$b2']);
    });

    it('user.age + 2', function () {
      assert.deepEqual(Parser.parse('user.age + 2').variables(), ['user']);
    });

    it('user.age + 2 with { withMembers: false } option', function () {
      assert.deepEqual(Parser.parse('user.age + 2').variables({ withMembers: false }), ['user']);
    });

    it('user.age + 2 with { withMembers: true } option', function () {
      var expr = Parser.parse('user.age + 2');
      assert.deepEqual(expr.variables({ withMembers: true }), ['user.age']);
    });

    it('x.y ? x.y.z : default.z with { withMembers: true } option', function () {
      var expr = Parser.parse('x.y ? x.y.z : default.z');
      assert.deepEqual(expr.variables({ withMembers: true }), ['x.y.z', 'default.z', 'x.y']);
    });

    it('x.y < 3 ? 2 * x.y.z : default.z + 1 with { withMembers: true } option', function () {
      var expr = Parser.parse('x.y < 3 ? 2 * x.y.z : default.z + 1');
      assert.deepEqual(expr.variables({ withMembers: true }), ['x.y', 'x.y.z', 'default.z']);
    });

    it('user.age with { withMembers: true } option', function () {
      var expr = Parser.parse('user.age');
      assert.deepEqual(expr.variables({ withMembers: true }), ['user.age']);
    });

    it('x with { withMembers: true } option', function () {
      var expr = Parser.parse('x');
      assert.deepEqual(expr.variables({ withMembers: true }), ['x']);
    });

    it('x with { withMembers: false } option', function () {
      var expr = Parser.parse('x');
      assert.deepEqual(expr.variables({ withMembers: false }), ['x']);
    });

    it('max(conf.limits.lower, conf.limits.upper) with { withMembers: false } option', function () {
      var expr = Parser.parse('max(conf.limits.lower, conf.limits.upper)');
      assert.deepEqual(expr.variables({ withMembers: false }), ['conf']);
    });

    it('max(conf.limits.lower, conf.limits.upper) with { withMembers: true } option', function () {
      var expr = Parser.parse('max(conf.limits.lower, conf.limits.upper)');
      assert.deepEqual(expr.variables({ withMembers: true }), ['conf.limits.lower', 'conf.limits.upper']);
    });

    it('fn.max(conf.limits.lower, conf.limits.upper) with { withMembers: false } option', function () {
      var expr = Parser.parse('fn.max(conf.limits.lower, conf.limits.upper)');
      assert.deepEqual(expr.variables({ withMembers: false }), ['fn', 'conf']);
    });

    it('fn.max(conf.limits.lower, conf.limits.upper) with { withMembers: true } option', function () {
      var expr = Parser.parse('fn.max(conf.limits.lower, conf.limits.upper)');
      assert.deepEqual(expr.variables({ withMembers: true }), ['fn.max', 'conf.limits.lower', 'conf.limits.upper']);
    });
  });

  describe('symbols()', function () {
    var expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
    it('["x", "y", "z.y.x"]', function () {
      assert.deepEqual(expr.symbols(), ['x', 'y', 'atan2', 'z']);
    });

    it('["x", "z.y.x"]', function () {
      assert.deepEqual(expr.simplify({y: 4}).symbols(), ['x', 'atan2', 'z']);
    });

    it('["x"]', function () {
      assert.deepEqual(expr.simplify({ y: 4, z: { y: { x: 5 } } }).symbols(), ['x', 'atan2']);
    });

    it('a or b ? c + d : e * f', function () {
      assert.deepEqual(Parser.parse('a or b ? c + d : e * f').symbols(), ['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('user.age + 2', function () {
      assert.deepEqual(Parser.parse('user.age + 2').symbols(), ['user']);
    });

    it('user.age + 2 with { withMembers: false } option', function () {
      assert.deepEqual(Parser.parse('user.age + 2').symbols({ withMembers: false }), ['user']);
    });

    it('user.age + 2 with { withMembers: true } option', function () {
      var expr = Parser.parse('user.age + 2');
      assert.deepEqual(expr.symbols({ withMembers: true }), ['user.age']);
    });

    it('x.y ? x.y.z : default.z with { withMembers: true } option', function () {
      var expr = Parser.parse('x.y ? x.y.z : default.z');
      assert.deepEqual(expr.symbols({ withMembers: true }), ['x.y.z', 'default.z', 'x.y']);
    });

    it('x.y < 3 ? 2 * x.y.z : default.z + 1 with { withMembers: true } option', function () {
      var expr = Parser.parse('x.y < 3 ? 2 * x.y.z : default.z + 1');
      assert.deepEqual(expr.symbols({ withMembers: true }), ['x.y', 'x.y.z', 'default.z']);
    });

    it('user.age with { withMembers: true } option', function () {
      var expr = Parser.parse('user.age');
      assert.deepEqual(expr.symbols({ withMembers: true }), ['user.age']);
    });

    it('x with { withMembers: true } option', function () {
      var expr = Parser.parse('x');
      assert.deepEqual(expr.symbols({ withMembers: true }), ['x']);
    });

    it('x with { withMembers: false } option', function () {
      var expr = Parser.parse('x');
      assert.deepEqual(expr.symbols({ withMembers: false }), ['x']);
    });
  });

  describe('toString()', function () {
    var parser = new Parser();

    it('2 ^ x', function () {
      assert.strictEqual(parser.parse('2 ^ x').toString(), '(2 ^ x)');
    });

    it('2 * x + 1', function () {
      assert.strictEqual(parser.parse('2 * x + 1').toString(), '((2 * x) + 1)');
    });

    it('2 + 3 * x', function () {
      assert.strictEqual(parser.parse('2 + 3 * x').toString(), '(2 + (3 * x))');
    });

    it('(2 + 3) * x', function () {
      assert.strictEqual(parser.parse('(2 + 3) * x').toString(), '((2 + 3) * x)');
    });

    it('2-3^x', function () {
      assert.strictEqual(parser.parse('2-3^x').toString(), '(2 - (3 ^ x))');
    });

    it('-2-3^x', function () {
      assert.strictEqual(parser.parse('-2-3^x').toString(), '((-2) - (3 ^ x))');
    });

    it('-3^x', function () {
      assert.strictEqual(parser.parse('-3^x').toString(), '(-(3 ^ x))');
    });

    it('(-3)^x', function () {
      assert.strictEqual(parser.parse('(-3)^x').toString(), '((-3) ^ x)');
    });

    it('2 ^ x.y', function () {
      assert.strictEqual(parser.parse('2^x.y').toString(), '(2 ^ x.y)');
    });

    it('2 + 3 * foo.bar.baz', function () {
      assert.strictEqual(parser.parse('2 + 3 * foo.bar.baz').toString(), '(2 + (3 * foo.bar.baz))');
    });

    it('sqrt 10/-1', function () {
      assert.strictEqual(parser.parse('sqrt 10/-1').toString(), '((sqrt 10) / (-1))');
    });

    it('10*-1', function () {
      assert.strictEqual(parser.parse('10*-1').toString(), '(10 * (-1))');
    });

    it('10+-1', function () {
      assert.strictEqual(parser.parse('10+-1').toString(), '(10 + (-1))');
    });

    it('10+ +1', function () {
      assert.strictEqual(parser.parse('10+ +1').toString(), '(10 + (+1))');
    });

    it('sin 2^-4', function () {
      assert.strictEqual(parser.parse('sin 2^-4').toString(), '(sin (2 ^ (-4)))');
    });

    it('a ? b : c', function () {
      assert.strictEqual(parser.parse('a ? b : c').toString(), '(a ? (b) : (c))');
    });

    it('a ? b : c ? d : e', function () {
      assert.strictEqual(parser.parse('a ? b : c ? d : e').toString(), '(a ? (b) : ((c ? (d) : (e))))');
    });

    it('a ? b ? c : d : e', function () {
      assert.strictEqual(parser.parse('a ? b ? c : d : e').toString(), '(a ? ((b ? (c) : (d))) : (e))');
    });

    it('a == 2 ? b + 1 : c * 2', function () {
      assert.strictEqual(parser.parse('a == 2 ? b + 1 : c * 2').toString(), '((a == 2) ? ((b + 1)) : ((c * 2)))');
    });

    it('floor(random() * 10)', function () {
      assert.strictEqual(parser.parse('floor(random() * 10)').toString(), '(floor (random() * 10))');
    });

    it('hypot(random(), max(2, x, y))', function () {
      assert.strictEqual(parser.parse('hypot(random(), max(2, x, y))').toString(), 'hypot(random(), max(2, x, y))');
    });

    it('not 0 or 1 and 2', function () {
      assert.strictEqual(parser.parse('not 0 or 1 and 2').toString(), '((not 0) or ((1 and (2))))');
    });

    it('a < b or c > d and e <= f or g >= h and i == j or k != l', function () {
      assert.strictEqual(parser.parse('a < b or c > d and e <= f or g >= h and i == j or k != l').toString(),
        '((((a < b) or (((c > d) and ((e <= f))))) or (((g >= h) and ((i == j))))) or ((k != l)))');
    });

    it('\'as\' || \'df\'', function () {
      assert.strictEqual(parser.parse('\'as\' || \'df\'').toString(), '("as" || "df")');
    });

    it('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'', function () {
      assert.strictEqual(parser.parse('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'').toString(), '"A\\bB\\tC\\nD\\fE\\r\'F\\\\G"');
    });

    it('negative numbers are parenthesized', function () {
      assert.strictEqual(parser.parse('x + y').simplify({ y: -2 }).toString(), '(x + (-2))');
      assert.strictEqual(parser.parse('x + (2 - 3)').simplify().toString(), '(x + (-1))');
    });

    it('(x - 1)!', function () {
      assert.strictEqual(parser.parse('(x - 1)!').toString(), '((x - 1)!)');
    });
  });

  describe('toJSFunction()', function () {
    var parser = new Parser();

    it('2 ^ x', function () {
      var expr = parser.parse('2 ^ x');
      var f = expr.toJSFunction('x');
      assert.strictEqual(f(2), 4);
      assert.strictEqual(f(3), 8);
      assert.strictEqual(f(-1), 0.5);
    });

    it('x || y', function () {
      var expr = parser.parse('x || y');
      var f = expr.toJSFunction('x, y');
      assert.strictEqual(f(4, 2), '42');
    });

    it('(sqrt y) + max(3, 1) * (x ? -y : z)', function () {
      var expr = parser.parse('(sqrt y) + max(3, 1) * (x ? -y : z)');
      var f = expr.toJSFunction('x,y,z');
      assert.strictEqual(f(true, 4, 3), -10);
      assert.strictEqual(f(false, 4, 3), 11);
    });

    it('should throw when missing parameter', function () {
      var expr = parser.parse('x * (y * atan(1))');
      var f = expr.toJSFunction(['x', 'y']);
      assert.strictEqual(f(2, 4), 6.283185307179586);

      f = expr.toJSFunction(['y']);
      assert.throws(function () { return f(4); }, Error);
    });

    it('should simplify first', function () {
      var expr = parser.parse('x * (y * atan(1))');
      var f = expr.toJSFunction(['y'], { x: 2 });
      assert.strictEqual(f(4), 6.283185307179586);
    });

    it('2 * x + 1', function () {
      assert.strictEqual(parser.parse('2 * x + 1').toJSFunction('x')(4), 9);
    });

    it('2 + 3 * x', function () {
      assert.strictEqual(parser.parse('2 + 3 * x').toJSFunction('x')(5), 17);
    });

    it('2-3^x', function () {
      assert.strictEqual(parser.parse('2-3^x').toJSFunction('x')(2), -7);
    });

    it('-2-3^x', function () {
      assert.strictEqual(parser.parse('-2-3^x').toJSFunction('x')(2), -11);
    });

    it('-3^x', function () {
      assert.strictEqual(parser.parse('-3^x').toJSFunction('x')(4), -81);
    });

    it('(-3)^x', function () {
      assert.strictEqual(parser.parse('(-3)^x').toJSFunction('x')(4), 81);
    });

    it('2 ^ x.y', function () {
      assert.strictEqual(parser.parse('2^x.y').toJSFunction('x')({ y: 5 }), 32);
    });

    it('2 + 3 * foo.bar.baz', function () {
      assert.strictEqual(parser.parse('2 + 3 * foo.bar.baz').toJSFunction('foo')({ bar: { baz: 5 } }), 17);
    });

    it('sqrt 10/-1', function () {
      assert.strictEqual(parser.parse('sqrt 10/-1').toJSFunction()(), -Math.sqrt(10));
    });

    it('10*-1', function () {
      assert.strictEqual(parser.parse('10*-1').toJSFunction()(), -10);
    });

    it('10+-1', function () {
      assert.strictEqual(parser.parse('10+-1').toJSFunction()(), 9);
    });

    it('10+ +1', function () {
      assert.strictEqual(parser.parse('10+ +1').toJSFunction()(), 11);
    });

    it('sin 2^-4', function () {
      assert.strictEqual(parser.parse('sin 2^-4').toJSFunction('x')(4), Math.sin(1 / 16));
    });

    it('a ? b : c', function () {
      assert.strictEqual(parser.parse('a ? b : c').toJSFunction('a,b,c')(1, 2, 3), 2);
      assert.strictEqual(parser.parse('a ? b : c').toJSFunction('a,b,c')(0, 2, 3), 3);
    });

    it('a ? b : c ? d : e', function () {
      assert.strictEqual(parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(1, 2, 3, 4, 5), 2);
      assert.strictEqual(parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(0, 2, 3, 4, 5), 4);
      assert.strictEqual(parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(0, 2, 0, 4, 5), 5);
      assert.strictEqual(parser.parse('a ? b : c ? d : e').toJSFunction('a,b,c,d,e')(1, 2, 0, 4, 5), 2);
    });

    it('a ? b ? c : d : e', function () {
      assert.strictEqual(parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(1, 2, 3, 4, 5), 3);
      assert.strictEqual(parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(0, 2, 3, 4, 5), 5);
      assert.strictEqual(parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(1, 0, 3, 4, 5), 4);
      assert.strictEqual(parser.parse('a ? b ? c : d : e').toJSFunction('a,b,c,d,e')(0, 0, 3, 4, 5), 5);
    });

    it('a == 2 ? b + 1 : c * 2', function () {
      assert.strictEqual(parser.parse('a == 2 ? b + 1 : c * 2').toJSFunction('a,b,c')(2, 4, 8), 5);
      assert.strictEqual(parser.parse('a == 2 ? b + 1 : c * 2').toJSFunction('a,b,c')(1, 4, 8), 16);
      assert.strictEqual(parser.parse('a == 2 ? b + 1 : c * 2').toJSFunction('a,b,c')('2', 4, 8), 16);
    });

    it('floor(random() * 10)', function () {
      it('should return different numbers', function () {
        var fn = Parser.parse('floor(random() * 10)').toJSFunction();
        var counts = {};
        for (var i = 0; i < 1000; i++) {
          var x = fn();
          counts[x] = (counts[x] || 0) + 1;
        }
        for (i = 0; i < 10; i++) {
          assert.ok(counts[i] >= 85 && counts[i] <= 115);
        }
        assert.deepEqual(Object.keys(counts).sort(), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
      });
    });

    it('hypot(f(), max(2, x, y))', function () {
      assert.strictEqual(parser.parse('hypot(f(), max(2, x, y))').toJSFunction('f, x, y')(function () { return 3; }, 4, 1), 5);
    });

    it('not x or y and z', function () {
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 0, 0), true);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 0, 1), true);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 1, 0), true);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(0, 1, 1), true);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 0, 0), false);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 0, 1), false);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 1, 0), false);
      assert.strictEqual(parser.parse('not x or y and z').toJSFunction('x,y,z')(1, 1, 1), true);
    });

    it('a < b or c > d', function () {
      assert.strictEqual(parser.parse('a < b or c > d').toJSFunction('a,b,c,d')(1, 2, 3, 4), true);
      assert.strictEqual(parser.parse('a < b or c > d').toJSFunction('a,b,c,d')(2, 2, 3, 4), false);
      assert.strictEqual(parser.parse('a < b or c > d').toJSFunction('a,b,c,d')(2, 2, 5, 4), true);
    });

    it('e <= f or g >= h', function () {
      assert.strictEqual(parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(1, 2, 3, 4), true);
      assert.strictEqual(parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(2, 2, 3, 4), true);
      assert.strictEqual(parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(3, 2, 5, 4), true);
      assert.strictEqual(parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(3, 2, 4, 4), true);
      assert.strictEqual(parser.parse('e <= f or g >= h').toJSFunction('e,f,g,h')(3, 2, 3, 4), false);
    });

    it('i == j or k != l', function () {
      assert.strictEqual(parser.parse('i == j or k != l').toJSFunction('i,j,k,l')(1, 2, 3, 4), true);
      assert.strictEqual(parser.parse('i == j or k != l').toJSFunction('i,j,k,l')(2, 2, 3, 4), true);
      assert.strictEqual(parser.parse('i == j or k != l').toJSFunction('i,j,k,l')(1, 2, 4, 4), false);
      assert.strictEqual(parser.parse('i == j or k != l').toJSFunction('i,j,k,l')('2', 2, 4, 4), false);
      assert.strictEqual(parser.parse('i == j or k != l').toJSFunction('i,j,k,l')('2', 2, '4', 4), true);
    });

    it('short-circuits and', function () {
      assert.strictEqual(parser.parse('a and fail()').toJSFunction('a')(false), false);
    });

    it('short-circuits or', function () {
      assert.strictEqual(parser.parse('a or fail()').toJSFunction('a')(true), true);
    });

    it('\'as\' || s', function () {
      assert.strictEqual(parser.parse('\'as\' || s').toJSFunction('s')('df'), 'asdf');
      assert.strictEqual(parser.parse('\'as\' || s').toJSFunction('s')(4), 'as4');
    });

    it('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'', function () {
      assert.strictEqual(parser.parse('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'').toJSFunction()(), 'A\bB\tC\nD\fE\r\'F\\G');
    });

    it('"A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G"', function () {
      assert.strictEqual(parser.parse('"A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G"').toJSFunction()(), 'A\bB\tC\nD\fE\r\'F\\G');
    });

    it('"\\u2028 and \\u2029"', function () {
      assert.strictEqual(parser.parse('"\\u2028 and \\u2029 \\u2028\\u2029"').toJSFunction()(), '\u2028 and \u2029 \u2028\u2029');
    });

    it('(x - 1)!', function () {
      assert.strictEqual(parser.parse('(x - 1)!').toJSFunction('x')(1), 1);
      assert.strictEqual(parser.parse('(x - 1)!').toJSFunction('x')(2), 1);
      assert.strictEqual(parser.parse('(x - 1)!').toJSFunction('x')(3), 2);
      assert.strictEqual(parser.parse('(x - 1)!').toJSFunction('x')(4), 6);
      assert.strictEqual(parser.parse('(x - 1)!').toJSFunction('x')(5), 24);
      assert.strictEqual(parser.parse('(x - 1)!').toJSFunction('x')(6), 120);
    });
  });
});
