'use strict';
var assert = require('assert');
var Parser = require('../dist/bundle').Parser;
var fs = require('fs');
var child_process = require('child_process');

/* A context of potential dangerous stuff */
var context = {
    write: (path, data) => fs.writeFileSync(path, data),
    cmd: (cmd) => console.log('Executing:', cmd),
    exec: child_process.execSync
};

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
    assert.equal(parserWithFndef.evaluate(safeExpr), 25,
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

it('PoC provided by researcher VU#263614 deny child exec process', function() {
    var parser = new Parser();
    assert.throws(() => {
	parser.evaluate('exec("whoami")', context);
    }, Error);
});
it('PoC provided by researcher https://github.com/silentmatt/expr-eval/issues/289 by gitHub @baoquanh', function() { 
   var context = {
       write: (path, data) => fs.writeFileSync(path, data),
       cmd: (cmd) => console.log('Executing:', cmd),
       exec: child_process.execSync
   };

   var baoquanh = {
       test: context
   }
   var parser = new Parser();
   assert.throws(() => {
       parser.evaluate('test.write("pwned.txt","Hello!")', baoquanh)
   }, Error);
})
