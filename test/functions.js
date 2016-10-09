/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../dist/bundle').Parser;

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
    var parser = new Parser();

    it('should return the hypotenuse', function () {
      expect(parser.evaluate('hypot()')).to.equal(0);
      expect(parser.evaluate('hypot(3)')).to.equal(3);
      expect(parser.evaluate('hypot(3,4)')).to.equal(5);
      expect(parser.evaluate('hypot(4,3)')).to.equal(5);
      expect(parser.evaluate('hypot(2,3,4)')).to.equal(5.385164807134504);
      expect(parser.evaluate('hypot(1 / 0)')).to.equal(Infinity);
      expect(parser.evaluate('hypot(-1 / 0)')).to.equal(Infinity);
      expect(parser.evaluate('hypot(1, 2, 1 / 0)')).to.equal(Infinity);
    });

    it('should avoid overflowing', function () {
      expect(parser.evaluate('hypot(10^200, 10^200)')).to.equal(1.4142135623730959e+200);
      expect(parser.evaluate('hypot(10^-200, 10^-200)')).to.equal(1.4142135623730944e-200);
      expect(parser.evaluate('hypot(10^100, 11^100, 12^100, 13^100)')).to.equal(2.4793352492856554e+111);
      expect(parser.evaluate('hypot(x)', { x: Number.MAX_VALUE })).to.equal(Number.MAX_VALUE);
      expect(parser.evaluate('hypot(x, 0)', { x: Number.MAX_VALUE })).to.equal(Number.MAX_VALUE);
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

  describe('if(p, t, f)', function () {
    it('if(1, 1, 0)', function () {
      expect(Parser.evaluate('if(1, 1, 0)')).to.equal(1);
    });

    it('if(0, 1, 0)', function () {
      expect(Parser.evaluate('if(0, 1, 0)')).to.equal(0);
    });

    it('if(1==1 or 2==1, 39, 0)', function () {
      expect(Parser.evaluate('if(1==1 or 2==1, 39, 0)')).to.equal(39);
    });

    it('if(1==1 or 1==2, -4 + 8, 0)', function () {
      expect(Parser.evaluate('if(1==1 or 1==2, -4 + 8, 0)')).to.equal(4);
    });

    it('if(3 && 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)', function () {
      expect(Parser.evaluate('if(3 and 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)')).to.equal(2.4);
    });
  });
});
