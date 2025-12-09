# Changelog

## [3.0.1] - 2025-12-07

### Added

- Additional fix for member access issue identified by @huydoppaz in https://github.com/silentmatt/expr-eval/issues/289 and advisory [CVE-2025-12735](https://github.com/advisories/GHSA-jc85-fpwf-qm7x), same as fix in previous version.

## [3.0.0] - 2025-11-07

### Added

- BREAKING: `.evaluate()` no longer allows arbitrary and potentially malicious context to be passed for custom function strings. Such functions need to be defined on `Parser.functions`, e.g. `Parser.functions.f = () => {}` rather than `.evaluate({ f: () => {} })`. This fixes [CVE-2025-12735](https://github.com/advisories/GHSA-jc85-fpwf-qm7x).
- BREAKING: add exports map to make usage with modern JS environments smoother, not requiring bundlers.
- BREAKING: require Node 16.9.0 minimum, to support `Object.hasOwn` which is safer than its predecessor `Object.prototype.hasOwnPropery`.

## [2.0.2] - 2019-09-28

### Added

- Added non-default exports when using the ES module format. This allows `import { Parser } from 'expr-eval'` to work in TypeScript. The default export is still available for backward compatibility.
- This fork publishes a security vulnerability fix for prototype pollution. This was committed to the origin project but never published to NPM.


## [2.0.1] - 2019-09-10

### Added

- Added the `if(condition, trueValue, falseValue)` function back. The ternary operator is still recommended if you need to only evaluate one branch, but we're keep this as an option at least for now.


## [2.0.0] - 2019-09-07

### Added

- Better support for arrays, including literals: `[ 1, 2, 3 ]` and indexing: `array[0]`
- New functions for arrays: `join`, `indexOf`, `map`, `filter`, and `fold`
- Variable assignment: `x = 4`
- Custom function definitions: `myfunction(x, y) = x * y`
- Evaluate multiple expressions by separating them with `;`
- New operators: `log2` (base-2 logarithm), `cbrt` (cube root), `expm1` (`e^x - 1`), `log1p` (`log(1 + x)`), `sign` (essentially `x == 0 ? 0 : x / abs x`)

### Changed

- `min` and `max` functions accept either a parameter list or a single array argument
- `in` operator is enabled by default. It can be disabled by passing { operators: `{ 'in': false } }` to the `Parser` constructor.
- `||` (concatenation operator) now supports strings and arrays

### Removed

- Removed the `if(condition, trueValue, falseValue)` function. Use the ternary conditional operator instead: `condition ? trueValue : falseValue`, or you can add it back easily with a custom function.
