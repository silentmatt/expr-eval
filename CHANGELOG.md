# Changelog

## [2.0.0] - 2019-09-07

### Added

- Better support for arrays, including literals: `[ 1, 2, 3 ]` and indexing: `array[0]`
- New functions for arrays: join, indexOf, map, filter, fold
- Variable assignment: `x = 4`
- Custom function definitions: `myfunction(x, y) = x * y`
- Evaluate multiple expressions by separating them with `;`
- New operators: log2 (base-2 log), cbrt (cube root), expm1 (e^x - 1), log1p (log[1+x]), sign (-1, 0, 1)

### Changed

- min and max functions accept either a parameter list or a single array argument
- `in` operator is enabled by default. It can be disabled by passing { operators: `{ 'in': false } }` to the `Parser` constructor.
- `||` (concatenation operator) now supports strings and arrays

### Removed

- if(condition, trueValue, falseValue) function. Use the ternary conditional operator instead: condition ? trueValue : falseValue

