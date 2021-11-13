export type Value = number
    | string
    | boolean
    | ValueFunction
    | Value[]
    | { [propertyName: string]: Value };

export interface Values {
    [propertyName: string]: Value;
}

export type ValueFunction = ((...args: any[]) => Value)

export interface ParserOptions {
  allowMemberAccess?: boolean;
  operators?: {
    add?: boolean,
    comparison?: boolean,
    concatenate?: boolean,
    conditional?: boolean,
    divide?: boolean,
    factorial?: boolean,
    logical?: boolean,
    multiply?: boolean,
    power?: boolean,
    remainder?: boolean,
    subtract?: boolean,
    sin?: boolean,
    cos?: boolean,
    tan?: boolean,
    asin?: boolean,
    acos?: boolean,
    atan?: boolean,
    sinh?: boolean,
    cosh?: boolean,
    tanh?: boolean,
    asinh?: boolean,
    acosh?: boolean,
    atanh?: boolean,
    sqrt?: boolean,
    log?: boolean,
    ln?: boolean,
    lg?: boolean,
    log10?: boolean,
    abs?: boolean,
    ceil?: boolean,
    floor?: boolean,
    round?: boolean,
    trunc?: boolean,
    exp?: boolean,
    length?: boolean,
    in?: boolean,
    random?: boolean,
    min?: boolean,
    max?: boolean,
    assignment?: boolean,
    fndef?: boolean,
    array?: boolean
    cbrt?: boolean,
    expm1?: boolean,
    log1p?: boolean,
    sign?: boolean,
    log2?: boolean
  };
}

export class Parser {
    constructor(options?: ParserOptions);
    unaryOps: {[name: string]: ((arg: any) => Value)};
    functions: {[name: string]: ValueFunction};
    consts: Values;
    parse(expression: string): Expression;
    evaluate(expression: string, values?: Values): Value;
    static parse(expression: string): Expression;
    static evaluate(expression: string, values?: Values): Value;
}

export interface Expression {
    simplify(values?: Values): Expression;
    evaluate(values?: Values): Value;
    substitute(variable: string, value: Expression | string | number): Expression;
    symbols(options?: { withMembers?: boolean }): string[];
    variables(options?: { withMembers?: boolean }): string[];
    toJSFunction(params: string | string[], values?: Values): ValueFunction;
}
