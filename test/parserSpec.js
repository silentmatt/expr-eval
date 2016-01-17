var expect = require("chai").expect;
var Parser = require("../parser.js");
Parser = Parser.Parser;

describe("Parser", function() {
    describe("#evaluate()", function() {
        it("2 ^ x", function() {
            expect(Parser.evaluate("2 ^ x", {x: 3})).to.equal(8);
        });
        it("2 * x + 1", function() {
            expect(Parser.evaluate("2 * x + 1", {x: 3})).to.equal(7);
        });
        it("2 + 3 * x", function() {
            expect(Parser.evaluate("2 + 3 * x", {x: 4})).to.equal(14);
        });
        it("(2 + 3) * x", function() {
            expect(Parser.evaluate("(2 + 3) * x", {x: 4})).to.equal(20);
        });
        it("2-3^x", function() {
            expect(Parser.evaluate("2-3^x", {x: 4})).to.equal(-79);
        });
        it("-2-3^x", function() {
            expect(Parser.evaluate("-2-3^x", {x: 4})).to.equal(-83);
        });
        it("-3^x", function() {
            expect(Parser.evaluate("-3^x", {x: 4})).to.equal(-81);
        });
        it("(-3)^x", function() {
            expect(Parser.evaluate("(-3)^x", {x: 4})).to.equal(81);
        });
    });
    describe("#substitute()", function() {
        var expr = Parser.parse("2 * x + 1");
        var expr2 = expr.substitute("x", "4 * x");
        it("((2*(4*x))+1)", function() {
            expect(expr2.evaluate({ x: 3})).to.equal(25);
        });
    });
    describe("#simplify()", function() {
        var expr = Parser.parse("x * (y * atan(1))").simplify({ y: 4 });
        it("(x*3.141592653589793)", function() {
            expect(expr.toString()).to.equal('(x*3.141592653589793)');
        });
        it("6.283185307179586", function() {
            expect(expr.evaluate({ x: 2 })).to.equal(6.283185307179586);
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
        it("2 == 3", function() {
            expect(Parser.evaluate("2 == 3")).to.equal(false);
        });
        it("3 * 1 == 2", function() {
            expect(Parser.evaluate("3 == 2")).to.not.equal(true);
        });
        it("3 == 3", function() {
            expect(Parser.evaluate("3 == 3")).to.equal(true);
        });
    });
    describe("#notEqual()", function() {
        it("2 != 3", function() {
            expect(Parser.evaluate("2 != 3")).to.equal(true);
        });
        it("3 != 2", function() {
            expect(Parser.evaluate("3 != 2")).to.not.equal(false);
        });
        it("3 != 3", function() {
            expect(Parser.evaluate("3 != 3")).to.equal(false);
        });
    });
    describe("#greaterThan()", function() {
        it("2 > 3", function() {
            expect(Parser.evaluate("2 > 3")).to.equal(false);
        });
        it("3 > 2", function() {
            expect(Parser.evaluate("3 > 2")).to.equal(true);
        });
        it("3 > 3", function() {
            expect(Parser.evaluate("3 > 3")).to.equal(false);
        });
    });
    describe("#greaterThanEqual()", function() {
        it("2 >= 3", function() {
            expect(Parser.evaluate("2 >= 3")).to.equal(false);
        });
        it("3 >= 2", function() {
            expect(Parser.evaluate("3 >= 2")).to.equal(true);
        });
        it("3 >= 3", function() {
            expect(Parser.evaluate("3 >= 3")).to.equal(true);
        });
    });
    describe("#lessThan()", function() {
        it("2 < 3", function() {
            expect(Parser.evaluate("2 < 3")).to.equal(true);
        });
        it("3 < 2", function() {
            expect(Parser.evaluate("3 < 2")).to.equal(false);
        });
        it("3 < 3", function() {
            expect(Parser.evaluate("3 < 3")).to.equal(false);
        });
    });
    describe("#lessThanEqual()", function() {
        it("2 <= 3", function() {
            expect(Parser.evaluate("2 <= 3")).to.equal(true);
        });
        it("3 <= 2", function() {
            expect(Parser.evaluate("3 <= 2")).to.equal(false);
        });
        it("3 <= 3", function() {
            expect(Parser.evaluate("3 <= 3")).to.equal(true);
        });
    });
    describe("#andOperator()", function() {
        it("1 and 0", function() {
            expect(Parser.evaluate("1 and 0")).to.equal(false);
        });
        it("1 and 1", function() {
            expect(Parser.evaluate("1 and 1")).to.equal(true);
        });
        it("0 and 0", function() {
            expect(Parser.evaluate("0 and 0")).to.equal(false);
        });
        it("0 and 1", function() {
            expect(Parser.evaluate("0 and 1")).to.equal(false);
        });
        it("0 and 1 and 0", function() {
            expect(Parser.evaluate("0 and 1 and 0")).to.equal(false);
        });
        it("1 and 1 and 0", function() {
            expect(Parser.evaluate("1 and 1 and 0")).to.equal(false);
        });
    });
    describe("#orOperator()", function() {
        it("1 or 0", function() {
            expect(Parser.evaluate("1 or 0")).to.equal(true);
        });
        it("1 or 1", function() {
            expect(Parser.evaluate("1 or 1")).to.equal(true);
        });
        it("0 or 0", function() {
            expect(Parser.evaluate("0 or 0")).to.equal(false);
        });
        it("0 or 1", function() {
            expect(Parser.evaluate("0 or 1")).to.equal(true);
        });
        it("0 or 1 or 0", function() {
            expect(Parser.evaluate("0 or 1 or 0")).to.equal(true);
        });
        it("1 or 1 or 0", function() {
            expect(Parser.evaluate("1 or 1 or 0")).to.equal(true);
        });
    });
    describe("#condition()", function() {
        it("cond(1, 1, 0)", function() {
            expect(Parser.evaluate("cond(1, 1, 0)")).to.equal(1);
        });
        it("cond(0, 1, 0)", function() {
            expect(Parser.evaluate("cond(0, 1, 0)")).to.equal(0);
        });
        it("cond(1==1 or 2==1, 39, 0)", function() {
            expect(Parser.evaluate("cond(1==1 or 2==1, 39, 0)")).to.equal(39);
        });
        it("cond(1==1 or 1==2, -4 + 8, 0)", function() {
            expect(Parser.evaluate("cond(1==1 or 1==2, -4 + 8, 0)")).to.equal(4);
        });
        it("cond(3 && 6, cond(45 > 5 * 11, 3 * 3, 2.4), 0)", function() {
            expect(Parser.evaluate("cond(3 and 6, cond(45 > 5 * 11, 3 * 3, 2.4), 0)")).to.equal(2.4);
        });
    });
    describe("#suffix operator", function(){
        it("5!", function(){
            expect(Parser.evaluate("5!")).to.equal(120);
        });
        it("(3!)!", function(){
            expect(Parser.evaluate("(3!)!")).to.equal(720);
        });
        it("percentage", function(){
            var parser = new Parser();
            parser.addOperator("~%", 4, function(a){
                return a / 100;
            });
            expect(parser.evaluate("5%")).to.equal(0.05);
            expect(parser.evaluate("2^5%")).to.equal(0.32);
            expect(parser.evaluate("x+y%", {x:1, y:2})).to.equal(1.02);
        });
    });
    describe("commas", function(){
        it("(1,2)+(3,4)", function(){
            expect(Parser.evaluate("(1,2)+(3,4)")).to.equal(6);
        });
        it("max(1,(2,4),3)", function(){
            expect(Parser.evaluate("max(1,(2,4),3)")).to.equal(4);
        });
        it("max((1,(2,4),3))", function(){
            expect(Parser.evaluate("max((1,(2,4),3))")).to.equal(3);
        });
    });
    describe("operator overloading", function(){
        function Complex(r, i){
            this.r = r;
            this.i = i || 0;
        }
        function Vector(x, y){
            this.x = x;
            this.y = y;
        }
        var parser = new Parser();
        parser.overload("+", Complex, function(a, b){
            return new Complex(a.r + b.r, a.i + b.i);
        });
        parser.overload("-", Complex, function(a,b){ 
            return new Complex(a.r-b.r, a.i-b.i);
        });

        parser.overload("-", Complex, function(a){ 
            return new Complex(-a.r, -a.i);
        });

        parser.addOperator("**", 4, function(a, b){ //vector cross
            return new Vector(a.x * b.y, - a.y * b.x);
        });

        it("Complex + Complex", function(){
            var a = new Complex(1, 2);
            var b = new Complex(3, 4);
            expect(parser.evaluate("a + b", {a:a, b:b})).to.deep.equal({
                r: 4,
                i: 6
            });
        });
        it("Complex + Real + Complex", function(){
            var a = new Complex(1, 2);
            var b = new Complex(3, 4);
            expect(parser.evaluate("a + 1 + b", {a:a, b:b})).to.deep.equal({
                r: 5,
                i: 6
            });
        });
        it("Complex + (Real + Complex)", function(){
            var a = new Complex(1, 2);
            var b = new Complex(3, 4);
            expect(parser.evaluate("a + (1 + b)", {a:a, b:b})).to.deep.equal({
                r: 5,
                i: 6
            });
        });
        it("-Complex + Complex - Real", function(){
            var expr = parser.parse("-a + b - 1");
            var a = new Complex(1, 2);
            var b = new Complex(3, 4);
            expect(expr.evaluate({a:a, b:b})).to.deep.equal({
                r: 1,
                i: 2
            });
        });
        it("Vector cross", function(){
            var a = new Vector(1, 2);
            var b = new Vector(3, 4);
            expect(parser.evaluate("a ** b", {a:a, b:b})).to.deep.equal({
                x: 4,
                y: -6
            });            
        });
    });
    describe("toJSFunction", function(){
        it("toJSFunction", function(){
            var parser = Parser.parse("x ^ 2 + y ^ 2 + 1");
            var func1 = parser.toJSFunction(['x', 'y']);
            var func2 = parser.toJSFunction(['x'], {y: 2});

            expect(func1(1, 1)).to.equal(3);
            expect(func2(2)).to.equal(9);
        });
    });
});
