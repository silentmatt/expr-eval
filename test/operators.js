/* global describe, it */

'use strict';

var expect = require('chai').expect;
var Parser = require('../dist/bundle').Parser;

describe('Operators', function () {
  var parser = new Parser();

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

    it('not true', function () {
      expect(Parser.evaluate('not true')).to.equal(false);
    });

    it('not 0', function () {
      expect(Parser.evaluate('not 0')).to.equal(true);
    });

    it('not false', function () {
      expect(Parser.evaluate('not false')).to.equal(true);
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

  describe('% operator', function () {
    it('has the correct precedence', function () {
      expect(parser.parse('a + b % c ^ d').toString()).to.equal('(a + (b % (c ^ d)))');
      expect(parser.parse('a + b * c % d').toString()).to.equal('(a + ((b * c) % d))');
      expect(parser.parse('a + b % c * d').toString()).to.equal('(a + ((b % c) * d))');
      expect(parser.parse('a + b % c % d').toString()).to.equal('(a + ((b % c) % d))');
    });

    it('returns the correct value', function () {
      expect(parser.evaluate('0 % 5')).to.equal(0);
      expect(parser.evaluate('1 % 5')).to.equal(1);
      expect(parser.evaluate('2 % 5')).to.equal(2);
      expect(parser.evaluate('3 % 5')).to.equal(3);
      expect(parser.evaluate('4 % 5')).to.equal(4);
      expect(parser.evaluate('5 % 5')).to.equal(0);
      expect(parser.evaluate('6 % 5')).to.equal(1);
      expect(parser.evaluate('-2 % 5')).to.equal(-2);
      expect(parser.evaluate('-6 % 5')).to.equal(-1);
    });

    it('returns NaN for 0 divisor', function () {
      expect(parser.evaluate('0 % 0')).to.be.NaN;
      expect(parser.evaluate('1 % 0')).to.be.NaN;
      expect(parser.evaluate('-1 % 0')).to.be.NaN;
    });
  });

  describe('sin(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('sin 0')).to.equal(0);
      expect(parser.evaluate('sin 0.5')).to.be.closeTo(0.479425538604203, delta);
      expect(parser.evaluate('sin 1')).to.be.closeTo(0.8414709848078965, delta);
      expect(parser.evaluate('sin -1')).to.be.closeTo(-0.8414709848078965, delta);
      expect(parser.evaluate('sin(PI/4)')).to.be.closeTo(0.7071067811865475, delta);
      expect(parser.evaluate('sin(PI/2)')).to.be.closeTo(1, delta);
      expect(parser.evaluate('sin(3*PI/4)')).to.be.closeTo(0.7071067811865475, delta);
      expect(parser.evaluate('sin PI')).to.be.closeTo(0, delta);
      expect(parser.evaluate('sin(2*PI)')).to.be.closeTo(0, delta);
      expect(parser.evaluate('sin(-PI)')).to.be.closeTo(0, delta);
      expect(parser.evaluate('sin(3*PI/2)')).to.be.closeTo(-1, delta);
      expect(parser.evaluate('sin 15')).to.be.closeTo(0.6502878401571168, delta);
    });
  });

  describe('cos(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('cos 0')).to.equal(1);
      expect(parser.evaluate('cos 0.5')).to.be.closeTo(0.8775825618903728, delta);
      expect(parser.evaluate('cos 1')).to.be.closeTo(0.5403023058681398, delta);
      expect(parser.evaluate('cos -1')).to.be.closeTo(0.5403023058681398, delta);
      expect(parser.evaluate('cos(PI/4)')).to.be.closeTo(0.7071067811865475, delta);
      expect(parser.evaluate('cos(PI/2)')).to.be.closeTo(0, delta);
      expect(parser.evaluate('cos(3*PI/4)')).to.be.closeTo(-0.7071067811865475, delta);
      expect(parser.evaluate('cos PI')).to.be.closeTo(-1, delta);
      expect(parser.evaluate('cos(2*PI)')).to.be.closeTo(1, delta);
      expect(parser.evaluate('cos -PI')).to.be.closeTo(-1, delta);
      expect(parser.evaluate('cos(3*PI/2)')).to.be.closeTo(0, delta);
      expect(parser.evaluate('cos 15')).to.be.closeTo(-0.7596879128588213, delta);
    });
  });

  describe('tan(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('tan 0')).to.equal(0);
      expect(parser.evaluate('tan 0.5')).to.be.closeTo(0.5463024898437905, delta);
      expect(parser.evaluate('tan 1')).to.be.closeTo(1.5574077246549023, delta);
      expect(parser.evaluate('tan -1')).to.be.closeTo(-1.5574077246549023, delta);
      expect(parser.evaluate('tan(PI/4)')).to.be.closeTo(1, delta);
      expect(parser.evaluate('tan(PI/2)')).to.above(1e16);
      expect(parser.evaluate('tan(3*PI/4)')).to.be.closeTo(-1, delta);
      expect(parser.evaluate('tan PI')).to.be.closeTo(0, delta);
      expect(parser.evaluate('tan(2*PI)')).to.be.closeTo(0, delta);
      expect(parser.evaluate('tan -PI')).to.be.closeTo(0, delta);
      expect(parser.evaluate('tan(3*PI/2)')).to.above(1e15);
      expect(parser.evaluate('tan 15')).to.be.closeTo(-0.8559934009085188, delta);
    });
  });

  describe('asin(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('asin 0')).to.equal(0);
      expect(parser.evaluate('asin 0.5')).to.be.closeTo(0.5235987755982989, delta);
      expect(parser.evaluate('asin -0.5')).to.be.closeTo(-0.5235987755982989, delta);
      expect(parser.evaluate('asin 1')).to.be.closeTo(Math.PI / 2, delta);
      expect(parser.evaluate('asin -1')).to.be.closeTo(-Math.PI / 2, delta);
      expect(parser.evaluate('asin(PI/4)')).to.be.closeTo(0.9033391107665127, delta);
      expect(parser.evaluate('asin 1.1')).to.be.NaN;
      expect(parser.evaluate('asin -1.1')).to.be.NaN;
    });
  });

  describe('acos(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('acos 0')).to.equal(Math.PI / 2);
      expect(parser.evaluate('acos 0.5')).to.be.closeTo(1.0471975511965979, delta);
      expect(parser.evaluate('acos -0.5')).to.be.closeTo(2.0943951023931957, delta);
      expect(parser.evaluate('acos 1')).to.be.closeTo(0, delta);
      expect(parser.evaluate('acos -1')).to.be.closeTo(Math.PI, delta);
      expect(parser.evaluate('acos(PI/4)')).to.be.closeTo(0.6674572160283838, delta);
      expect(parser.evaluate('acos 1.1')).to.be.NaN;
      expect(parser.evaluate('acos -1.1')).to.be.NaN;
    });
  });

  describe('atan(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('atan 0')).to.equal(0);
      expect(parser.evaluate('atan 0.5')).to.be.closeTo(0.4636476090008061, delta);
      expect(parser.evaluate('atan -0.5')).to.be.closeTo(-0.4636476090008061, delta);
      expect(parser.evaluate('atan 1')).to.be.closeTo(Math.PI / 4, delta);
      expect(parser.evaluate('atan -1')).to.be.closeTo(-Math.PI / 4, delta);
      expect(parser.evaluate('atan(PI/4)')).to.be.closeTo(0.6657737500283538, delta);
      expect(parser.evaluate('atan PI')).to.be.closeTo(1.2626272556789118, delta);
      expect(parser.evaluate('atan -PI')).to.be.closeTo(-1.2626272556789118, delta);
      expect(parser.evaluate('atan(1/0)')).to.equal(Math.PI / 2);
      expect(parser.evaluate('atan(-1/0)')).to.equal(-Math.PI / 2);
      expect(parser.evaluate('atan 10')).to.be.closeTo(1.4711276743037347, delta);
      expect(parser.evaluate('atan 100')).to.be.closeTo(1.5607966601082315, delta);
      expect(parser.evaluate('atan 1000')).to.be.closeTo(1.5697963271282298, delta);
      expect(parser.evaluate('atan 2000')).to.be.closeTo(1.5702963268365633, delta);
    });
  });

  describe('sinh(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('sinh 0')).to.equal(0);
      expect(parser.evaluate('sinh 0.5')).to.be.closeTo(0.5210953054937474, delta);
      expect(parser.evaluate('sinh -0.5')).to.be.closeTo(-0.5210953054937474, delta);
      expect(parser.evaluate('sinh 1')).to.be.closeTo(1.1752011936438014, delta);
      expect(parser.evaluate('sinh -1')).to.be.closeTo(-1.1752011936438014, delta);
      expect(parser.evaluate('sinh(PI/4)')).to.be.closeTo(0.8686709614860095, delta);
      expect(parser.evaluate('sinh(PI/2)')).to.be.closeTo(2.3012989023072947, delta);
      expect(parser.evaluate('sinh(3*PI/4)')).to.be.closeTo(5.227971924677803, delta);
      expect(parser.evaluate('sinh PI')).to.be.closeTo(11.548739357257748, delta * 10);
      expect(parser.evaluate('sinh(2*PI)')).to.be.closeTo(267.74489404101644, delta * 1000);
      expect(parser.evaluate('sinh -PI')).to.be.closeTo(-11.548739357257748, delta * 10);
      expect(parser.evaluate('sinh(3*PI/2)')).to.be.closeTo(55.65439759941754, delta * 100);
      expect(parser.evaluate('sinh 15')).to.be.closeTo(1634508.6862359024, delta * 1000000);
      expect(parser.evaluate('sinh(1 / 0)')).to.equal(Infinity);
      expect(parser.evaluate('sinh(-1 / 0)')).to.equal(-Infinity);
    });
  });

  describe('cosh(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('cosh 0')).to.equal(1);
      expect(parser.evaluate('cosh 0.5')).to.be.closeTo(1.1276259652063807, delta);
      expect(parser.evaluate('cosh -0.5')).to.be.closeTo(1.1276259652063807, delta);
      expect(parser.evaluate('cosh 1')).to.be.closeTo(1.5430806348152437, delta);
      expect(parser.evaluate('cosh -1')).to.be.closeTo(1.5430806348152437, delta);
      expect(parser.evaluate('cosh(PI/4)')).to.be.closeTo(1.324609089252006, delta);
      expect(parser.evaluate('cosh(PI/2)')).to.be.closeTo(2.509178478658057, delta);
      expect(parser.evaluate('cosh(3*PI/4)')).to.be.closeTo(5.3227521495199595, delta);
      expect(parser.evaluate('cosh PI')).to.be.closeTo(11.591953275521522, delta);
      expect(parser.evaluate('cosh(2*PI)')).to.be.closeTo(267.7467614837483, delta);
      expect(parser.evaluate('cosh -PI')).to.be.closeTo(11.591953275521522, delta);
      expect(parser.evaluate('cosh(3*PI/2)')).to.be.closeTo(55.663380890438695, delta);
      expect(parser.evaluate('cosh 15')).to.be.closeTo(1634508.6862362078, delta);
      expect(parser.evaluate('cosh(1 / 0)')).to.equal(Infinity);
      expect(parser.evaluate('cosh(-1 / 0)')).to.equal(Infinity);
    });
  });

  describe('tanh(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('tanh 0')).to.equal(0);
      expect(parser.evaluate('tanh 0.00001')).to.be.closeTo(0.000009999999999621023, delta);
      expect(parser.evaluate('tanh 0.25')).to.be.closeTo(0.24491866240370924, delta);
      expect(parser.evaluate('tanh -0.25')).to.be.closeTo(-0.24491866240370924, delta);
      expect(parser.evaluate('tanh 0.5')).to.be.closeTo(0.4621171572600098, delta);
      expect(parser.evaluate('tanh -0.5')).to.be.closeTo(-0.4621171572600098, delta);
      expect(parser.evaluate('tanh 1')).to.be.closeTo(0.7615941559557649, delta);
      expect(parser.evaluate('tanh -1')).to.be.closeTo(-0.7615941559557649, delta);
      expect(parser.evaluate('tanh(PI/4)')).to.be.closeTo(0.6557942026326725, delta);
      expect(parser.evaluate('tanh(PI/2)')).to.be.closeTo(0.9171523356672744, delta);
      expect(parser.evaluate('tanh PI')).to.be.closeTo(0.9962720762207501, delta);
      expect(parser.evaluate('tanh -PI')).to.be.closeTo(-0.9962720762207501, delta);
      expect(parser.evaluate('tanh(2*PI)')).to.be.closeTo(0.9999930253396105, delta);
      expect(parser.evaluate('tanh 15')).to.be.closeTo(0.9999999999998128, delta);
      expect(parser.evaluate('tanh -15')).to.be.closeTo(-0.9999999999998128, delta);
      expect(parser.evaluate('tanh 16')).to.be.closeTo(0.9999999999999748, delta);
      expect(parser.evaluate('tanh 17')).to.be.closeTo(0.9999999999999966, delta);
      expect(parser.evaluate('tanh 20')).to.equal(1);
      expect(parser.evaluate('tanh -20')).to.equal(-1);
      expect(parser.evaluate('tanh 100')).to.equal(1);
      expect(parser.evaluate('tanh -100')).to.equal(-1);
      expect(parser.evaluate('tanh(1 / 0)')).to.equal(1);
      expect(parser.evaluate('tanh(-1 / 0)')).to.equal(-1);
    });
  });

  describe('asinh(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('asinh 0')).to.equal(0);
      expect(parser.evaluate('asinh 0.5')).to.be.closeTo(0.48121182505960347, delta);
      expect(parser.evaluate('asinh -0.5')).to.be.closeTo(-0.48121182505960347, delta);
      expect(parser.evaluate('asinh 1')).to.be.closeTo(0.881373587019543, delta);
      expect(parser.evaluate('asinh -1')).to.be.closeTo(-0.881373587019543, delta);
      expect(parser.evaluate('asinh(PI/4)')).to.be.closeTo(0.7212254887267799, delta);
      expect(parser.evaluate('asinh(PI/2)')).to.be.closeTo(1.233403117511217, delta);
      expect(parser.evaluate('asinh(3*PI/4)')).to.be.closeTo(1.5924573728585427, delta);
      expect(parser.evaluate('asinh PI')).to.be.closeTo(1.8622957433108482, delta);
      expect(parser.evaluate('asinh(2*PI)')).to.be.closeTo(2.537297501373361, delta);
      expect(parser.evaluate('asinh -PI')).to.be.closeTo(-1.8622957433108482, delta);
      expect(parser.evaluate('asinh(3*PI/2)')).to.be.closeTo(2.2544145929927146, delta);
      expect(parser.evaluate('asinh 15')).to.be.closeTo(3.4023066454805946, delta);
      expect(parser.evaluate('asinh 100')).to.be.closeTo(5.298342365610589, delta);
      expect(parser.evaluate('asinh 1000')).to.be.closeTo(7.600902709541988, delta);
      expect(parser.evaluate('asinh(1 / 0)')).to.equal(Infinity);
      expect(parser.evaluate('asinh(-1 / 0)')).to.equal(-Infinity);
    });
  });

  describe('acosh(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('acosh 0')).to.be.NaN;
      expect(parser.evaluate('acosh 0.5')).to.be.NaN;
      expect(parser.evaluate('acosh -0.5')).to.be.NaN;
      expect(parser.evaluate('acosh -1')).to.be.NaN;
      expect(parser.evaluate('acosh 1')).to.equal(0);
      expect(parser.evaluate('acosh(PI/2)')).to.be.closeTo(1.0232274785475506, delta);
      expect(parser.evaluate('acosh(3*PI/4)')).to.be.closeTo(1.5017757950235857, delta);
      expect(parser.evaluate('acosh PI')).to.be.closeTo(1.8115262724608532, delta);
      expect(parser.evaluate('acosh(2*PI)')).to.be.closeTo(2.524630659933467, delta);
      expect(parser.evaluate('acosh(3*PI/2)')).to.be.closeTo(2.2318892530580827, delta);
      expect(parser.evaluate('acosh 15')).to.be.closeTo(3.4000844141133393, delta);
      expect(parser.evaluate('acosh 100')).to.be.closeTo(5.298292365610485, delta);
      expect(parser.evaluate('acosh 1000')).to.be.closeTo(7.600902209541989, delta);
      expect(parser.evaluate('acosh(1 / 0)')).to.equal(Infinity);
      expect(parser.evaluate('acosh(-1 / 0)')).to.be.NaN;
    });
  });

  describe('atanh(x)', function () {
    it('returns the correct value', function () {
      var delta = 1e-15;
      expect(parser.evaluate('atanh 0')).to.equal(0);
      expect(parser.evaluate('atanh 0.25')).to.be.closeTo(0.25541281188299536, delta);
      expect(parser.evaluate('atanh -0.25')).to.be.closeTo(-0.25541281188299536, delta);
      expect(parser.evaluate('atanh 0.5')).to.be.closeTo(0.5493061443340549, delta);
      expect(parser.evaluate('atanh -0.5')).to.be.closeTo(-0.5493061443340549, delta);
      expect(parser.evaluate('atanh 1')).to.equal(Infinity);
      expect(parser.evaluate('atanh -1')).to.equal(-Infinity);
      expect(parser.evaluate('atanh 1.001')).to.be.NaN;
      expect(parser.evaluate('atanh -1.001')).to.be.NaN;
      expect(parser.evaluate('atanh(1 / 0)')).to.be.NaN;
      expect(parser.evaluate('atanh(-1 / 0)')).to.be.NaN;
    });
  });

  describe('sqrt(x)', function () {
    it('returns the square root of its argument', function () {
      var delta = 1e-15;
      expect(parser.evaluate('sqrt 0')).to.equal(0);
      expect(parser.evaluate('sqrt 0.5')).to.be.closeTo(0.7071067811865476, delta);
      expect(parser.evaluate('sqrt 1')).to.equal(1);
      expect(parser.evaluate('sqrt 2')).to.be.closeTo(1.4142135623730951, delta);
      expect(parser.evaluate('sqrt 4')).to.equal(2);
      expect(parser.evaluate('sqrt 8')).to.be.closeTo(2.8284271247461903, 0);
      expect(parser.evaluate('sqrt 16')).to.equal(4);
      expect(parser.evaluate('sqrt 81')).to.equal(9);
      expect(parser.evaluate('sqrt 100')).to.equal(10);
      expect(parser.evaluate('sqrt 1000')).to.equal(31.622776601683793);
      expect(parser.evaluate('sqrt -1')).to.be.NaN;
    });
  });

  describe('ln/log operator', function () {
    it('returns the natural logarithm of its argument', function () {
      var delta = 1e-15;
      expect(Parser.evaluate('ln 0')).to.equal(-Infinity);
      expect(Parser.evaluate('log 0')).to.equal(-Infinity);
      expect(Parser.evaluate('ln 0.5')).to.be.closeTo(-0.6931471805599453, delta);
      expect(Parser.evaluate('log 0.5')).to.be.closeTo(-0.6931471805599453, delta);
      expect(Parser.evaluate('ln 1')).to.equal(0);
      expect(Parser.evaluate('log 1')).to.equal(0);
      expect(Parser.evaluate('ln 2')).to.be.closeTo(0.6931471805599453, delta);
      expect(Parser.evaluate('log 2')).to.be.closeTo(0.6931471805599453, delta);
      expect(Parser.evaluate('ln E')).to.equal(1);
      expect(Parser.evaluate('log E')).to.equal(1);
      expect(Parser.evaluate('ln PI')).to.be.closeTo(1.1447298858494002, delta);
      expect(Parser.evaluate('log PI')).to.be.closeTo(1.1447298858494002, delta);
      expect(Parser.evaluate('ln 10')).to.be.closeTo(2.302585092994046, delta);
      expect(Parser.evaluate('log 10')).to.be.closeTo(2.302585092994046, delta);
      expect(Parser.evaluate('ln 100')).to.be.closeTo(4.605170185988092, delta);
      expect(Parser.evaluate('ln -1')).to.be.NaN;
      expect(Parser.evaluate('log -1')).to.be.NaN;
    });
  });

  describe('log10 operator', function () {
    it('returns the base-10 logarithm of its argument', function () {
      var delta = 1e-15;
      expect(Parser.evaluate('log10 0')).to.equal(-Infinity);
      expect(Parser.evaluate('lg 0')).to.equal(-Infinity);
      expect(Parser.evaluate('log10 0.5')).to.be.closeTo(-0.3010299956639812, delta);
      expect(Parser.evaluate('lg 0.5')).to.be.closeTo(-0.3010299956639812, delta);
      expect(Parser.evaluate('log10 1')).to.equal(0);
      expect(Parser.evaluate('lg 1')).to.equal(0);
      expect(Parser.evaluate('log10 2')).to.be.closeTo(0.3010299956639812, delta);
      expect(Parser.evaluate('lg 2')).to.be.closeTo(0.3010299956639812, delta);
      expect(Parser.evaluate('log10 E')).to.be.closeTo(0.4342944819032518, delta);
      expect(Parser.evaluate('lg E')).to.be.closeTo(0.4342944819032518, delta);
      expect(Parser.evaluate('log10 PI')).to.be.closeTo(0.49714987269413385, delta);
      expect(Parser.evaluate('lg PI')).to.be.closeTo(0.49714987269413385, delta);
      expect(Parser.evaluate('log10 10')).to.equal(1);
      expect(Parser.evaluate('lg 10')).to.equal(1);
      expect(Parser.evaluate('log10 100')).to.equal(2);
      expect(Parser.evaluate('lg 100')).to.equal(2);
      expect(Parser.evaluate('log10 1000')).to.equal(3);
      expect(Parser.evaluate('lg 1000')).to.equal(3);
      expect(Parser.evaluate('log10 10000000000')).to.equal(10);
      expect(Parser.evaluate('lg 10000000000')).to.equal(10);
      expect(Parser.evaluate('log10 -1')).to.be.NaN;
      expect(Parser.evaluate('lg -1')).to.be.NaN;
    });
  });

  describe('abs(x)', function () {
    it('returns the correct value', function () {
      expect(parser.evaluate('abs 0')).to.equal(0);
      expect(parser.evaluate('abs 0.5')).to.equal(0.5);
      expect(parser.evaluate('abs -0.5')).to.equal(0.5);
      expect(parser.evaluate('abs 1')).to.equal(1);
      expect(parser.evaluate('abs -1')).to.equal(1);
      expect(parser.evaluate('abs 2')).to.equal(2);
      expect(parser.evaluate('abs -2')).to.equal(2);
      expect(parser.evaluate('abs(-1/0)')).to.equal(Infinity);
    });
  });

  describe('ceil(x)', function () {
    it('rounds up to the nearest integer', function () {
      expect(parser.evaluate('ceil 0')).to.equal(0);
      expect(parser.evaluate('ceil 0.5')).to.equal(1);
      expect(parser.evaluate('ceil -0.5')).to.equal(0);
      expect(parser.evaluate('ceil 1')).to.equal(1);
      expect(parser.evaluate('ceil -1')).to.equal(-1);
      expect(parser.evaluate('ceil 1.000001')).to.equal(2);
      expect(parser.evaluate('ceil -1.000001')).to.equal(-1);
      expect(parser.evaluate('ceil 2.999')).to.equal(3);
      expect(parser.evaluate('ceil -2.999')).to.equal(-2);
      expect(parser.evaluate('ceil 123.5')).to.equal(124);
      expect(parser.evaluate('ceil -123.5')).to.equal(-123);
      expect(parser.evaluate('ceil(1/0)')).to.equal(Infinity);
      expect(parser.evaluate('ceil(-1/0)')).to.equal(-Infinity);
    });
  });

  describe('floor(x)', function () {
    it('rounds down to the nearest integer', function () {
      expect(parser.evaluate('floor 0')).to.equal(0);
      expect(parser.evaluate('floor 0.5')).to.equal(0);
      expect(parser.evaluate('floor -0.5')).to.equal(-1);
      expect(parser.evaluate('floor 1')).to.equal(1);
      expect(parser.evaluate('floor -1')).to.equal(-1);
      expect(parser.evaluate('floor 1.000001')).to.equal(1);
      expect(parser.evaluate('floor -1.000001')).to.equal(-2);
      expect(parser.evaluate('floor 2.999')).to.equal(2);
      expect(parser.evaluate('floor -2.999')).to.equal(-3);
      expect(parser.evaluate('floor 123.5')).to.equal(123);
      expect(parser.evaluate('floor -123.5')).to.equal(-124);
      expect(parser.evaluate('floor(1/0)')).to.equal(Infinity);
      expect(parser.evaluate('floor(-1/0)')).to.equal(-Infinity);
    });
  });

  describe('round(x)', function () {
    it('rounds to the nearest integer', function () {
      expect(parser.evaluate('round 0')).to.equal(0);
      expect(parser.evaluate('round 0.4999')).to.equal(0);
      expect(parser.evaluate('round -0.4999')).to.equal(0);
      expect(parser.evaluate('round 0.5')).to.equal(1);
      expect(parser.evaluate('round -0.5')).to.equal(0);
      expect(parser.evaluate('round 0.5001')).to.equal(1);
      expect(parser.evaluate('round -0.5001')).to.equal(-1);
      expect(parser.evaluate('round 1')).to.equal(1);
      expect(parser.evaluate('round -1')).to.equal(-1);
      expect(parser.evaluate('round 1.000001')).to.equal(1);
      expect(parser.evaluate('round -1.000001')).to.equal(-1);
      expect(parser.evaluate('round 1.5')).to.equal(2);
      expect(parser.evaluate('round -1.5')).to.equal(-1);
      expect(parser.evaluate('round 2.999')).to.equal(3);
      expect(parser.evaluate('round -2.999')).to.equal(-3);
      expect(parser.evaluate('round 2.5')).to.equal(3);
      expect(parser.evaluate('round -2.5')).to.equal(-2);
      expect(parser.evaluate('round 123.5')).to.equal(124);
      expect(parser.evaluate('round -123.5')).to.equal(-123);
      expect(parser.evaluate('round(1/0)')).to.equal(Infinity);
      expect(parser.evaluate('round(-1/0)')).to.equal(-Infinity);
    });
  });

  describe('trunc(x)', function () {
    it('rounds toward zero', function () {
      expect(parser.evaluate('trunc 0')).to.equal(0);
      expect(parser.evaluate('trunc 0.4999')).to.equal(0);
      expect(parser.evaluate('trunc -0.4999')).to.equal(0);
      expect(parser.evaluate('trunc 0.5')).to.equal(0);
      expect(parser.evaluate('trunc -0.5')).to.equal(0);
      expect(parser.evaluate('trunc 0.5001')).to.equal(0);
      expect(parser.evaluate('trunc -0.5001')).to.equal(0);
      expect(parser.evaluate('trunc 1')).to.equal(1);
      expect(parser.evaluate('trunc -1')).to.equal(-1);
      expect(parser.evaluate('trunc 1.000001')).to.equal(1);
      expect(parser.evaluate('trunc -1.000001')).to.equal(-1);
      expect(parser.evaluate('trunc 1.5')).to.equal(1);
      expect(parser.evaluate('trunc -1.5')).to.equal(-1);
      expect(parser.evaluate('trunc 2.999')).to.equal(2);
      expect(parser.evaluate('trunc -2.999')).to.equal(-2);
      expect(parser.evaluate('trunc 2.5')).to.equal(2);
      expect(parser.evaluate('trunc -2.5')).to.equal(-2);
      expect(parser.evaluate('trunc 123.5')).to.equal(123);
      expect(parser.evaluate('trunc -123.5')).to.equal(-123);
      expect(parser.evaluate('trunc(1/0)')).to.equal(Infinity);
      expect(parser.evaluate('trunc(-1/0)')).to.equal(-Infinity);
    });
  });

  describe('exp(x)', function () {
    it('rounds to the nearest integer', function () {
      var delta = 1e-15;
      expect(parser.evaluate('exp 0')).to.equal(1);
      expect(parser.evaluate('exp 0.5')).to.be.closeTo(1.6487212707001282, delta);
      expect(parser.evaluate('exp -0.5')).to.be.closeTo(0.6065306597126334, delta);
      expect(parser.evaluate('exp 1')).to.be.closeTo(2.718281828459045, delta);
      expect(parser.evaluate('exp -1')).to.be.closeTo(0.36787944117144233, delta);
      expect(parser.evaluate('exp 1.5')).to.be.closeTo(4.4816890703380645, delta);
      expect(parser.evaluate('exp -1.5')).to.be.closeTo(0.22313016014842982, delta);
      expect(parser.evaluate('exp 2')).to.be.closeTo(7.3890560989306495, delta);
      expect(parser.evaluate('exp -2')).to.be.closeTo(0.1353352832366127, delta);
      expect(parser.evaluate('exp 2.5')).to.be.closeTo(12.182493960703471, delta);
      expect(parser.evaluate('exp -2.5')).to.be.closeTo(0.0820849986238988, delta);
      expect(parser.evaluate('exp 3')).to.be.closeTo(20.085536923187668, delta);
      expect(parser.evaluate('exp 4')).to.be.closeTo(54.59815003314423, delta);
      expect(parser.evaluate('exp 10')).to.be.closeTo(22026.46579480671, delta);
      expect(parser.evaluate('exp -10')).to.be.closeTo(0.00004539992976248486, delta);
      expect(parser.evaluate('exp(1/0)')).to.equal(Infinity);
      expect(parser.evaluate('exp(-1/0)')).to.equal(0);
    });
  });

  describe('-x', function () {
    it('has the correct precedence', function () {
      expect(parser.parse('-2^3').toString()).to.equal('(-(2 ^ 3))');
      expect(parser.parse('-(2)^3').toString()).to.equal('(-(2 ^ 3))');
      expect(parser.parse('-2 * 3').toString()).to.equal('((-2) * 3)');
      expect(parser.parse('-2 + 3').toString()).to.equal('((-2) + 3)');
      expect(parser.parse('- - 1').toString()).to.equal('(-(-1))');
    });

    it('negates its argument', function () {
      expect(parser.evaluate('-0')).to.equal(0);
      expect(parser.evaluate('-0.5')).to.equal(-0.5);
      expect(parser.evaluate('-1')).to.equal(-1);
      expect(parser.evaluate('-123')).to.equal(-123);
      expect(parser.evaluate('-(-1)')).to.equal(1);
    });

    it('converts its argument to a number', function () {
      expect(parser.evaluate('-"123"')).to.equal(-123);
    });
  });

  describe('+x', function () {
    it('has the correct precedence', function () {
      expect(parser.parse('+2^3').toString()).to.equal('(+(2 ^ 3))');
      expect(parser.parse('+(2)^3').toString()).to.equal('(+(2 ^ 3))');
      expect(parser.parse('+2 * 3').toString()).to.equal('((+2) * 3)');
      expect(parser.parse('+2 + 3').toString()).to.equal('((+2) + 3)');
      expect(parser.parse('+ + 1').toString()).to.equal('(+(+1))');
    });

    it('returns its argument', function () {
      expect(parser.evaluate('+0')).to.equal(0);
      expect(parser.evaluate('+0.5')).to.equal(0.5);
      expect(parser.evaluate('+1')).to.equal(1);
      expect(parser.evaluate('+123')).to.equal(123);
      expect(parser.evaluate('+(+1)')).to.equal(1);
    });

    it('converts its argument to a number', function () {
      expect(parser.evaluate('+"123"')).to.equal(123);
    });
  });
});
