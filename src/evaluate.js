import { INUMBER, IOP1, IOP2, IOP3, IVAR, IVARNAME, IFUNCALL, IFUNDEF, IEXPR, IEXPREVAL, IMEMBER, IENDSTATEMENT, IARRAY } from './instruction';

/**
 * Checks if a function reference 'f' is explicitly allowed to be executed.
 * This logic is the core security allowance gate.
 */
function isAllowedFunc(f, expr, values) {
  // function definition is included in registered functions
  if (Object.values(expr.functions).includes(f)) return true;

  for (const v of Object.values(values)) {
    if (typeof v === 'object' && v !== null) {
      for (const subV of Object.values(v)) {
        if (subV === f) {
          const SAFE_MATH = Object.freeze({
            abs: Math.abs,
            acos: Math.acos,
            asin: Math.asin,
            atan: Math.atan,
            atan2: Math.atan2,
            ceil: Math.ceil,
            clz32: Math.clz32,
            cos: Math.cos,
            exp: Math.exp,
            floor: Math.floor,
            imul: Math.imul,
            fround: Math.fround,
            f16round: Math.f16round,
            log: Math.log,
            max: Math.max,
            min: Math.min,
            pow: Math.pow,
            random: Math.random,
            round: Math.round,
            sin: Math.sin,
            sqrt: Math.sqrt,
            tan: Math.tan,
            log10: Math.log10,
            log2: Math.log2,
            log1p: Math.log1p,
            expm1: Math.expm1,
            cosh: Math.cosh,
            sinh: Math.sinh,
            tanh: Math.tanh,
            acosh: Math.acosh,
            asinh: Math.asinh,
            atanh: Math.atanh,
            hypot: Math.hypot,
            trunc: Math.trunc,
            sign: Math.sign,
            cbrt: Math.cbrt
          });
          // allow Math functions
          for (var key of Object.getOwnPropertyNames(SAFE_MATH)) {
            if (SAFE_MATH[key] === subV) return true;
          }
          // function definition is included in registered functions
          return Object.values(expr.functions).includes(subV);
        }
      }
    }
  }
  return false;
}

export default function evaluate(tokens, expr, values) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;

  if (isExpressionEvaluator(tokens)) {
    return resolveExpression(tokens, values);
  }

  var numTokens = tokens.length;

  for (var i = 0; i < numTokens; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === 'and') {
        nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
      } else if (item.value === 'or') {
        nstack.push(n1 ? true : !!evaluate(n2, expr, values));
      } else if (item.value === '=') {
        f = expr.binaryOps[item.value];
        nstack.push(f(n1, evaluate(n2, expr, values), values));
      } else {
        f = expr.binaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.ternaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
      }
    } else if (type === IVAR) {
      if (/^__proto__|prototype|constructor$/.test(item.value)) {
        throw new Error('prototype access detected');
      }
      if (item.value in expr.functions) {
        nstack.push(expr.functions[item.value]);
      } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
        nstack.push(expr.unaryOps[item.value]);
      } else {
        var v = values[item.value];

        if (v !== undefined) {
          if (typeof v === 'function' && !isAllowedFunc(v, expr, values)) {
            /* function is not registered, not marked safe, and not a member function. BLOCKED. */
            throw new Error('Variable references an unallowed function: ' + item.value);
          }
          nstack.push(v);
        } else {
          throw new Error('undefined variable: ' + item.value);
        }
      }
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = expr.unaryOps[item.value];
      nstack.push(f(resolveExpression(n1, values)));
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(resolveExpression(nstack.pop(), values));
      }
      f = nstack.pop();
      if (!isAllowedFunc(f, expr, values)) {
        throw new Error('Is not an allowed function.');
      }
      if (f.apply && f.call) {
        nstack.push(f.apply(undefined, args));
      } else {
        throw new Error(f + ' is not a function');
      }
    } else if (type === IFUNDEF) {
      // Create closure to keep references to arguments and expression
      nstack.push((function () {
        var n2 = nstack.pop();
        var args = [];
        var argCount = item.value;
        while (argCount-- > 0) {
          args.unshift(nstack.pop());
        }
        var n1 = nstack.pop();
        var f = function () {
          var scope = Object.assign({}, values);
          for (var i = 0, len = args.length; i < len; i++) {
            scope[args[i]] = arguments[i];
          }
          return evaluate(n2, expr, scope);
        };
        expr.functions['lambda_' + expr.functions.__counter++] = f;
        values[n1] = f;
        return f;
      })());
    } else if (type === IEXPR) {
      nstack.push(createExpressionEvaluator(item, expr, values));
    } else if (type === IEXPREVAL) {
      nstack.push(item);
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      if (/^__proto__|prototype|constructor$/.test(item.value)) {
        throw new Error('prototype access detected in MEMBER');
      }
      if (
        typeof n1 === 'object' &&
        typeof n1[item.value] === 'function' &&
        !isAllowedFunc(n1[item.value], expr, values)
      ) {
        throw new Error('Is not an allowed function in MEMBER.');
      }
      nstack.push(n1[item.value]);
    } else if (type === IENDSTATEMENT) {
      nstack.pop();
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push(args);
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    throw new Error('invalid Expression (parity)');
  }
  // Explicitly return zero to avoid test issues caused by -0
  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
}

function createExpressionEvaluator(token, expr, values) {
  if (isExpressionEvaluator(token)) return token;
  return {
    type: IEXPREVAL,
    value: function (scope) {
      return evaluate(token.value, expr, scope);
    }
  };
}

function isExpressionEvaluator(n) {
  return n && n.type === IEXPREVAL;
}

function resolveExpression(n, values) {
  return isExpressionEvaluator(n) ? n.value(values) : n;
}
