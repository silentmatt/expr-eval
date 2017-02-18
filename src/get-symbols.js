import { IVAR, IEXPR } from './instruction';
import contains from './contains';

export default function getSymbols(tokens, symbols) {
  for (var i = 0, L = tokens.length; i < L; i++) {
    var item = tokens[i];
    if (item.type === IVAR && !contains(symbols, item.value)) {
      symbols.push(item.value);
    } else if (item.type === IEXPR) {
      getSymbols(item.value, symbols);
    }
  }
}
