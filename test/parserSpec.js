var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var expect = chai.expect;
var Parser = require("../parser.js");

Q = require('q');
Parser = Parser.Parser;

describe("Parser", function() {
    describe("#evaluate()", function() {
        it("2 ^ x", function(done) {
            expect(Parser.evaluate("2 ^ x", {x: 3})).to.eventually.equal(8).notify(done);
        });
        it("2 * x + 1", function(done) {
            expect(Parser.evaluate("2 * x + 1", {x: 3})).to.eventually.equal(7).notify(done);
        });
        it("2 + 3 * x", function(done) {
            expect(Parser.evaluate("2 + 3 * x", {x: 4})).to.eventually.equal(14).notify(done);
        });
        it("(2 + 3) * x", function(done) {
            expect(Parser.evaluate("(2 + 3) * x", {x: 4})).to.eventually.equal(20).notify(done);
        });
        it("2-3^x", function(done) {
            expect(Parser.evaluate("2-3^x", {x: 4})).to.eventually.equal(-79).notify(done);
        });
        it("-2-3^x", function(done) {
            expect(Parser.evaluate("-2-3^x", {x: 4})).to.eventually.equal(-83).notify(done);
        });
        it("-3^x", function(done) {
            expect(Parser.evaluate("-3^x", {x: 4})).to.eventually.equal(-81).notify(done);
        });
        it("(-3)^x", function(done) {
            expect(Parser.evaluate("(-3)^x", {x: 4})).to.eventually.equal(81).notify(done);
        });
    });
    describe("#substitute()", function() {
        var expr = Parser.parse("2 * x + 1");
        var expr2 = expr.substitute("x", "4 * x");
        it("((2*(4*x))+1)", function(done) {
            expect(expr2.evaluate({ x: 3})).to.eventually.equal(25).notify(done);
        });
    });
    describe("#simplify()", function() {
        var expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4 });
        it("(x*3.141592653589793)", function() {
            expect(expr.toString()).to.equal('(x*3.141592653589793)');
        });
        it("6.283185307179586", function(done) {
            expect(expr.evaluate({ x: 2 })).to.eventually.equal(6.283185307179586).notify(done);
        });
    });
    describe("#variables()", function() {
        var expr = Parser.parse("x * (y * atan(1))");
        it("['x', 'y']", function() {
            expect(expr.variables()).to.have.same.members(['x', 'y']);
        });
        it("['x']", function() {
            expect(expr.simplify({y: 4}).variables()).to.have.same.members(['x']);
        });
    });
    describe("#equal()", function() {
        it("2 == 3", function(done) {
            expect(Parser.evaluate("2 == 3")).to.eventually.equal(false).notify(done);
        });
        it("3 * 1 == 2", function(done) {
            expect(Parser.evaluate("3 == 2")).to.eventually.not.equal(true).notify(done);
        });
        it("3 == 3", function(done) {
            expect(Parser.evaluate("3 == 3")).to.eventually.equal(true).notify(done);
        });
    });
    describe("#notEqual()", function() {
        it("2 != 3", function(done) {
            expect(Parser.evaluate("2 != 3")).to.eventually.equal(true).notify(done);
        });
        it("3 != 2", function(done) {
            expect(Parser.evaluate("3 != 2")).to.eventually.not.equal(false).notify(done);
        });
        it("3 != 3", function(done) {
            expect(Parser.evaluate("3 != 3")).to.eventually.equal(false).notify(done);
        });
    });
    describe("#greaterThan()", function() {
        it("2 > 3", function(done) {
            expect(Parser.evaluate("2 > 3")).to.eventually.equal(false).notify(done);
        });
        it("3 > 2", function(done) {
            expect(Parser.evaluate("3 > 2")).to.eventually.equal(true).notify(done);
        });
        it("3 > 3", function(done) {
            expect(Parser.evaluate("3 > 3")).to.eventually.equal(false).notify(done);
        });
    });
    describe("#greaterThanEqual()", function() {
        it("2 >= 3", function(done) {
            expect(Parser.evaluate("2 >= 3")).to.eventually.equal(false).notify(done);
        });
        it("3 >= 2", function(done) {
            expect(Parser.evaluate("3 >= 2")).to.eventually.equal(true).notify(done);
        });
        it("3 >= 3", function(done) {
            expect(Parser.evaluate("3 >= 3")).to.eventually.equal(true).notify(done);
        });
    });
    describe("#lessThan()", function() {
        it("2 < 3", function(done) {
            expect(Parser.evaluate("2 < 3")).to.eventually.equal(true).notify(done);
        });
        it("3 < 2", function(done) {
            expect(Parser.evaluate("3 < 2")).to.eventually.equal(false).notify(done);
        });
        it("3 < 3", function(done) {
            expect(Parser.evaluate("3 < 3")).to.eventually.equal(false).notify(done);
        });
    });
    describe("#lessThanEqual()", function() {
        it("2 <= 3", function(done) {
            expect(Parser.evaluate("2 <= 3")).to.eventually.equal(true).notify(done);
        });
        it("3 <= 2", function(done) {
            expect(Parser.evaluate("3 <= 2")).to.eventually.equal(false).notify(done);
        });
        it("3 <= 3", function(done) {
            expect(Parser.evaluate("3 <= 3")).to.eventually.equal(true).notify(done);
        });
    });
    describe("#andOperator()", function() {
        it("1 and 0", function(done) {
            expect(Parser.evaluate("1 and 0")).to.eventually.equal(false).notify(done);
        });
        it("1 and 1", function(done) {
            expect(Parser.evaluate("1 and 1")).to.eventually.equal(true).notify(done);
        });
        it("0 and 0", function(done) {
            expect(Parser.evaluate("0 and 0")).to.eventually.equal(false).notify(done);
        });
        it("0 and 1", function(done) {
            expect(Parser.evaluate("0 and 1")).to.eventually.equal(false).notify(done);
        });
        it("0 and 1 and 0", function(done) {
            expect(Parser.evaluate("0 and 1 and 0")).to.eventually.equal(false).notify(done);
        });
        it("1 and 1 and 0", function(done) {
            expect(Parser.evaluate("1 and 1 and 0")).to.eventually.equal(false).notify(done);
        });
    });
    describe("#orOperator()", function() {
        it("1 or 0", function(done) {
            expect(Parser.evaluate("1 or 0")).to.eventually.equal(true).notify(done);
        });
        it("1 or 1", function(done) {
            expect(Parser.evaluate("1 or 1")).to.eventually.equal(true).notify(done);
        });
        it("0 or 0", function(done) {
            expect(Parser.evaluate("0 or 0")).to.eventually.equal(false).notify(done);
        });
        it("0 or 1", function(done) {
            expect(Parser.evaluate("0 or 1")).to.eventually.equal(true).notify(done);
        });
        it("0 or 1 or 0", function(done) {
            expect(Parser.evaluate("0 or 1 or 0")).to.eventually.equal(true).notify(done);
        });
        it("1 or 1 or 0", function(done) {
            expect(Parser.evaluate("1 or 1 or 0")).to.eventually.equal(true).notify(done);
        });
    });
    describe("#condition()", function() {
        it("if(1, 1, 0)", function(done) {
            expect(Parser.evaluate("if(1, 1, 0)")).to.eventually.equal(1).notify(done);
        });
        it("if(0, 1, 0)", function(done) {
            expect(Parser.evaluate("if(0, 1, 0)")).to.eventually.equal(0).notify(done);
        });
        it("if(1==1 or 2==1, 39, 0)", function(done) {
            expect(Parser.evaluate("if(1==1 or 2==1, 39, 0)")).to.eventually.equal(39).notify(done);
        });
        it("if(1==1 or 1==2, -4 + 8, 0)", function(done) {
            expect(Parser.evaluate("if(1==1 or 1==2, -4 + 8, 0)")).to.eventually.equal(4).notify(done);
        });
        it("if(3 && 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)", function(done) {
            expect(Parser.evaluate("if(3 and 6, if(45 > 5 * 11, 3 * 3, 2.4), 0)")).to.eventually.equal(2.4).notify(done);
        });
    });
    describe("#evaluate - async()", function() {
        it("2 ^ xAsync * ( yAsync + z )", function(done) {
            expect(Parser.evaluate("2 ^ xAsync * ( yAsync + z )", {
                xAsync: function(){
                    return Q(3).delay(50);
                },
                yAsync: function(){
                    return Q(2).delay(70);
                },
                z: 5
            })).to.eventually.equal(56).notify(done);
        });
        it("2 * (x + lazySum(a, bAsync))", function(done) {
            expect(Parser.evaluate("2 * (x + lazySum(a, bAsync))",
                {
                    x: 3,
                    lazySum : function(a, b) {
                        return Q.delay(100).then(function(){
                            return a + b;
                        });
                    },
                    a : 5,
                    bAsync : function(){
                        return Q(7).delay(50);
                    }
                }
            )).to.eventually.equal(30).notify(done);
        });
    });
});

