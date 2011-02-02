var parser2 = require('./parse');

var line;
var parser = new parser2.Parser();
var scope = new parser2.Parser.Scope();

while (system.stdout.write("> "), line = system.stdin.readLine().trim()) {
    var expr = parser.parse(line);
    print(expr.simplify().toString());
    print("=", expr.evaluate(scope));
}
