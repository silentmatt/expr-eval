// parse.js
// From Top Down Operator Precedence
// http://javascript.crockford.com/tdop/index.html
// Douglas Crockford
// 2010-06-26

if (typeof require === "function") {
    // TODO: Replace tokens.js
    require('./tokens');
    var parser2 = require('./eval');
    var evaluate = parser2.evaluate;
    var simplify = parser2.simplify;
    var stringify = parser2.stringify;
}

function Parser() {
    var scope;
    var symbol_table = {};
    var token;
    var tokens;
    var token_nr;

    var itself = function () {
        return this;
    };

    var original_scope = {
        define: function (n) {
            var t = this.def[n.value];
            if (typeof t === "object") {
                n.error(t.reserved ? "Already reserved." : "Already defined.");
            }
            this.def[n.value] = n;
            n.reserved = false;
            n.nud      = itself;
            n.led      = null;
            n.std      = null;
            n.lbp      = 0;
            n.scope    = scope;
            return n;
        },
        has: function (n) {
            var t = this.def[n.value];
            return (typeof t === "object");
        },
        find: function (n) {
            var e = this, o;
            while (true) {
                o = e.def[n];
                if (o && typeof o !== 'function') {
                    return e.def[n];
                }
                e = e.parent;
                if (!e) {
                    o = symbol_table[n];
                    return o && typeof o !== 'function' ?
                            o : symbol_table["(name)"];
                }
            }
        },
        pop: function () {
            scope = this.parent;
        },
        reserve: function (n) {
            if (n.arity !== "name" || n.reserved) {
                return;
            }
            var t = this.def[n.value];
            if (t) {
                if (t.reserved) {
                    return;
                }
                if (t.arity === "name") {
                    n.error("Already defined.");
                }
            }
            this.def[n.value] = n;
            n.reserved = true;
        },
        locals: function() {
            var res = [];
            for (var k in this.def) {
                if (this.def.hasOwnProperty(k)) {
                    res.push(k);
                }
            }
            return res;
        }
    };

    var new_scope = function () {
        var s = scope;
        scope = Object.create(original_scope);
        scope.def = {};
        scope.parent = s;
        return scope;
    };

    var advance = function (id) {
        var a, o, t, v;
        if (id && token.id !== id) {
            token.error("Expected '" + id + "'.");
        }
        if (token_nr >= tokens.length) {
            token = symbol_table["(end)"];
            return token;
        }
        t = tokens[token_nr];
        token_nr += 1;
        v = t.value;
        a = t.type;
        if (a === "name") {
            o = scope.find(v);
        } else if (a === "operator") {
            o = symbol_table[v];
            if (!o) {
                t.error("Unknown operator.");
            }
        } else if (a === "string" || a ===  "number") {
            o = symbol_table["(literal)"];
            a = "literal";
        } else {
            t.error("Unexpected token.");
        }
        token = Object.create(o);
        token.from  = t.from;
        token.to    = t.to;
        token.value = v;
        token.arity = a;
        return token;
    };

    var expression = function (rbp) {
        var left;
        var t = token;
        advance();
        left = t.nud();
        while (rbp < token.lbp) {
            t = token;
            advance();
            left = t.led(left);
        }
        return left;
    };

    var original_symbol = {
        nud: function () {
            this.error("Undefined.");
        },
        led: function (left) {
            this.error("Missing operator.");
        },
        error: function (s) {
            var t = new Error(s);
            t.name = "SyntaxError";
            throw t;
        }
    };

    var symbol = function (id, bp) {
        var s = symbol_table[id];
        bp = bp || 0;
        if (s) {
            if (bp >= s.lbp) {
                s.lbp = bp;
            }
        } else {
            s = Object.create(original_symbol);
            s.id = s.value = id;
            s.lbp = bp;
            symbol_table[id] = s;
        }
        return s;
    };

    var constant = function (s, v) {
        var x = symbol(s);
        x.nud = function () {
            scope.reserve(this);
            this.value = symbol_table[this.id].value;
            this.arity = "literal";
            return this;
        };
        x.value = v;
        return x;
    };

    var infix = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp);
            this.arity = "binary";
            return this;
        };
        return s;
    };

    var infixr = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp - 1);
            this.arity = "binary";
            return this;
        };
        return s;
    };

    var assignment = function (id) {
        return infixr(id, 20, function (left) {
            if (left.id !== "[" && left.arity !== "name") {
                left.error("Bad lvalue.");
            }
            this.first = left;
            this.second = expression(11);
            this.assignment = true;
            this.arity = "binary";
            return this;
        });
    };

    var prefix = function (id, nud) {
        var s = symbol(id);
        s.nud = nud || function () {
            scope.reserve(this);
            this.first = expression(80);
            this.arity = "unary";
            return this;
        };
        return s;
    };

    var stmt = function (s, f) {
        var x = symbol(s);
        x.std = f;
        return x;
    };

    symbol("(end)");
    symbol("(name)").nud = itself;

    symbol(":");
    symbol(")");
    symbol("]");
    symbol("}");
    symbol(",");

    constant("true", true);
    constant("false", false);
    constant("null", null);
    constant("undefined", undefined);
    constant("pi", Math.PI);
    constant("e", Math.E);

    symbol("(literal)").nud = itself;

    symbol("this").nud = function () {
        scope.reserve(this);
        this.arity = "this";
        return this;
    };

    infix(";", 10, function (left) {
        if (token.id === "}" || token.id === "(end)") {
            return left;
        }
        this.first = left;
        this.second = expression(0);
        this.arity = "binary"
        return this;
    });

    assignment("=");
    assignment("+=");
    assignment("-=");
    assignment("*=");
    assignment("/=");

    infix("?", 30, function (left) {
        this.first = left;
        this.second = expression(0);
        advance(":");
        this.third = expression(11);
        this.arity = "ternary";
        return this;
    });

    infixr("&&", 40);
    infixr("||", 40);

    infixr("==", 50);
    infixr("!=", 50);
    infixr("<", 50);
    infixr("<=", 50);
    infixr(">", 50);
    infixr(">=", 50);

    infix("+", 60);
    infix("-", 60);

    infix("*", 70);
    infix("/", 70);

    infixr("^", 90);

    infix("[", 100, function (left) {
        this.first = left;
        this.second = expression(0);
        this.arity = "binary";
        advance("]");
        return this;
    });

    infix("(", 100, function (left) {
        var a = [];
        this.arity = "binary";
        this.first = left;
        this.second = a;
        if (left.arity !== "unary" && left.arity !== "function" &&
                left.arity !== "name" && left.id !== "(" &&
                left.id !== "&&" && left.id !== "||" && left.id !== "?") {
            left.error("Expected a variable name.");
        }

        if (token.id !== ")") {
            while (true)  {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance(")");
        return this;
    });

    prefix("!");
    prefix("-");

    prefix("(", function () {
        var e = expression(0);
        advance(")");
        return e;
    });

    prefix("@", function () {
        this.arity = "name";
        this.value = "@";
        if (!scope.has(this)) {
            scope.define(this);
        }
        return this;
    });

    prefix("function", function () {
        var a = [];
        new_scope();
        if (token.arity === "name") {
            scope.define(token);
            this.name = token.value;
            advance();
        }
        advance("(");
        if (token.id !== ")") {
            while (true) {
                if (token.arity !== "name") {
                    token.error("Expected a parameter name.");
                }
                scope.define(token);
                a.push(token);
                advance();
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        this.first = a;
        advance(")");
        advance("{");
        this.second = expression(0);
        advance("}");
        this.arity = "function";
        this.locals = scope.locals();
        scope.pop();
        return this;
    });

    prefix("[", function () {
        var a = [];
        if (token.id !== "]") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance("]");
        this.first = a;
        this.arity = "unary";
        return this;
    });

    prefix("{", function () {
        var a = [], n, v;
        if (token.id !== "}") {
            while (true) {
                n = token;
                if (n.arity !== "name" && n.arity !== "literal") {
                    token.error("Bad property name.");
                }
                advance();
                advance(":");
                v = expression(0);
                v.key = n.value;
                a.push(v);
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance("}");
        this.first = a;
        this.arity = "unary";
        return this;
    });

    prefix("var", function () {
        var n;
        n = token;
        if (n.arity !== "name" || n.value === "@") {
            n.error("Expected a new variable name.");
        }
        scope.define(n);
        advance();
        this.first = n;
        if (token.id === "=") {
            advance("=");
            this.second = expression(11);
            this.arity = "binary";
        }
        else {
            this.arity = "var";
        }

        return this;
    });

    function Scope(parent, values) {
        if (!(this instanceof Scope)) {
            return new Scope(parent, values);
        }
        values = values || {};
        this.parent = parent;

        this.inherit = function() {
            return Scope(this);
        };
        this.get = function (n) {
            if (values.hasOwnProperty(n)) {
                return values[n];
            }
            else if (this.parent) {
                return this.parent.get(n);
            }
            else {
                throw new Error('"' + n + '" is not defined.');
            }
        };
        this.has = function (n) {
            if (values.hasOwnProperty(n)) {
                return true;
            }
            return !!this.parent && this.parent.has(n);
        };
        this.set = function (n, v) {
            if (values.hasOwnProperty(n)) {
                values[n] = v;
            }
            else if (this.parent) {
                this.parent.set(n, v);
            }
            else {
                values[n] = v;
            }
        };
        this.define = function (n) {
            values[n] = undefined;
        };
    }
    Parser.Scope = Scope;

    function Expression(s) {
        this.simplify = function (values) {
            return new Expression(simplify(s, Scope(null, values)));
        };

        this.substitute = function (variable, expr) {
            throw new Error("Not implemented");
        };

        this.evaluate = function (values) {
            if (!(values instanceof Scope)) {
                values = Scope(null, values);
            }
            return evaluate(s, values);
        };

        this.toString = function (toJS) {
            return stringify(s, toJS);
        };

        this.variables = function () {
            return new Error("Not imeplemented");
        };

        this.toJSFunction = function (param, variables) {
            return new Error("Not imeplemented");
            //return new Function(param, "with(Parser.values) { return " + this.simplify(variables).toString(true) + "; }");
        };
        this.toJSON = function() {
            return {
                key: s.key,
                name: s.name,
                message: s.message,
                value: s.value,
                arity: s.arity,
                first: s.first,
                second: s.second,
                third: s.third,
                fourth: s.fourth,
                locals: s.locals
            };
        };
    }
    Parser.Expression = Expression;

    this.parse = function (source) {
        tokens = source.tokens('=<>!+-*&|/%^', '=<>&|');
        token_nr = 0;
        new_scope();
        advance();
        var s = expression(0);
        advance("(end)");
        scope.pop();

        return new Expression(s);
    };
};

Parser.parse = function(s) {
    return new Parser().parse(s);
};

Parser.parse = function(s, variables) {
    return Parser.parse(s).evaluate(variables);
};

if (typeof exports === 'object') {
    exports.Parser = Parser;
}