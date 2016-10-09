/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../dist/bundle').Parser;

describe('Parser', function () {
  describe('parse()', function () {
    var parser = new Parser();

    it('should skip comments', function () {
      expect(parser.evaluate('2/* comment */+/* another comment */3')).to.equal(5);
      expect(parser.evaluate('2/* comment *///* another comment */3')).to.equal(2 / 3);
      expect(parser.evaluate('/* comment at the beginning */2 + 3/* unterminated comment')).to.equal(5);
      expect(parser.evaluate('2 +/* comment\n with\n multiple\n lines */3')).to.equal(5);
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

    it('should fail on invalid numbers', function () {
      expect(function () { parser.parse('123..'); }).to.throw(Error);
      expect(function () { parser.parse('0..123'); }).to.throw(Error);
      expect(function () { parser.parse('0..'); }).to.throw(Error);
      expect(function () { parser.parse('.0.'); }).to.throw(Error);
      expect(function () { parser.parse('.'); }).to.throw(Error);
    });

    it('should fail on unknown characters', function () {
      expect(function () { parser.parse('1 + @'); }).to.throw(Error);
    });

    it('should fail with partial operators', function () {
      expect(function () { parser.parse('"a" | "b"'); }).to.throw(Error);
      expect(function () { parser.parse('2 = 2'); }).to.throw(Error);
      expect(function () { parser.parse('2 ! 3'); }).to.throw(Error);
      expect(function () { parser.parse('1 o 0'); }).to.throw(Error);
      expect(function () { parser.parse('1 an 2'); }).to.throw(Error);
      expect(function () { parser.parse('1 a 2'); }).to.throw(Error);
    });

    it('should parse strings', function () {
      expect(parser.evaluate('\'asdf\'')).to.equal('asdf');
      expect(parser.evaluate('"asdf"')).to.equal('asdf');
      expect(parser.evaluate('""')).to.equal('');
      expect(parser.evaluate('\'\'')).to.equal('');
      expect(parser.evaluate('"  "')).to.equal('  ');
      expect(parser.evaluate('"a\nb\tc"')).to.equal('a\nb\tc');
      expect(parser.evaluate('"Nested \'single quotes\'"')).to.equal('Nested \'single quotes\'');
      expect(parser.evaluate('\'Nested "double quotes"\'')).to.equal('Nested "double quotes"');
      expect(parser.evaluate('\'Single quotes \\\'inside\\\' single quotes\'')).to.equal('Single quotes \'inside\' single quotes');
      expect(parser.evaluate('"Double quotes \\"inside\\" double quotes"')).to.equal('Double quotes "inside" double quotes');
    });

    it('should parse operators that look like functions as function calls', function () {
      expect(parser.parse('sin 2^3').toString()).to.equal('(sin (2 ^ 3))');
      expect(parser.parse('sin(2)^3').toString()).to.equal('((sin 2) ^ 3)');
      expect(parser.parse('sin 2^3').evaluate()).to.equal(Math.sin(Math.pow(2, 3)));
      expect(parser.parse('sin(2)^3').evaluate()).to.equal(Math.pow(Math.sin(2), 3));
    });

    it('unary + and - should not be parsed as function calls', function () {
      expect(parser.parse('-2^3').toString()).to.equal('(-(2 ^ 3))');
      expect(parser.parse('-(2)^3').toString()).to.equal('(-(2 ^ 3))');
    });

    it('should treat ∙ and • as * operators', function () {
      expect(parser.parse('2 ∙ 3').toString()).to.equal('(2 * 3)');
      expect(parser.parse('4 • 5').toString()).to.equal('(4 * 5)');
    });
  });
});
