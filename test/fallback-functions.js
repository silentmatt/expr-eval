/* global describe, it */

'use strict';

var assert = require('assert');
var Parser = require('../dist/bundle').Parser;

function assertCloseTo(actual, expected, delta) {
  assert.ok(Math.abs(actual - expected) <= delta);
}

function withMissingMathFunctions(names, callback) {
  var originals = {};
  names.forEach(function (name) {
    originals[name] = Math[name];
    Math[name] = undefined;
  });

  try {
    callback(new Parser());
  } finally {
    names.forEach(function (name) {
      Math[name] = originals[name];
    });
  }
}

describe('Fallback math functions', function () {
  it('uses internal fallbacks for expm1, log1p, and log2', function () {
    withMissingMathFunctions(['expm1', 'log1p', 'log2'], function (parser) {
      var delta = 1e-15;

      assertCloseTo(parser.evaluate('expm1 2'), 6.38905609893065, delta);
      assertCloseTo(parser.evaluate('log1p 9'), 2.302585092994046, delta);
      assertCloseTo(parser.evaluate('log2 1024'), 10, delta);
    });
  });
});
