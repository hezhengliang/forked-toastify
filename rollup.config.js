import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
export default {
  input: 'lib/index.ts',
  output: [
    {
      file: 'dist/es.min.js',
      format: 'esm',
    },
    {
      file: 'dist/umd.min.js',
      format: 'umd',
      name: 'ForkedToast',
    },
  ],
  plugins: [
    typescript(), 
    terser(), 
  ],
};