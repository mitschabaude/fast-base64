import wasmInline from './wasm-inline.js';

let files = ['wat/base64.wat', 'wat/base64-simd.wat'];

files.forEach(file => wasmInline(file));

// import {toBase64Js} from './base64.js';
// import fs from 'fs/promises';

// files.forEach(async file => {
//   let {bytes, path} = await wasmInline(file);
// let base64 = toBase64Js(bytes);
// await fs.writeFile(path + '.js', `export default "${base64}";`);
// });
