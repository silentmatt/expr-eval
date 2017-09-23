/* global describe, it */

'use strict';

var assert = require('assert');
var Parser = require('../dist/bundle').Parser;

describe('Functions', function () {
  describe('roundTo()', function () {
    // Simple cases
    it('should handle roundTo(663)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(663)'), 663);
    });
    it('should handle roundTo(663, 0)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(663, 0)'), 663);
    });
    it('should handle roundTo(662.79)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(662.79)'), 663);
    });
    it('should handle roundTo(662.79, 1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(662.79, 1)'), 662.8);
    });
    it('should handle roundTo(662.5, 1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(662.5, 1)'), 662.5);
    });

    // Negative values and exponents
    it('should handle roundTo(54.1, -1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(54.1, -1)'), 50);
    });
    it('should handle roundTo(-23.67, 1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(-23.67, 1)'), -23.7);
    });
    it('should handle roundTo(-23.67, 1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(-23.67, 3)'), -23.670);
    });

    // Big numbers
    it('should handle roundTo(3000000000000000000000000.1233, 1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(3000000000000000000000000.1233, 1)'), 3000000000000000000000000.1);
    });
    it('should handle roundTo(-3000000000000000000000000.1233, 1)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(-3000000000000000000000000.1233, 1)'), -3000000000000000000000000.1);
    });
    it('should handle roundTo(3.12345e14, -13)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(3.12345e14, -13)'), 3.1e14);
    });

    // Known problems in other parsers
    // https://stackoverflow.com/a/12830454
    it('should handle roundTo(1.005, 2)', function () {
      assert.strictEqual(Parser.evaluate('roundTo(1.005, 2)'), 1.01);
    });

    // Failure to parse (NaN)
    it('should make roundTo(-23, 1.2) NaN', function () {
      assert.ok(isNaN(Parser.evaluate('roundTo(-23, 1.2)')));
    });
    it('should make roundTo(-23, "blah") NaN', function () {
      assert.ok(isNaN(Parser.evaluate('roundTo(-23, "blah")')));
    });
  });

  describe('random()', function () {
    it('should return a number from zero to 1', function () {
      var expr = Parser.parse('random()');
      for (var i = 0; i < 1000; i++) {
        var x = expr.evaluate();
        assert.ok(x >= 0 && x < 1);
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
      assert.equal(Object.keys(distinct).length, 1000);
      assert.ok((sum / 1000 >= 0.4) && (sum / 1000 <= 0.6));
    });
  });

  describe('fac(n)', function () {
    it('should return n!', function () {
      var parser = new Parser();
      assert.strictEqual(parser.evaluate('fac(0)'), 1);
      assert.strictEqual(parser.evaluate('fac(1)'), 1);
      assert.strictEqual(parser.evaluate('fac(2)'), 2);
      assert.ok(Math.abs(parser.evaluate('fac(2.5)') - 3.323350970447843) <= 1e-14);
      assert.strictEqual(parser.evaluate('fac(3)'), 6);
      assert.strictEqual(parser.evaluate('fac(4)'), 24);
      assert.ok(Math.abs(parser.evaluate('fac(4.9)') - 101.27019121310335) <= 1e-12);
      assert.strictEqual(parser.evaluate('fac(5)'), 120);
      assert.strictEqual(parser.evaluate('fac(6)'), 720);
      assert.strictEqual(parser.evaluate('fac(7)'), 5040);
      assert.strictEqual(parser.evaluate('fac(21)'), 51090942171709440000);
    });
  });

  describe('min(a, b, ...)', function () {
    it('should return the smallest value', function () {
      var parser = new Parser();
      assert.strictEqual(parser.evaluate('min()'), Infinity);
      assert.strictEqual(parser.evaluate('min(1)'), 1);
      assert.strictEqual(parser.evaluate('min(1,2)'), 1);
      assert.strictEqual(parser.evaluate('min(2,1)'), 1);
      assert.strictEqual(parser.evaluate('min(2,1,0)'), 0);
      assert.strictEqual(parser.evaluate('min(4,3,2,1,0,1,2,3,4,-5,6)'), -5);
    });
  });

  describe('max(a, b, ...)', function () {
    it('should return the largest value', function () {
      var parser = new Parser();
      assert.strictEqual(parser.evaluate('max()'), -Infinity);
      assert.strictEqual(parser.evaluate('max(1)'), 1);
      assert.strictEqual(parser.evaluate('max(1,2)'), 2);
      assert.strictEqual(parser.evaluate('max(2,1)'), 2);
      assert.strictEqual(parser.evaluate('max(2,1,0)'), 2);
      assert.strictEqual(parser.evaluate('max(4,3,2,1,0,1,2,3,4,-5,6)'), 6);
    });
  });

  describe('hypot(a, b, ...)', function () {
    var parser = new Parser();

    it('should return the hypotenuse', function () {
      assert.strictEqual(parser.evaluate('hypot()'), 0);
      assert.strictEqual(parser.evaluate('hypot(3)'), 3);
      assert.strictEqual(parser.evaluate('hypot(3,4)'), 5);
      assert.strictEqual(parser.evaluate('hypot(4,3)'), 5);
      assert.strictEqual(parser.evaluate('hypot(2,3,4)'), 5.385164807134504);
      assert.strictEqual(parser.evaluate('hypot(1 / 0)'), Infinity);
      assert.strictEqual(parser.evaluate('hypot(-1 / 0)'), Infinity);
      assert.strictEqual(parser.evaluate('hypot(1, 2, 1 / 0)'), Infinity);
    });

    it('should avoid overflowing', function () {
      assert.strictEqual(parser.evaluate('hypot(10^200, 10^200)'), 1.4142135623730959e+200);
      assert.strictEqual(parser.evaluate('hypot(10^-200, 10^-200)'), 1.4142135623730944e-200);
      assert.strictEqual(parser.evaluate('hypot(10^100, 11^100, 12^100, 13^100)'), 2.4793352492856554e+111);
      assert.strictEqual(parser.evaluate('hypot(x)', { x: Number.MAX_VALUE }), Number.MAX_VALUE);
      assert.strictEqual(parser.evaluate('hypot(x, 0)', { x: Number.MAX_VALUE }), Number.MAX_VALUE);
    });
  });

  describe('pow(x, y)', function () {
    it('should return x^y', function () {
      var parser = new Parser();
      assert.strictEqual(parser.evaluate('pow(3,2)'), 9);
      assert.strictEqual(parser.evaluate('pow(E,1)'), Math.exp(1));
    });
  });

  describe('atan2(y, x)', function () {
    it('should return atan(y / x)', function () {
      var parser = new Parser();
      assert.strictEqual(parser.evaluate('atan2(90, 15)'), 1.4056476493802699);
      assert.strictEqual(parser.evaluate('atan2(15, 90)'), 0.16514867741462683);
      assert.strictEqual(parser.evaluate('atan2(0, 0)'), 0);
      assert.strictEqual(parser.evaluate('atan2(0, 1)'), 0);
      assert.strictEqual(parser.evaluate('atan2(1, 0)'), Math.PI / 2);
      assert.strictEqual(parser.evaluate('atan2(0, 1/-inf)', { inf: Infinity }), Math.PI);
      assert.strictEqual(parser.evaluate('atan2(1/-inf, 1/-inf)', { inf: Infinity }), -Math.PI);
    });
  });

  describe('if(p, t, f)', function () {
    it('if(1, 1, 0)', function () {
      assert.strictEqual(Parser.evaluate('if(1, 1, 0)'), 1);
    });

    it('if(0, 1, 0)', function () {
      assert.strictEqual(Parser.evaluate('if(0, 1, 0)'), 0);
    });

    it('if(1==1 or 2==1, 39, 0)', function () {
      assert.strictEqual(Parser.evaluate('if(1==1 or 2==1, 39, 0)'), 39);
    });

    it('if(1==1 or 1==2, -4 + 8, 0)', function () {
      assert.strictEqual(Parser.evaluate('if(1==1 or 1==2, -4 + 8, 0)'), 4);
    });

    it('if(3 && 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)', function () {
      assert.strictEqual(Parser.evaluate('if(3 and 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)'), 2.4);
    });
  });

  describe('gamma(x)', function () {
    var parser = new Parser();

    it('returns exact answer for integers', function () {
      assert.strictEqual(parser.evaluate('gamma(0)'), Infinity);
      assert.strictEqual(parser.evaluate('gamma(1)'), 1);
      assert.strictEqual(parser.evaluate('gamma(2)'), 1);
      assert.strictEqual(parser.evaluate('gamma(3)'), 2);
      assert.strictEqual(parser.evaluate('gamma(4)'), 6);
      assert.strictEqual(parser.evaluate('gamma(5)'), 24);
      assert.strictEqual(parser.evaluate('gamma(6)'), 120);
      assert.strictEqual(parser.evaluate('gamma(7)'), 720);
      assert.strictEqual(parser.evaluate('gamma(8)'), 5040);
      assert.strictEqual(parser.evaluate('gamma(9)'), 40320);
      assert.strictEqual(parser.evaluate('gamma(10)'), 362880);
      assert.strictEqual(parser.evaluate('gamma(25)'), 6.204484017332394e+23);
      assert.strictEqual(parser.evaluate('gamma(50)'), 6.082818640342679e+62);
      assert.strictEqual(parser.evaluate('gamma(100)'), 9.332621544394415e+155);
      assert.strictEqual(parser.evaluate('gamma(170)'), 4.2690680090047056e+304);
      assert.strictEqual(parser.evaluate('gamma(171)'), 7.257415615308004e+306);
      assert.strictEqual(parser.evaluate('gamma(172)'), Infinity);
    });

    it('returns approximation for fractions', function () {
      var delta = 1e-14;
      assert.strictEqual(parser.evaluate('gamma(-10)'), Infinity);
      assert.ok(Math.abs(parser.evaluate('gamma(-2.5)') - -0.9453087204829419) <= delta);
      assert.strictEqual(parser.evaluate('gamma(-2)'), Infinity);
      assert.ok(Math.abs(parser.evaluate('gamma(-1.5)') - 2.36327180120735) <= delta);
      assert.strictEqual(parser.evaluate('gamma(-1)'), Infinity);
      assert.ok(Math.abs(parser.evaluate('gamma(-0.75)') - -4.834146544295878) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(-0.5)') - -3.54490770181103) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(-0.25)') - -4.901666809860711) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(0.25)') - 3.62560990822191) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(0.5)') - 1.77245385090552) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(0.75)') - 1.22541670246518) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(1.5)') - 0.886226925452758) <= delta);
      assert.ok(Math.abs(parser.evaluate('gamma(84.9)') - 2.12678581783475e126) <= 1e113);
      assert.ok(Math.abs(parser.evaluate('gamma(85.1)') - 5.16530039995559e126) <= 1e114);
      assert.ok(Math.abs(parser.evaluate('gamma(98.6)') - 1.5043414559976e153) <= 1e140);
      assert.strictEqual(parser.evaluate('gamma(171.35)'), Infinity);
      assert.strictEqual(parser.evaluate('gamma(172)'), Infinity);
      assert.strictEqual(parser.evaluate('gamma(172.5)'), Infinity);
    });

    it('handles NaN and infinity correctly', function () {
      assert.ok(isNaN(parser.evaluate('gamma(0/0)')));
      assert.ok(isNaN(parser.evaluate('gamma()')));
      assert.strictEqual(parser.evaluate('gamma(1/0)'), Infinity);
      assert.ok(isNaN(parser.evaluate('gamma(-1/0)')));
    });
  });
});
