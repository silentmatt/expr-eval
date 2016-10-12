/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../dist/bundle').Parser;

describe('Expression', function () {
  describe('evaluate()', function () {
    it('2 ^ x', function () {
      expect(Parser.evaluate('2 ^ x', {x: 3})).to.equal(8);
    });

    it('2 * x + 1', function () {
      expect(Parser.evaluate('2 * x + 1', {x: 3})).to.equal(7);
    });

    it('2 + 3 * x', function () {
      expect(Parser.evaluate('2 + 3 * x', {x: 4})).to.equal(14);
    });

    it('(2 + 3) * x', function () {
      expect(Parser.evaluate('(2 + 3) * x', {x: 4})).to.equal(20);
    });

    it('2-3^x', function () {
      expect(Parser.evaluate('2-3^x', {x: 4})).to.equal(-79);
    });

    it('-2-3^x', function () {
      expect(Parser.evaluate('-2-3^x', {x: 4})).to.equal(-83);
    });

    it('-3^x', function () {
      expect(Parser.evaluate('-3^x', {x: 4})).to.equal(-81);
    });

    it('(-3)^x', function () {
      expect(Parser.evaluate('(-3)^x', {x: 4})).to.equal(81);
    });

    it('2 ^ x.y', function () {
      expect(Parser.evaluate('2^x.y', {x: {y: 3}})).to.equal(8);
    });

    it('2 + 3 * foo.bar.baz', function () {
      expect(Parser.evaluate('2 + 3 * foo.bar.baz', {foo: {bar: {baz: 4}}})).to.equal(14);
    });

    it('10/-1', function () {
      expect(Parser.evaluate('10/-1')).to.equal(-10);
    });

    it('10*-1', function () {
      expect(Parser.evaluate('10*-1')).to.equal(-10);
    });

    it('10*-x', function () {
      expect(Parser.evaluate('10*-x', {x: 1})).to.equal(-10);
    });

    it('10+-1', function () {
      expect(Parser.evaluate('10+-1')).to.equal(9);
    });

    it('10/+1', function () {
      expect(Parser.evaluate('10/+1')).to.equal(10);
    });

    it('10*+1', function () {
      expect(Parser.evaluate('10*+1')).to.equal(10);
    });

    it('10*+x', function () {
      expect(Parser.evaluate('10*+x', {x: 1})).to.equal(10);
    });

    it('10+ +1', function () {
      expect(Parser.evaluate('10+ +1')).to.equal(11);
    });

    it('10/-2', function () {
      expect(Parser.evaluate('10/-2')).to.equal(-5);
    });

    it('2^-4', function () {
      expect(Parser.evaluate('2^-4')).to.equal(1 / 16);
    });

    it('2^(-4)', function () {
      expect(Parser.evaluate('2^(-4)')).to.equal(1 / 16);
    });

    it('\'as\' || \'df\'', function () {
      expect(Parser.evaluate('\'as\' || \'df\'')).to.equal('asdf');
    });

    it('should fail with undefined variables', function () {
      expect(function () { Parser.evaluate('x + 1'); }).to.throw(Error);
    });

    it('should fail trying to call a non-function', function () {
      expect(function () { Parser.evaluate('f()', { f: 2 }); }).to.throw(Error);
    });
  });

  describe('substitute()', function () {
    var parser = new Parser();

    var expr = parser.parse('2 * x + 1');
    var expr2 = expr.substitute('x', '4 * x');
    it('((2*(4*x))+1)', function () {
      expect(expr2.evaluate({x: 3})).to.equal(25);
    });

    var expr3 = expr.substitute('x', '4 * x.y.z');
    it('((2*(4*x.y.z))+1)', function () {
      expect(expr3.evaluate({ x: { y: { z: 3 } } })).to.equal(25);
    });

    var expr4 = parser.parse('-x').substitute('x', '-4 + y');
    it('-(-4 + y)', function () {
      expect(expr4.toString()).to.equal('(-((-4) + y))');
      expect(expr4.evaluate({ y: 2 })).to.equal(2);
    });

    var expr5 = parser.parse('x + y').substitute('y', 'x ? 1 : 2');
    it('x + (x ? 1 : 2)', function () {
      expect(expr5.toString()).to.equal('(x + (x ? (1) : (2)))');
      expect(expr5.evaluate({ x: 3 })).to.equal(4);
      expect(expr5.evaluate({ x: 0 })).to.equal(2);
    });

    var expr6 = parser.parse('x ? y : z').substitute('y', 'x');
    it('x ? x : z', function () {
      expect(expr6.toString()).to.equal('(x ? (x) : (z))');
      expect(expr6.evaluate({ x: 1, z: 2 })).to.equal(1);
      expect(expr6.evaluate({ x: 0, z: 2 })).to.equal(2);
    });

    var expr7 = expr.substitute('x', parser.parse('4 * x'));
    it('should substitute expressions', function () {
      expect(expr7.toString()).to.equal('((2 * (4 * x)) + 1)');
      expect(expr7.evaluate({x: 3})).to.equal(25);
    });
  });

  describe('simplify()', function () {
    var expr = Parser.parse('x * (y * atan(1))').simplify({ y: 4 });
    it('(x*3.141592653589793)', function () {
      expect(expr.toString()).to.equal('(x * 3.141592653589793)');
    });

    it('6.283185307179586', function () {
      expect(expr.evaluate({ x: 2 })).to.equal(6.283185307179586);
    });

    it('(x/2) ? y : z', function () {
      expect(Parser.parse('(x/2) ? y : z').simplify({ x: 4 }).toString()).to.equal('(2 ? (y) : (z))');
    });

    it('x ? (y + 1) : z', function () {
      expect(Parser.parse('x ? (y + 1) : z').simplify({ y: 2 }).toString()).to.equal('(x ? (3) : (z))');
    });

    it('x ? y : (z * 4)', function () {
      expect(Parser.parse('x ? y : (z * 4)').simplify({ z: 3 }).toString()).to.equal('(x ? (y) : (12))');
    });
  });

  describe('variables()', function () {
    var expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
    it('["x", "y", "z.y.x"]', function () {
      expect(expr.variables()).to.include.members(['x', 'y', 'z']);
      expect(expr.variables()).to.not.include.members(['atan2']);
    });

    it('["x", "z.y.x"]', function () {
      expect(expr.simplify({y: 4}).variables()).to.include.members(['x', 'z']);
      expect(expr.simplify({y: 4}).variables()).to.not.include.members(['y', 'atan2']);
    });

    it('["x"]', function () {
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).variables()).to.include.members(['x']);
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).variables()).to.not.include.members(['y', 'z', 'atan2']);
    });

    it('a or b ? c + d : e * f', function () {
      expect(Parser.parse('a or b ? c + d : e * f').variables()).to.include.members(['a', 'b', 'c', 'd', 'e', 'f']);
    });
  });

  describe('symbols()', function () {
    var expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
    it('["x", "y", "z.y.x"]', function () {
      expect(expr.symbols()).to.include.members(['x', 'y', 'z', 'atan2']);
    });

    it('["x", "z.y.x"]', function () {
      expect(expr.simplify({y: 4}).symbols()).to.include.members(['x', 'z', 'atan2']);
      expect(expr.simplify({y: 4}).symbols()).to.not.include.members(['y']);
    });

    it('["x"]', function () {
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).symbols()).to.include.members(['x', 'atan2']);
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).symbols()).to.not.include.members(['y', 'z']);
    });

    it('a or b ? c + d : e * f', function () {
      expect(Parser.parse('a or b ? c + d : e * f').symbols()).to.include.members(['a', 'b', 'c', 'd', 'e', 'f']);
    });
  });

  describe('toString()', function () {
    var parser = new Parser();

    it('2 ^ x', function () {
      expect(parser.parse('2 ^ x').toString()).to.equal('(2 ^ x)');
    });

    it('2 * x + 1', function () {
      expect(parser.parse('2 * x + 1').toString()).to.equal('((2 * x) + 1)');
    });

    it('2 + 3 * x', function () {
      expect(parser.parse('2 + 3 * x').toString()).to.equal('(2 + (3 * x))');
    });

    it('(2 + 3) * x', function () {
      expect(parser.parse('(2 + 3) * x').toString()).to.equal('((2 + 3) * x)');
    });

    it('2-3^x', function () {
      expect(parser.parse('2-3^x').toString()).to.equal('(2 - (3 ^ x))');
    });

    it('-2-3^x', function () {
      expect(parser.parse('-2-3^x').toString()).to.equal('((-2) - (3 ^ x))');
    });

    it('-3^x', function () {
      expect(parser.parse('-3^x').toString()).to.equal('(-(3 ^ x))');
    });

    it('(-3)^x', function () {
      expect(parser.parse('(-3)^x').toString()).to.equal('((-3) ^ x)');
    });

    it('2 ^ x.y', function () {
      expect(parser.parse('2^x.y').toString()).to.equal('(2 ^ x.y)');
    });

    it('2 + 3 * foo.bar.baz', function () {
      expect(parser.parse('2 + 3 * foo.bar.baz').toString()).to.equal('(2 + (3 * foo.bar.baz))');
    });

    it('sqrt 10/-1', function () {
      expect(parser.parse('sqrt 10/-1').toString()).to.equal('((sqrt 10) / (-1))');
    });

    it('10*-1', function () {
      expect(parser.parse('10*-1').toString()).to.equal('(10 * (-1))');
    });

    it('10+-1', function () {
      expect(parser.parse('10+-1').toString()).to.equal('(10 + (-1))');
    });

    it('10+ +1', function () {
      expect(parser.parse('10+ +1').toString()).to.equal('(10 + (+1))');
    });

    it('sin 2^-4', function () {
      expect(parser.parse('sin 2^-4').toString()).to.equal('(sin (2 ^ (-4)))');
    });

    it('a ? b : c', function () {
      expect(parser.parse('a ? b : c').toString()).to.equal('(a ? (b) : (c))');
    });

    it('a ? b : c ? d : e', function () {
      expect(parser.parse('a ? b : c ? d : e').toString()).to.equal('(a ? (b) : ((c ? (d) : (e))))');
    });

    it('a ? b ? c : d : e', function () {
      expect(parser.parse('a ? b ? c : d : e').toString()).to.equal('(a ? ((b ? (c) : (d))) : (e))');
    });

    it('a == 2 ? b + 1 : c * 2', function () {
      expect(parser.parse('a == 2 ? b + 1 : c * 2').toString()).to.equal('((a == 2) ? ((b + 1)) : ((c * 2)))');
    });

    it('floor(random() * 10)', function () {
      expect(parser.parse('floor(random() * 10)').toString()).to.equal('(floor (random() * 10))');
    });

    it('hypot(random(), max(2, x, y))', function () {
      expect(parser.parse('hypot(random(), max(2, x, y))').toString()).to.equal('hypot(random(), max(2, x, y))');
    });

    it('not 0 or 1 and 2', function () {
      expect(parser.parse('not 0 or 1 and 2').toString()).to.equal('((not 0) or (1 and 2))');
    });

    it('a < b or c > d and e <= f or g >= h and i == j or k != l', function () {
      expect(parser.parse('a < b or c > d and e <= f or g >= h and i == j or k != l').toString())
        .to.equal('((((a < b) or ((c > d) and (e <= f))) or ((g >= h) and (i == j))) or (k != l))');
    });

    it('\'as\' || \'df\'', function () {
      expect(parser.parse('\'as\' || \'df\'').toString()).to.equal('("as" || "df")');
    });

    it('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'', function () {
      expect(parser.parse('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'').toString()).to.equal('"A\\bB\\tC\\nD\\fE\\r\'F\\\\G"');
    });

    it('negative numbers are parenthesized', function () {
      expect(parser.parse('x + y').simplify({ y: -2 }).toString()).to.equal('(x + (-2))');
      expect(parser.parse('x + (2 - 3)').simplify().toString()).to.equal('(x + (-1))');
    });
  });

  describe('toString(true)', function () {
    var parser = new Parser();

    it('2 ^ x', function () {
      expect(parser.parse('2 ^ x').toString(true)).to.equal('Math.pow(2, x)');
    });

    it('2 * x + 1', function () {
      expect(parser.parse('2 * x + 1').toString(true)).to.equal('((2 * x) + 1)');
    });

    it('2 + 3 * x', function () {
      expect(parser.parse('2 + 3 * x').toString(true)).to.equal('(2 + (3 * x))');
    });

    it('2-3^x', function () {
      expect(parser.parse('2-3^x').toString(true)).to.equal('(2 - Math.pow(3, x))');
    });

    it('-2-3^x', function () {
      expect(parser.parse('-2-3^x').toString(true)).to.equal('((-2) - Math.pow(3, x))');
    });

    it('-3^x', function () {
      expect(parser.parse('-3^x').toString(true)).to.equal('(-Math.pow(3, x))');
    });

    it('(-3)^x', function () {
      expect(parser.parse('(-3)^x').toString(true)).to.equal('Math.pow((-3), x)');
    });

    it('2 ^ x.y', function () {
      expect(parser.parse('2^x.y').toString(true)).to.equal('Math.pow(2, x.y)');
    });

    it('2 + 3 * foo.bar.baz', function () {
      expect(parser.parse('2 + 3 * foo.bar.baz').toString(true)).to.equal('(2 + (3 * foo.bar.baz))');
    });

    it('sqrt 10/-1', function () {
      expect(parser.parse('sqrt 10/-1').toString(true)).to.equal('(sqrt(10) / (-1))');
    });

    it('10*-1', function () {
      expect(parser.parse('10*-1').toString(true)).to.equal('(10 * (-1))');
    });

    it('10+-1', function () {
      expect(parser.parse('10+-1').toString(true)).to.equal('(10 + (-1))');
    });

    it('10+ +1', function () {
      expect(parser.parse('10+ +1').toString(true)).to.equal('(10 + (+1))');
    });

    it('sin 2^-4', function () {
      expect(parser.parse('sin 2^-4').toString(true)).to.equal('sin(Math.pow(2, (-4)))');
    });

    it('a ? b : c', function () {
      expect(parser.parse('a ? b : c').toString(true)).to.equal('(a ? (b) : (c))');
    });

    it('a ? b : c ? d : e', function () {
      expect(parser.parse('a ? b : c ? d : e').toString(true)).to.equal('(a ? (b) : ((c ? (d) : (e))))');
    });

    it('a ? b ? c : d : e', function () {
      expect(parser.parse('a ? b ? c : d : e').toString(true)).to.equal('(a ? ((b ? (c) : (d))) : (e))');
    });

    it('a == 2 ? b + 1 : c * 2', function () {
      expect(parser.parse('a == 2 ? b + 1 : c * 2').toString(true)).to.equal('((a === 2) ? ((b + 1)) : ((c * 2)))');
    });

    it('floor(random() * 10)', function () {
      expect(parser.parse('floor(random() * 10)').toString(true)).to.equal('floor((random() * 10))');
    });

    it('hypot(random(), max(2, x, y))', function () {
      expect(parser.parse('hypot(random(), max(2, x, y))').toString(true)).to.equal('hypot(random(), max(2, x, y))');
    });

    it('not 0 or 1 and 2', function () {
      expect(parser.parse('not 0 or 1 and 2').toString(true)).to.equal('((!0) || (1 && 2))');
    });

    it('a < b or c > d and e <= f or g >= h and i == j or k != l', function () {
      expect(parser.parse('a < b or c > d and e <= f or g >= h and i == j or k != l').toString(true))
        .to.equal('((((a < b) || ((c > d) && (e <= f))) || ((g >= h) && (i === j))) || (k !== l))');
    });

    it('\'as\' || \'df\'', function () {
      expect(parser.parse('\'as\' || \'df\'').toString(true)).to.equal('(String("as") + String("df"))');
    });

    it('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'', function () {
      expect(parser.parse('\'A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G\'').toString(true)).to.equal('"A\\bB\\tC\\nD\\fE\\r\'F\\\\G"');
    });

    it('"A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G"', function () {
      expect(parser.parse('"A\\bB\\tC\\nD\\fE\\r\\\'F\\\\G"').toString(true)).to.equal('"A\\bB\\tC\\nD\\fE\\r\'F\\\\G"');
    });

    it('"\\u2028 and \\u2029"', function () {
      expect(parser.parse('"\\u2028 and \\u2029 \\u2028\\u2029"').toString(true)).to.equal('"\\u2028 and \\u2029 \\u2028\\u2029"');
    });
  });

  describe('toJSFunction()', function () {
    var parser = new Parser();

    it('2 ^ x', function () {
      var expr = parser.parse('2 ^ x');
      var f = expr.toJSFunction('x');
      expect(f(2)).to.equal(4);
      expect(f(3)).to.equal(8);
      expect(f(-1)).to.equal(0.5);
    });

    it('x || y', function () {
      var expr = parser.parse('x || y');
      var f = expr.toJSFunction('x, y');
      expect(f(4, 2)).to.equal('42');
    });

    it('(sqrt y) + max(3, 1) * (x ? -y : z)', function () {
      var expr = parser.parse('(sqrt y) + max(3, 1) * (x ? -y : z)');
      var f = expr.toJSFunction('x,y,z');
      expect(f(true, 4, 3)).to.equal(-10);
      expect(f(false, 4, 3)).to.equal(11);
    });

    it('should throw when missing parameter', function () {
      var expr = parser.parse('x * (y * atan(1))');
      var f = expr.toJSFunction(['x', 'y']);
      expect(f(2, 4)).to.equal(6.283185307179586);

      f = expr.toJSFunction(['y']);
      expect(function () { return f(4); }).to.throw(Error);
    });

    it('should simplify first', function () {
      var expr = parser.parse('x * (y * atan(1))');
      var f = expr.toJSFunction(['y'], { x: 2 });
      expect(f(4)).to.equal(6.283185307179586);
    });
  });
});
