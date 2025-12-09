/* global describe, it */

'use strict';

var assert = require('assert');
var Parser = require('../dist/bundle').Parser;
var fs = require('fs');
var childProcess = require('child_process');

/* A context of potential dangerous stuff */
var context = {
  write: (path, data) => fs.writeFileSync(path, data),
  cmd: (cmd) => console.log('Executing:', cmd),
  exec: childProcess.execSync,
  evalFunc: eval,
  FunctionConstructor: Function
};

describe('Security tests', function () {
  it('should fail on direct function call to an unallowed function', function () {
    var parser = new Parser();
    assert.throws(() => {
      parser.evaluate('write("pwned.txt","Hello!")', context);
    }, Error);
  });

  it('should allow IFUNDEF but keep function calls safe', function () {
    var parserWithFndef = new Parser({
      operators: { fndef: true }
    });
    var safeExpr = '(f(x) = x * x)(5)';
    assert.strictEqual(parserWithFndef.evaluate(safeExpr), 25,
      'Should correctly evaluate an expression with an allowed IFUNDEF.');
    var dangerousExpr = '((h(x) = write("pwned.txt", x)) + h(5))';
    assert.throws(() => {
      parserWithFndef.evaluate(dangerousExpr, context);
    }, Error);
  });

  it('should fail when a variable is assigned a dangerous function', function () {
    var parser = new Parser();

    var dangerousContext = { ...context, evil: context.cmd };

    assert.throws(() => {
      parser.evaluate('evil("ls -lh /")', dangerousContext);
    }, Error);
  });

  it('PoC provided by researcher VU#263614 deny child exec process', function () {
    var parser = new Parser();
    assert.throws(() => {
      parser.evaluate('exec("whoami")', context);
    }, Error);
  });

  it('PoC provided by researcher https://github.com/silentmatt/expr-eval/issues/289 by gitHub @baoquanh', function () {
    var context = {
      write: (path, data) => fs.writeFileSync(path, data),
      cmd: (cmd) => console.log('Executing:', cmd),
      exec: childProcess.execSync
    };

    var contextWrapper = {
      test: context
    };

    var parser = new Parser();
    assert.throws(() => {
      parser.evaluate('test.write("pwned.txt","Hello!")', contextWrapper);
    }, Error);
  });

  describe('Prototype pollution and member function protection (lines 173-182)', function () {
    it('should block __proto__ and prototype pollution attempts', function () {
      var parser = new Parser();
    
      assert.throws(() => {
        parser.evaluate('obj.__proto__', { obj: {} });
      }, /prototype access detected in MEMBER/);
      
      assert.throws(() => {
        parser.evaluate('obj.prototype', { obj: {} });
      }, /prototype access detected in MEMBER/);
      
      assert.throws(() => {
        parser.evaluate('user.config.__proto__.isAdmin = true', { user: { config: {} } });
      }, /prototype access detected in MEMBER/);
    });

    it('should block dangerous function calls via member access but allow safe Math functions', function () {
      var parser = new Parser();
  
      assert.throws(() => {
        parser.evaluate('obj.write("evil.txt", "data")', { obj: context });
      }, /Is not an allowed function in MEMBER/);
      
      assert.throws(() => {
        parser.evaluate('obj.cmd("whoami")', { obj: context });
      }, /Is not an allowed function in MEMBER/);
      
      var safe = {
        absolute: Math.abs,
        squareRoot: Math.sqrt
      };
      assert.strictEqual(parser.evaluate('obj.absolute(-5)', { obj: safe }), 5);
      assert.strictEqual(parser.evaluate('obj.squareRoot(16)', { obj: safe }), 4);
    });

    it('should block eval and Function constructor but allow registered custom functions', function () {
      var parser = new Parser();

      assert.throws(() => {
        parser.evaluate('obj.evalFunc("malicious()")', { obj: context });
      }, /Is not an allowed function in MEMBER/);
      
      assert.throws(() => {
        parser.evaluate('obj.FunctionConstructor("return process")()', { obj: context });
      }, /Is not an allowed function in MEMBER/);
      
      var customFunc = function (x) { return x * 2; };
      parser.functions.double = customFunc;
      var obj = { myDouble: customFunc };
      assert.strictEqual(parser.evaluate('obj.myDouble(5)', { obj: obj }), 10);
    });
  });
});
