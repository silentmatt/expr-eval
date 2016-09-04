/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../parser').Parser;

describe('Parser', function() {
  describe('#parse()', function () {
    it('should skip comments', function () {
      expect(Parser.evaluate('2/* comment */+/* another comment */3')).to.equal(5);
      expect(Parser.evaluate('2/* comment *///* another comment */3')).to.equal(2 / 3);
    });

    it('should ignore whitespace', function () {
      expect(Parser.evaluate(' 3\r + \n \t 4 ')).to.equal(7);
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
  });

  describe('#substitute()', function() {
    var expr = Parser.parse('2 * x + 1');
    var expr2 = expr.substitute('x', '4 * x');
    it('((2*(4*x))+1)', function() {
      expect(expr2.evaluate({x: 3})).to.equal(25);
    });

    var expr3 = Parser.parse('2 * x.y.z + 1');
    var expr4 = expr3.substitute('x.y.z', '4 * x');
    it('((2*(4*x))+1)', function() {
      expect(expr4.evaluate({ x: 3 })).to.equal(25);
    });

    var expr5 = Parser.parse('2 * x.y.z + 1');
    var expr6 = expr5.substitute('x.y.z', '4 * x.y.z');
    it('((2*(4*x.y.z))+1)', function() {
      expect(expr6.evaluate({ x: { y: { z: 3 } } })).to.equal(25);
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
  });

  describe('#variables()', function() {
    var expr = Parser.parse('x * (y * atan(1)) + z.y.x');
    it('["x", "y", "z.y.x"]', function() {
      expect(expr.variables()).to.have.same.members(['x', 'y', 'z.y.x']);
    });

    it('["x", "z.y.x"]', function() {
      expect(expr.simplify({y: 4}).variables()).to.have.same.members(['x', 'z.y.x']);
    });

    it('["x"]', function() {
      expect(expr.simplify({ y: 4, z: { y: { x: 5 } } }).variables()).to.have.same.members(['x']);
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

  describe('#condition()', function() {
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
