export var INUMBER = 'INUMBER';
export var IOP1 = 'IOP1';
export var IOP2 = 'IOP2';
export var IOP3 = 'IOP3';
export var IVAR = 'IVAR';
export var IFUNCALL = 'IFUNCALL';
export var IEXPR = 'IEXPR';
export var IMEMBER = 'IMEMBER';

export function Instruction(type, value) {
  this.type = type;
  this.value = (value !== undefined && value !== null) ? value : 0;
}

Instruction.prototype.toString = function () {
  switch (this.type) {
    case INUMBER:
    case IOP1:
    case IOP2:
    case IOP3:
    case IVAR:
      return this.value;
    case IFUNCALL:
      return 'CALL ' + this.value;
    case IMEMBER:
      return '.' + this.value;
    default:
      return 'Invalid Instruction';
  }
};

var unaryInstructionCache = {};
export function unaryInstruction(value) {
  var inst = unaryInstructionCache[value];
  if (!inst) {
    inst = unaryInstructionCache[value] = new Instruction(IOP1, value);
  }
  return inst;
}

var binaryInstructionCache = {};
export function binaryInstruction(value) {
  var inst = binaryInstructionCache[value];
  if (!inst) {
    inst = binaryInstructionCache[value] = new Instruction(IOP2, value);
  }
  return inst;
}

var ternaryInstructionCache = {};
export function ternaryInstruction(value) {
  var inst = ternaryInstructionCache[value];
  if (!inst) {
    inst = ternaryInstructionCache[value] = new Instruction(IOP3, value);
  }
  return inst;
}
