import { IVAR, IMEMBER, IEXPR } from './instruction';
import contains from './contains';

export default function getSymbols(tokens, symbols, with_members) {
  var hold_var = null;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    if (item.type === IVAR && !contains(symbols, item.value)) {
      if (hold_var !== null || !with_members) {
        symbols.push(item.value);
      } else {
        hold_var = item.value;
      }
    } else if (item.type === IMEMBER && with_members && hold_var !== null) {
      hold_var += '.' + item.value;
    } else if (item.type === IEXPR) {
      getSymbols(item.value, symbols, with_members);
    } else if (hold_var !== null) {
      if (!contains(symbols, hold_var)) {
        symbols.push(hold_var);
      }
      hold_var = null;
    }
  }
}
