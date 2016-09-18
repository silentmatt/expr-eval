/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../parser').Parser;

describe('Parser', function() {
  describe('#parse()', function () {
    var parser = new Parser();

    it('should skip comments', function () {
      expect(parser.evaluate('2/* comment */+/* another comment */3')).to.equal(5);
      expect(parser.evaluate('2/* comment *///* another comment */3')).to.equal(2 / 3);
    });

    it('should ignore whitespace', function () {
      expect(parser.evaluate(' 3\r + \n \t 4 ')).to.equal(7);
    });

    it('should accept variables starting with E', function () {
      expect(parser.parse('2 * ERGONOMIC').evaluate({ ERGONOMIC: 1000 })).to.equal(2000);
    });

    it('should accept variables starting with PI', function () {
      expect(parser.parse('1 / PITTSBURGH').evaluate({ PITTSBURGH: 2 })).to.equal(0.5);
    });

    it('should fail on empty parentheses', function () {
      expect(function () { parser.parse('5/()'); }).to.throw(Error);
    });

    it('should fail on 5/', function () {
      expect(function () { parser.parse('5/'); }).to.throw(Error);
    });

    it('should parse numbers', function () {
      expect(parser.evaluate('123')).to.equal(123);
      expect(parser.evaluate('123.')).to.equal(123);
      expect(parser.evaluate('123.456')).to.equal(123.456);
      expect(parser.evaluate('.456')).to.equal(0.456);
      expect(parser.evaluate('0.456')).to.equal(0.456);
      expect(parser.evaluate('0.')).to.equal(0);
      expect(parser.evaluate('.0')).to.equal(0);
      expect(parser.evaluate('123.+3')).to.equal(126);
      expect(parser.evaluate('2/123')).to.equal(2 / 123);
    });

    it('should fail on invalid numbers', function() {
      expect(function () { parser.parse('123..'); }).to.throw(Error);
      expect(function () { parser.parse('0..123'); }).to.throw(Error);
      expect(function () { parser.parse('0..'); }).to.throw(Error);
      expect(function () { parser.parse('.0.'); }).to.throw(Error);
      expect(function () { parser.parse('.'); }).to.throw(Error);
    });
  });

  describe('#evaluate()', function() {
    it('2 ^ x', function() {
      expect(Parser.evaluate('2 ^ x', {x: 3})).to.equal(8);
    });

    it('2 * x + 1', function() {
      expect(Parser.evaluate('2 * x + 1', {x: 3})).to.equal(7);
    });

    it('2 + 3 * x', function() {
      expect(Parser.evaluate('2 + 3 * x', {x: 4})).to.equal(14);
    });

    it('(2 + 3) * x', function() {
      expect(Parser.evaluate('(2 + 3) * x', {x: 4})).to.equal(20);
    });

    it('2-3^x', function() {
      expect(Parser.evaluate('2-3^x', {x: 4})).to.equal(-79);
    });

    it('-2-3^x', function() {
      expect(Parser.evaluate('-2-3^x', {x: 4})).to.equal(-83);
    });

    it('-3^x', function() {
      expect(Parser.evaluate('-3^x', {x: 4})).to.equal(-81);
    });

    it('(-3)^x', function() {
      expect(Parser.evaluate('(-3)^x', {x: 4})).to.equal(81);
    });

    it('2 ^ x.y', function() {
      expect(Parser.evaluate('2^x.y', {x: {y: 3}})).to.equal(8);
    });

    it('2 + 3 * foo.bar.baz', function() {
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

    it('10/-2', function() {
      expect(Parser.evaluate('10/-2')).to.equal(-5);
    });

    it('2^-4', function() {
      expect(Parser.evaluate('2^-4')).to.equal(1 / 16);
    });

    it('2^(-4)', function() {
      expect(Parser.evaluate('2^(-4)')).to.equal(1 / 16);
    });

    it('\'as\' || \'df\'', function () {
      expect(Parser.evaluate('\'as\' || \'df\'')).to.equal('asdf');
    });
  });

  describe('#substitute()', function() {
    var expr = Parser.parse('2 * x + 1');
    var expr2 = expr.substitute('x', '4 * x');
    it('((2*(4*x))+1)', function() {
      expect(expr2.evaluate({x: 3})).to.equal(25);
    });

    var expr7 = expr.substitute('x', '4 * x.y.z');
    it('((2*(4*x.y.z))+1)', function() {
      expect(expr7.evaluate({ x: { y: { z: 3 } } })).to.equal(25);
    });
  });

  describe('#simplify()', function() {
    var expr = Parser.parse('x * (y * atan(1))').simplify({ y: 4 });
    it('(x*3.141592653589793)', function() {
      expect(expr.toString()).to.equal('(x*3.141592653589793)');
    });

    it('6.283185307179586', function() {
      expect(expr.evaluate({ x: 2 })).to.equal(6.283185307179586);
    });

    it('(x/2) ? y : z', function() {
      expect(Parser.parse('(x/2) ? y : z').simplify({ x: 4 }).toString()).to.equal('((2)?(y):(z))');
    });

    it('x ? (y + 1) : z', function() {
      expect(Parser.parse('x ? (y + 1) : z').simplify({ y: 2 }).toString()).to.equal('((x)?(3):(z))');
    });

    it('x ? y : (z * 4)', function() {
      expect(Parser.parse('x ? y : (z * 4)').simplify({ z: 3 }).toString()).to.equal('((x)?(y):(12))');
    });
  });

  describe('#variables()', function() {
    var expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
    it('["x", "y", "z.y.x"]', function() {
      expect(expr.variables()).to.include.members(['x', 'y', 'z']);
      expect(expr.variables()).to.not.include.members(['atan2']);
    });

    it('["x", "z.y.x"]', function() {
      expect(expr.simplify({y: 4}).variables()).to.include.members(['x', 'z']);
      expect(expr.simplify({y: 4}).variables()).to.not.include.members(['y', 'atan2']);
    });

    it('["x"]', function() {
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).variables()).to.include.members(['x']);
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).variables()).to.not.include.members(['y', 'z', 'atan2']);
    });
  });

  describe('#symbols()', function() {
    var expr = Parser.parse('x * (y * atan2(1, 2)) + z.y.x');
    it('["x", "y", "z.y.x"]', function() {
      expect(expr.symbols()).to.include.members(['x', 'y', 'z', 'atan2']);
    });

    it('["x", "z.y.x"]', function() {
      expect(expr.simplify({y: 4}).symbols()).to.include.members(['x', 'z', 'atan2']);
      expect(expr.simplify({y: 4}).symbols()).to.not.include.members(['y']);
    });

    it('["x"]', function() {
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).symbols()).to.include.members(['x', 'atan2']);
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).symbols()).to.not.include.members(['y', 'z']);
    });
  });

  describe('#equal()', function() {
    it('2 == 3', function() {
      expect(Parser.evaluate('2 == 3')).to.equal(false);
    });

    it('3 * 1 == 2', function() {
      expect(Parser.evaluate('3 == 2')).to.not.equal(true);
    });

    it('3 == 3', function() {
      expect(Parser.evaluate('3 == 3')).to.equal(true);
    });

    it('\'3\' == 3', function() {
      expect(Parser.evaluate('\'3\' == 3')).to.equal(false);
    });

    it('\'string 1\' == \'string 2\'', function() {
      expect(Parser.evaluate('\'string 1\' == \'string 2\'')).to.equal(false);
    });

    it('\'string 1\' == "string 1"', function() {
      expect(Parser.evaluate('\'string 1\' == \'string 1\'')).to.equal(true);
    });

    it('\'3\' == \'3\'', function() {
      expect(Parser.evaluate('\'3\' == \'3\'')).to.equal(true);
    });
  });

  describe('#notEqual()', function() {
    it('2 != 3', function() {
      expect(Parser.evaluate('2 != 3')).to.equal(true);
    });

    it('3 != 2', function() {
      expect(Parser.evaluate('3 != 2')).to.not.equal(false);
    });

    it('3 != 3', function() {
      expect(Parser.evaluate('3 != 3')).to.equal(false);
    });

    it('\'3\' != 3', function() {
      expect(Parser.evaluate('\'3\' != 3')).to.equal(true);
    });

    it('\'3\' != \'3\'', function() {
      expect(Parser.evaluate('\'3\' != \'3\'')).to.equal(false);
    });

    it('\'string 1\' != \'string 1\'', function() {
      expect(Parser.evaluate('\'string 1\' != \'string 1\'')).to.equal(false);
    });

    it('\'string 1\' != \'string 2\'', function() {
      expect(Parser.evaluate('\'string 1\' != \'string 2\'')).to.equal(true);
    });
  });

  describe('#greaterThan()', function() {
    it('2 > 3', function() {
      expect(Parser.evaluate('2 > 3')).to.equal(false);
    });

    it('3 > 2', function() {
      expect(Parser.evaluate('3 > 2')).to.equal(true);
    });

    it('3 > 3', function() {
      expect(Parser.evaluate('3 > 3')).to.equal(false);
    });
  });

  describe('#greaterThanEqual()', function() {
    it('2 >= 3', function() {
      expect(Parser.evaluate('2 >= 3')).to.equal(false);
    });

    it('3 >= 2', function() {
      expect(Parser.evaluate('3 >= 2')).to.equal(true);
    });

    it('3 >= 3', function() {
      expect(Parser.evaluate('3 >= 3')).to.equal(true);
    });
  });

  describe('#lessThan()', function() {
    it('2 < 3', function() {
      expect(Parser.evaluate('2 < 3')).to.equal(true);
    });

    it('3 < 2', function() {
      expect(Parser.evaluate('3 < 2')).to.equal(false);
    });

    it('3 < 3', function() {
      expect(Parser.evaluate('3 < 3')).to.equal(false);
    });
  });

  describe('#lessThanEqual()', function() {
    it('2 <= 3', function() {
      expect(Parser.evaluate('2 <= 3')).to.equal(true);
    });

    it('3 <= 2', function() {
      expect(Parser.evaluate('3 <= 2')).to.equal(false);
    });

    it('3 <= 3', function() {
      expect(Parser.evaluate('3 <= 3')).to.equal(true);
    });
  });

  describe('#andOperator()', function() {
    it('1 and 0', function() {
      expect(Parser.evaluate('1 and 0')).to.equal(false);
    });

    it('1 and 1', function() {
      expect(Parser.evaluate('1 and 1')).to.equal(true);
    });

    it('0 and 0', function() {
      expect(Parser.evaluate('0 and 0')).to.equal(false);
    });

    it('0 and 1', function() {
      expect(Parser.evaluate('0 and 1')).to.equal(false);
    });

    it('0 and 1 and 0', function() {
      expect(Parser.evaluate('0 and 1 and 0')).to.equal(false);
    });

    it('1 and 1 and 0', function() {
      expect(Parser.evaluate('1 and 1 and 0')).to.equal(false);
    });
  });

  describe('#orOperator()', function() {
    it('1 or 0', function() {
      expect(Parser.evaluate('1 or 0')).to.equal(true);
    });

    it('1 or 1', function() {
      expect(Parser.evaluate('1 or 1')).to.equal(true);
    });

    it('0 or 0', function() {
      expect(Parser.evaluate('0 or 0')).to.equal(false);
    });

    it('0 or 1', function() {
      expect(Parser.evaluate('0 or 1')).to.equal(true);
    });

    it('0 or 1 or 0', function() {
      expect(Parser.evaluate('0 or 1 or 0')).to.equal(true);
    });

    it('1 or 1 or 0', function() {
      expect(Parser.evaluate('1 or 1 or 0')).to.equal(true);
    });
  });

  describe('not operator', function () {
    it('not 1', function() {
      expect(Parser.evaluate('not 1')).to.equal(false);
    });

    it('not 0', function() {
      expect(Parser.evaluate('not 0')).to.equal(true);
    });

    it('not 4', function() {
      expect(Parser.evaluate('not 4')).to.equal(false);
    });

    it('1 and not 0', function() {
      expect(Parser.evaluate('1 and not 0')).to.equal(true);
    });

    it('not \'0\'', function() {
      expect(Parser.evaluate('not \'0\'')).to.equal(false);
    });

    it('not \'\'', function() {
      expect(Parser.evaluate('not \'\'')).to.equal(true);
    });
  });

  describe('conditional operator', function () {
    var parser = new Parser();

    it('1 ? 2 : 0 ? 3 : 4', function () {
      expect(parser.evaluate('1 ? 2 : 0 ? 3 : 4')).to.equal(2);
    });

    it('(1 ? 2 : 0) ? 3 : 4', function () {
      expect(parser.evaluate('(1 ? 2 : 0) ? 3 : 4')).to.equal(3);
    });

    it('0 ? 2 : 0 ? 3 : 4', function () {
      expect(parser.evaluate('0 ? 2 : 0 ? 3 : 4')).to.equal(4);
    });

    it('(0 ? 2 : 0) ? 3 : 4', function () {
      expect(parser.evaluate('0 ? 2 : 0 ? 3 : 4')).to.equal(4);
    });

    it('(0 ? 0 : 2) ? 3 : 4', function () {
      expect(parser.evaluate('(1 ? 2 : 0) ? 3 : 4')).to.equal(3);
    });

    it('min(1 ? 3 : 10, 0 ? 11 : 2)', function () {
      expect(parser.evaluate('min(1 ? 3 : 10, 0 ? 11 : 2)')).to.equal(2);
    });

    it('should only evaluate one branch', function () {
      expect(parser.evaluate('1 ? 42 : fail')).to.equal(42);
      expect(parser.evaluate('0 ? fail : 99')).to.equal(99);
    });
  });
});

describe('Functions', function () {
  describe('random()', function () {
    it('should return a number from zero to 1', function () {
      var expr = Parser.parse('random()');
      for (var i = 0; i < 1000; i++) {
        var x = expr.evaluate();
        expect(x).to.be.within(0, 1);
      }
    });

    it('should return different numbers', function () {
      var expr = Parser.parse('random()');
      var distinct = {};
      var sum = 0;
      for (var i = 0; i < 1000; i++) {
        var x = expr.evaluate();
        sum += x;
        distinct[x] = true;
      }
      // Technically, these could fail but that should be extremely rare
      expect(Object.keys(distinct).length).to.equal(1000);
      expect(sum / 1000).to.be.within(0.4, 0.6);
    });
  });

  describe('fac(n)', function () {
    it('should return n!', function () {
      var parser = new Parser();
      expect(parser.evaluate('fac(0)')).to.equal(1);
      expect(parser.evaluate('fac(1)')).to.equal(1);
      expect(parser.evaluate('fac(2)')).to.equal(2);
      expect(parser.evaluate('fac(2.5)')).to.equal(2);
      expect(parser.evaluate('fac(3)')).to.equal(6);
      expect(parser.evaluate('fac(4)')).to.equal(24);
      expect(parser.evaluate('fac(4.9)')).to.equal(24);
      expect(parser.evaluate('fac(5)')).to.equal(120);
      expect(parser.evaluate('fac(6)')).to.equal(720);
      expect(parser.evaluate('fac(7)')).to.equal(5040);
      expect(parser.evaluate('fac(21)')).to.equal(51090942171709440000);
    });
  });

  describe('min(a, b, ...)', function () {
    it('should return the smallest value', function () {
      var parser = new Parser();
      expect(parser.evaluate('min()')).to.equal(Infinity);
      expect(parser.evaluate('min(1)')).to.equal(1);
      expect(parser.evaluate('min(1,2)')).to.equal(1);
      expect(parser.evaluate('min(2,1)')).to.equal(1);
      expect(parser.evaluate('min(2,1,0)')).to.equal(0);
      expect(parser.evaluate('min(4,3,2,1,0,1,2,3,4,-5,6)')).to.equal(-5);
    });
  });

  describe('max(a, b, ...)', function () {
    it('should return the largest value', function () {
      var parser = new Parser();
      expect(parser.evaluate('max()')).to.equal(-Infinity);
      expect(parser.evaluate('max(1)')).to.equal(1);
      expect(parser.evaluate('max(1,2)')).to.equal(2);
      expect(parser.evaluate('max(2,1)')).to.equal(2);
      expect(parser.evaluate('max(2,1,0)')).to.equal(2);
      expect(parser.evaluate('max(4,3,2,1,0,1,2,3,4,-5,6)')).to.equal(6);
    });
  });

  describe('hypot(a, b, ...)', function () {
    it('should return the hypotenuse', function () {
      var parser = new Parser();
      expect(parser.evaluate('hypot()')).to.equal(0);
      expect(parser.evaluate('hypot(3)')).to.equal(3);
      expect(parser.evaluate('hypot(3,4)')).to.equal(5);
      expect(parser.evaluate('hypot(4,3)')).to.equal(5);
      expect(parser.evaluate('hypot(2,3,4)')).to.equal(5.385164807134504);
    });
  });

  describe('pow(x, y)', function () {
    it('should return x^y', function () {
      var parser = new Parser();
      expect(parser.evaluate('pow(3,2)')).to.equal(9);
      expect(parser.evaluate('pow(E,1)')).to.equal(Math.exp(1));
    });
  });

  describe('atan2(y, x)', function () {
    it('should return atan(y / x)', function () {
      var parser = new Parser();
      expect(parser.evaluate('atan2(90, 15)')).to.equal(1.4056476493802699);
      expect(parser.evaluate('atan2(15, 90)')).to.equal(0.16514867741462683);
      expect(parser.evaluate('atan2(0, 0)')).to.equal(0);
      expect(parser.evaluate('atan2(0, 1)')).to.equal(0);
      expect(parser.evaluate('atan2(1, 0)')).to.equal(Math.PI / 2);
      expect(parser.evaluate('atan2(0, 1/-inf)', { inf: Infinity })).to.equal(Math.PI);
      expect(parser.evaluate('atan2(1/-inf, 1/-inf)', { inf: Infinity })).to.equal(-Math.PI);
    });
  });

  describe('if(p, t, f)', function() {
    it('if(1, 1, 0)', function() {
      expect(Parser.evaluate('if(1, 1, 0)')).to.equal(1);
    });

    it('if(0, 1, 0)', function() {
      expect(Parser.evaluate('if(0, 1, 0)')).to.equal(0);
    });

    it('if(1==1 or 2==1, 39, 0)', function() {
      expect(Parser.evaluate('if(1==1 or 2==1, 39, 0)')).to.equal(39);
    });

    it('if(1==1 or 1==2, -4 + 8, 0)', function() {
      expect(Parser.evaluate('if(1==1 or 1==2, -4 + 8, 0)')).to.equal(4);
    });

    it('if(3 && 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)', function() {
      expect(Parser.evaluate('if(3 and 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)')).to.equal(2.4);
    });
  });
});

/* @todo
testToJSFunction: function() {
    var expr = Parser.parse('x * (y * atan(1))');
    var fn = expr.toJSFunction(['x', 'y']);
    assert.strictEqual(fn(2, 4), 6.283185307179586);
    fn = expr.toJSFunction(['y']);
    assert.throws(function() { return fn(4); });
}
sin(x)
cos(x)
tan(x)
asin(x)
acos(x)
atan(x)
sqrt(x)
log(x)
abs(x)
ceil(x)
floor(x)
round(x)
exp(x)
*/
