/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../dist/bundle').Parser;

describe('Operators', function () {
  describe('== operator', function () {
    it('2 == 3', function () {
      expect(Parser.evaluate('2 == 3')).to.equal(false);
    });

    it('3 * 1 == 2', function () {
      expect(Parser.evaluate('3 == 2')).to.not.equal(true);
    });

    it('3 == 3', function () {
      expect(Parser.evaluate('3 == 3')).to.equal(true);
    });

    it('\'3\' == 3', function () {
      expect(Parser.evaluate('\'3\' == 3')).to.equal(false);
    });

    it('\'string 1\' == \'string 2\'', function () {
      expect(Parser.evaluate('\'string 1\' == \'string 2\'')).to.equal(false);
    });

    it('\'string 1\' == "string 1"', function () {
      expect(Parser.evaluate('\'string 1\' == \'string 1\'')).to.equal(true);
    });

    it('\'3\' == \'3\'', function () {
      expect(Parser.evaluate('\'3\' == \'3\'')).to.equal(true);
    });
  });

  describe('!= operator', function () {
    it('2 != 3', function () {
      expect(Parser.evaluate('2 != 3')).to.equal(true);
    });

    it('3 != 2', function () {
      expect(Parser.evaluate('3 != 2')).to.not.equal(false);
    });

    it('3 != 3', function () {
      expect(Parser.evaluate('3 != 3')).to.equal(false);
    });

    it('\'3\' != 3', function () {
      expect(Parser.evaluate('\'3\' != 3')).to.equal(true);
    });

    it('\'3\' != \'3\'', function () {
      expect(Parser.evaluate('\'3\' != \'3\'')).to.equal(false);
    });

    it('\'string 1\' != \'string 1\'', function () {
      expect(Parser.evaluate('\'string 1\' != \'string 1\'')).to.equal(false);
    });

    it('\'string 1\' != \'string 2\'', function () {
      expect(Parser.evaluate('\'string 1\' != \'string 2\'')).to.equal(true);
    });
  });

  describe('> operator', function () {
    it('2 > 3', function () {
      expect(Parser.evaluate('2 > 3')).to.equal(false);
    });

    it('3 > 2', function () {
      expect(Parser.evaluate('3 > 2')).to.equal(true);
    });

    it('3 > 3', function () {
      expect(Parser.evaluate('3 > 3')).to.equal(false);
    });
  });

  describe('>= operator', function () {
    it('2 >= 3', function () {
      expect(Parser.evaluate('2 >= 3')).to.equal(false);
    });

    it('3 >= 2', function () {
      expect(Parser.evaluate('3 >= 2')).to.equal(true);
    });

    it('3 >= 3', function () {
      expect(Parser.evaluate('3 >= 3')).to.equal(true);
    });
  });

  describe('< operator', function () {
    it('2 < 3', function () {
      expect(Parser.evaluate('2 < 3')).to.equal(true);
    });

    it('3 < 2', function () {
      expect(Parser.evaluate('3 < 2')).to.equal(false);
    });

    it('3 < 3', function () {
      expect(Parser.evaluate('3 < 3')).to.equal(false);
    });
  });

  describe('<= operator', function () {
    it('2 <= 3', function () {
      expect(Parser.evaluate('2 <= 3')).to.equal(true);
    });

    it('3 <= 2', function () {
      expect(Parser.evaluate('3 <= 2')).to.equal(false);
    });

    it('3 <= 3', function () {
      expect(Parser.evaluate('3 <= 3')).to.equal(true);
    });
  });

  describe('and operator', function () {
    it('1 and 0', function () {
      expect(Parser.evaluate('1 and 0')).to.equal(false);
    });

    it('1 and 1', function () {
      expect(Parser.evaluate('1 and 1')).to.equal(true);
    });

    it('0 and 0', function () {
      expect(Parser.evaluate('0 and 0')).to.equal(false);
    });

    it('0 and 1', function () {
      expect(Parser.evaluate('0 and 1')).to.equal(false);
    });

    it('0 and 1 and 0', function () {
      expect(Parser.evaluate('0 and 1 and 0')).to.equal(false);
    });

    it('1 and 1 and 0', function () {
      expect(Parser.evaluate('1 and 1 and 0')).to.equal(false);
    });
  });

  describe('or operator', function () {
    it('1 or 0', function () {
      expect(Parser.evaluate('1 or 0')).to.equal(true);
    });

    it('1 or 1', function () {
      expect(Parser.evaluate('1 or 1')).to.equal(true);
    });

    it('0 or 0', function () {
      expect(Parser.evaluate('0 or 0')).to.equal(false);
    });

    it('0 or 1', function () {
      expect(Parser.evaluate('0 or 1')).to.equal(true);
    });

    it('0 or 1 or 0', function () {
      expect(Parser.evaluate('0 or 1 or 0')).to.equal(true);
    });

    it('1 or 1 or 0', function () {
      expect(Parser.evaluate('1 or 1 or 0')).to.equal(true);
    });
  });

  describe('not operator', function () {
    it('not 1', function () {
      expect(Parser.evaluate('not 1')).to.equal(false);
    });

    it('not 0', function () {
      expect(Parser.evaluate('not 0')).to.equal(true);
    });

    it('not 4', function () {
      expect(Parser.evaluate('not 4')).to.equal(false);
    });

    it('1 and not 0', function () {
      expect(Parser.evaluate('1 and not 0')).to.equal(true);
    });

    it('not \'0\'', function () {
      expect(Parser.evaluate('not \'0\'')).to.equal(false);
    });

    it('not \'\'', function () {
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

    it('a == 1 ? b == 2 ? 3 : 4 : 5', function () {
      expect(parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 1, b: 2 })).to.equal(3);
      expect(parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 1, b: 9 })).to.equal(4);
      expect(parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 9, b: 2 })).to.equal(5);
      expect(parser.evaluate('a == 1 ? b == 2 ? 3 : 4 : 5', { a: 9, b: 9 })).to.equal(5);
    });

    it('should only evaluate one branch', function () {
      expect(parser.evaluate('1 ? 42 : fail')).to.equal(42);
      expect(parser.evaluate('0 ? fail : 99')).to.equal(99);
    });
  });

  describe('length operator', function () {
    var parser = new Parser();

    it('should return 0 for empty strings', function () {
      expect(parser.evaluate('length ""')).to.equal(0);
    });

    it('should return the length of a string', function () {
      expect(parser.evaluate('length "a"')).to.equal(1);
      expect(parser.evaluate('length "as"')).to.equal(2);
      expect(parser.evaluate('length "asd"')).to.equal(3);
      expect(parser.evaluate('length "asdf"')).to.equal(4);
    });

    it('should convert numbers to strings', function () {
      expect(parser.evaluate('length 0')).to.equal(1);
      expect(parser.evaluate('length 12')).to.equal(2);
      expect(parser.evaluate('length 999')).to.equal(3);
      expect(parser.evaluate('length 1000')).to.equal(4);
      expect(parser.evaluate('length -1')).to.equal(2);
      expect(parser.evaluate('length -999')).to.equal(4);
    });
  });
});

/* @todo
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
