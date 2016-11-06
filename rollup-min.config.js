import rollupConfig from './rollup.config';
import uglify from 'rollup-plugin-uglify';

rollupConfig.plugins = [ uglify() ];
rollupConfig.dest = 'dist/bundle.min.js';

export default rollupConfig;
