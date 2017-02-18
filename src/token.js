export var TEOF = 'TEOF';
export var TOP = 'TOP';
export var TNUMBER = 'TNUMBER';
export var TSTRING = 'TSTRING';
export var TPAREN = 'TPAREN';
export var TCOMMA = 'TCOMMA';
export var TNAME = 'TNAME';

export function Token(type, value, line, column) {
  this.type = type;
  this.value = value;
  this.line = line;
  this.column = column;
}

Token.prototype.toString = function () {
  return this.type + ': ' + this.value;
};
