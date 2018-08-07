/* global describe, it */

'use strict';

var assert = require('assert');
var Parser = require('../dist/bundle').Parser;

describe('Date Functions', function () {
  describe('now()', function () {
    // Simple cases
    it('should handle now()', function () {
      var date = new Date();
      var now = date.getFullYear() + '-' + (date.getMonth() > 8 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) +
        '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate());
      assert.strictEqual(Parser.evaluate('now()'), now);
    });
    it('should handle now("YYYY-MM-DD")', function () {
      var date = new Date();
      var now = date.getFullYear() + '-' + (date.getMonth() > 8 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) +
        '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate());
      assert.strictEqual(Parser.evaluate('now("YYYY-MM-DD")'), now);
    });
  });

  describe('dateAdd()', function () {
    // Simple cases
    it('should handle dateAdd(date, num)', function () {
      assert.strictEqual(Parser.evaluate('dateAdd("2018-08-08", 2)'), '2018-08-10');
    });
    it('should handle dateAdd(date, num, unit)', function () {
      assert.strictEqual(Parser.evaluate('dateAdd("2018-08-08", 2, "M")'), '2018-10-08');
    });
  });

  describe('dateSubtract()', function () {
    // Simple cases
    it('should handle dateSubtract(date, num)', function () {
      assert.strictEqual(Parser.evaluate('dateSubtract("2018-08-08", 2)'), '2018-08-06');
    });
    it('should handle dateSubtract(date, num, unit)', function () {
      assert.strictEqual(Parser.evaluate('dateSubtract("2018-08-08", 2, "M")'), '2018-06-08');
    });
  });
  
  describe('datesDiff()', function () {
    // Simple cases
    it('should handle datesDiff(date1, date2)', function () {
      assert.strictEqual(Parser.evaluate('datesDiff("2018-08-08", "2018-08-06")'), 2);
    });
    it('should handle dateAdd(date1, date2, unit)', function () {
      assert.strictEqual(Parser.evaluate('datesDiff("2018-08-08", "2018-08-06", "h")'), 48);
    });
  });
   
  describe('dateGet()', function () {
    // Simple cases
    it('should handle dateGet(date, unit)', function () {
      assert.strictEqual(Parser.evaluate('dateGet("2018-08-08", "y")'), 2018);
    });
    it('should handle dateAdd(date, unit)', function () {
      assert.strictEqual(Parser.evaluate('dateGet("2018-08-08", "M")'), 8);
    });
  });
});
