// rollup.config.js (CommonJS syntax)
module.exports = {
  input: 'index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'exprEval',
    exports: 'named'
  },
  plugins: []
};
