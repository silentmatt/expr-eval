import { Instruction, INUMBER, IOP1, IOP2, IOP3, IVAR, IVARNAME, IEXPR, IMEMBER } from './instruction';

export default function simplify(tokens, unaryOps, binaryOps, ternaryOps, values) {
  var nstack = [];
  var newexpression = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      nstack.push(item);
    } else if (type === IVAR && values.hasOwnProperty(item.value)) {
      item = new Instruction(INUMBER, values[item.value]);
      nstack.push(item);
    } else if (type === IOP2 && nstack.length > 1) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = binaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value, n2.value));
      nstack.push(item);
    } else if (type === IOP3 && nstack.length > 2) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(n1.value ? n2.value : n3.value);
      } else {
        f = ternaryOps[item.value];
        item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value));
        nstack.push(item);
      } else if (type === IVAR && values.hasOwnProperty(item.value)) {
        item = new Instruction(INUMBER, values[item.value]);
        nstack.push(item);
      } else if (type === IOP2 && nstack.length > 1) {
        n2 = nstack.pop();
        n1 = nstack.pop();
        f = binaryOps[item.value];
        item = new Instruction(INUMBER, f(n1.value, n2.value));
        nstack.push(item);
      } else if (type === IOP3 && nstack.length > 2) {
        n3 = nstack.pop();
        n2 = nstack.pop();
        n1 = nstack.pop();
        if (item.value === '?') {
          nstack.push(n1.value ? n2.value : n3.value);
        } else {
          f = ternaryOps[item.value];
          item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value));
          nstack.push(item);
        }
      } else if (type === IOP1 && nstack.length > 0) {
        n1 = nstack.pop();
        f = unaryOps[item.value];
        item = new Instruction(INUMBER, f(n1.value));
        nstack.push(item);
      } else if (type === IEXPR) {
      var simplified = simplify(item.value, unaryOps, binaryOps, ternaryOps, values);
      if(simplified.length === 1 && simplified[0].type === INUMBER) {
        nstack.push(simplified[0]);
      }
      else {
        while (nstack.length > 0) {
          newexpression.push(nstack.shift());
        }
          newexpression.push(new Instruction(IEXPR, simplified));
        }
      } else if (type === IMEMBER && nstack.length > 0) {
        n1 = nstack.pop();
        nstack.push(new Instruction(INUMBER, n1.value[item.value]));
      } else {
        while (nstack.length > 0) {
          newexpression.push(nstack.shift());
        }
        newexpression.push(item);
      }
    }
    while (nstack.length > 0) {
      newexpression.push(nstack.shift());
    }
    return newexpression;
  }
