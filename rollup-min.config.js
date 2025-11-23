// rollup-min.config.js (Correct CommonJS Syntax)

// 1. Use require() to import the base config and the terser plugin
const rollupConfig = require('./rollup.config.js');
const terser = require('@rollup/plugin-terser');

// Create a shallow copy of the base configuration to avoid side effects
const minifiedConfig = {
    ...rollupConfig,
    // Ensure the output property is also copied, if it exists
    output: { ...rollupConfig.output }
};

// 2. Set the plugins to ONLY include the terser plugin
minifiedConfig.plugins = [ terser() ];

// 3. Update the file name
minifiedConfig.output.file = 'dist/bundle.min.js';

// 4. Use module.exports to export the configuration
module.exports = minifiedConfig;
