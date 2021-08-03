import esbuildWat from './esbuild-wat.js';

let files = [
  'base64-wasm.js',
  'base64-wasm-threads.js',
  'base64-js-threads.js',
];

esbuildWat(files, {outdir: 'dist'});
