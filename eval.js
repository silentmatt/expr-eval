(function (exports) {

function evaluate(expr, scope) {
    var first, second, third, fourth;

    switch (expr.arity) {
    case "var":
        scope.define(expr.first.value);
        return void(0);
    case "name":
        return scope.get(expr.value);
    case "literal":
        return expr.value;
    case "unary":
        first = expr.first;
        switch (expr.value) {
        case "-":
            return -evaluate(first, scope);
        case "+":
            return +evaluate(first, scope);
        case "[":
            return first.map(function (el) { return evaluate(el, scope); });
        case "{":
            var obj = {};
            first.forEach(function (el) { obj[el.key] = evaluate(el, scope); });
            return obj;
        case "!":
            return !evaluate(first, scope);
        }
        break;
    case "binary":
        first = expr.first;
        second = expr.second;
        switch (expr.value) {
        case ";":
            evaluate(first, scope);
            return evaluate(second, scope);
        case "=":
        case "-=":
        case "+=":
        case "*=":
        case "/=":
            var value = evaluate(second, scope);
            if (first.arity === "name") {
                var name = first.value;
                if (expr.value !== '=') {
                    var right = value;
                    try {
                        value = scope.get(name);
                    }
                    catch (ex) {
                        value = 0;
                    }
                    switch (expr.value) {
                    case "+=":
                        value += right;
                        break;
                    case "-=":
                        value -= right;
                        break;
                    case "*=":
                        value *= right;
                        break;
                    case "/=":
                        value /= right;
                        break;
                    }
                }
                scope.set(name, value);
            }
            else {
                var a = evaluate(first.first, scope);
                var i = evaluate(first.second, scope);
                if (expr.value !== '=') {
                    right = value;
                    value = a[i];
                    switch (expr.value) {
                    case "+=":
                        value += right;
                        break;
                    case "-=":
                        value -= right;
                        break;
                    case "*=":
                        value *= right;
                        break;
                    case "/=":
                        value /= right;
                        break;
                    }
                }
                a[i] = value;
            }
            return value;
        case "&&":
            return evaluate(first, scope) && evaluate(second, scope);
        case "||":
            return evaluate(first, scope) || evaluate(second, scope);
        case "==":
            return evaluate(first, scope) === evaluate(second, scope);
        case "!=":
            return evaluate(first, scope) !== evaluate(second, scope);
        case "<":
            return evaluate(first, scope) < evaluate(second, scope);
        case "<=":
            return evaluate(first, scope) <= evaluate(second, scope);
        case ">":
            return evaluate(first, scope) > evaluate(second, scope);
        case ">=":
            return evaluate(first, scope) >= evaluate(second, scope);
        case "+":
            return evaluate(first, scope) + evaluate(second, scope);
        case "-":
            return evaluate(first, scope) - evaluate(second, scope);
        case "*":
            return evaluate(first, scope) * evaluate(second, scope);
        case "/":
            return evaluate(first, scope) / evaluate(second, scope);
        case "^":
            return Math.pow(evaluate(first, scope), evaluate(second, scope));
        case "[":
            return evaluate(first, scope)[ evaluate(second, scope) ];
        case "(":
            var fn = evaluate(first, scope);
            if (typeof fn !== "function") {
                throw new Error("not a function");
            }
            var args = second.map(function (arg) { return evaluate(arg, scope); });
            return fn.apply(null, args);
        case "var":
            scope.define(first.value);
            var value = evaluate(second, scope);
            scope.set(first.value, value);
            return value;
        }
        break;
    case "ternary":
        first = expr.first;
        second = expr.second;
        third = expr.third;
        if (expr.value === "?") {
            return evaluate(first, scope) ? evaluate(second, scope) : evaluate(third, scope);
        }
        break;
    case "function":
        var params = expr.first.map(function (p) { return p.value; });
        var body = expr.second;
        if (expr.locals.length) {
            var usesArgs = (expr.locals.indexOf("@") !== -1);
            var fun = function () {
                var newScope = scope.inherit();
                params.forEach(function (p) { newScope.define(p); });
                for (var i = 0; i < params.length; i++) {
                    newScope.set(params[i], arguments[i]);
                }
                if (usesArgs) {
                    newScope.define("@");
                    newScope.set("@", Array.prototype.slice.call(arguments));
                }
                return evaluate(body, newScope);
            };
        }
        else {
            var fun = function () { return evaluate(body, scope); };
        }

        fun.toString = function () {
            return 'function(' + params + ') {' + stringify(body) + '}';
        };
        return fun;
    }

    throw new Error("Unrecognized expression type: " + expr.arity);
}


function unary(props) {
    var res = { arity: "unary" };
    for (var k in props) {
        res[k] = props[k];
    }
    return res;
}

function binary(props) {
    var res = { arity: "binary" };
    for (var k in props) {
        res[k] = props[k];
    }
    return res;
}

function literal(value) {
    return {
        arity: "literal",
        value: value
    };
}


// FIXME: "var foo" shoule hide "foo" from "scope"
function simplify(expr, scope) {
    var first, second, third, fourth;

    switch (expr.arity) {
    case "var":
        return {
            arity: "var",
            first: {
                value: expr.first.value
            }
        };
    case "name":
        if (scope.has(expr.value)) {
            return literal(scope.get(expr.value));
        }
        else {
            return {
                arity: "name",
                value: expr.value
            }
        }
    case "literal":
        return literal(expr.value);
    case "unary":
        // TODO: Support array and object literals
        if (expr.first.arity === "literal" && expr.value !== "[" && expr.value !== "{") {
            first = simplify(expr.first, scope);
            switch (expr.value) {
            case "-":
                return literal(-first.value);
            case "+":
                return literal(+first.value);
            case "!":
                return literal(!first.value);
            }
        }
        else {
            return unary({
                first: expr.first,
                value: expr.value
            });
        }
        break;
    case "binary":
        first = simplify(expr.first, scope);
        if (expr.value !== "(") {
            second = simplify(expr.second, scope);
        }
        else {
            second = expr.second.map(function(arg) { return simplify(arg, scope); } );
        }
        // TODO: Support assignment (name op simplified) and known functions
        if (first.arity === "literal" && second.arity === "literal") {
            switch (expr.value) {
            case ";":
                return literal(second);
            case "&&":
                return literal(first.value && second.value);
            case "||":
                return literal(first.value || second.value);
            case "==":
                return literal(first.value == second.value);
            case "!=":
                return literal(first.value != second.value);
            case "<":
                return literal(first.value < second.value);
            case "<=":
                return literal(first.value <= second.value);
            case ">":
                return literal(first.value > second.value);
            case ">=":
                return literal(first.value >= second.value);
            case "+":
                return literal(first.value + second.value);
            case "-":
                return literal(first.value - second.value);
            case "*":
                return literal(first.value * second.value);
            case "/":
                return literal(first.value / second.value);
            case "^":
                return literal(Math.pow(first.value, second.value));
            case "[":
                return literal(first.value[second.value]);
            default:
                return binary({
                    first: first,
                    second: second,
                    value: expr.value
                });
            }
        }
        else {
            return binary({
                first: first,
                second: second,
                value: expr.value
            });
        }
        break;
    case "ternary":
        first = simplify(expr.first, scope);
        second = simplify(expr.second, scope);
        third = simplify(expr.third, scope);
        if (expr.value === "?" && first.arity === "literal") {
            return first.value ? second : third;
        }
        return {
            arity: "ternary",
            value: expr.value,
            first: first,
            second: second,
            third: third
        };
        break;
    case "function":
        return {
            arity: "function",
            first: expr.first.slice(),
            second: simplify(expr.second, scope),
            locals: expr.locals.slice()
        };
    }

    throw new Error("Unrecognized expression type: " + expr.arity);
}



function stringify(expr/*, toJS*/) {
    var first, second, third, fourth;

    switch (expr.arity) {
    case "var":
        return "var " + expr.first.value;
    case "name":
        return expr.value;
    case "literal":
        if (typeof expr.value === "undefined") {
            return "undefined";
        }
        return JSON.stringify(expr.value); // TODO: undefined?
    case "unary":
        first = expr.first;
        switch (expr.value) {
        case "-":
            return "(-" + stringify(first) + ")";
        case "+":
            return "(+" + stringify(first) + ")";
        case "[":
            return "[" + first.map(function (el) { return stringify(el); }).join(", ") + "]";
        case "{":
            return "{" + first.map(function(p) { return JSON.stringify(String(p.key)) + ":" + stringify(p); }).join(", ") + "}";
        case "!":
            return "(!" + stringify(first) + ")";
        }
        break;
    case "binary":
        first = expr.first;
        second = expr.second;
        switch (expr.value) {
        case ";":
            return stringify(first) + "; " + stringify(second);
        case "[":
            return stringify(first) + "[" + stringify(second) + "]";
        case "(":
            var fn = stringify(first);
            var args = second.map(function (arg) { return stringify(arg); }).join(", ");
            return fn + "(" + args + ")";
        case "var":
            return "(var " + first.value + " = " + stringify(second) + ")";
        }
        default:
            return "(" + stringify(first) + " " + expr.value + " " + stringify(second) + ")";
        break;
    case "ternary":
        first = expr.first;
        second = expr.second;
        third = expr.third;
        if (expr.value === "?") {
            return "((" + stringify(first) + ") ? (" + stringify(second) + ") : (" + stringify(third) + "))";
        }
        break;
    case "function":
        var params = expr.first.map(function (p) { return p.value; }).join(", ");
        return 'function(' + params + ') {' + stringify(expr.second) + '}';
    }

    throw new Error("Unrecognized expression type: " + expr.arity);
}


exports.evaluate = evaluate;
exports.simplify = simplify;
exports.stringify = stringify;

})(typeof exports !== 'undefined' ? exports : (parser2 = parser2 || {}));
