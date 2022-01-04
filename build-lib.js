import esbuildWat from './esbuild-wat.js';

let files = ['wasm.js', 'wasm-threads.js', 'js-threads.js'];

esbuildWat(files, {outdir: 'dist'});
