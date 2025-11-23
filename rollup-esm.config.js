// rollup-esm.config.js (Converted to CommonJS)

// 1. Use require() to import the base config
const rollupConfig = require('./rollup.config.js');

// Create a copy of the base configuration object to avoid modifying it
// This is critical since 'rollupConfig' is a shared object.
const esmConfig = { ...rollupConfig };

// 2. Apply ESM-specific changes to the copied object
esmConfig.plugins = []; // No minification for the base ESM file
esmConfig.output = {
    ...rollupConfig.output,
    file: 'dist/index.mjs',
    format: 'esm'
};

// 3. Use module.exports to export the configuration
module.exports = esmConfig;
