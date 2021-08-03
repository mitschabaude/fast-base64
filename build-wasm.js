import {toBase64} from './base64-js.js';
import fs from 'fs/promises';
import wasmInline from './wasm-inline.js';

let files = [
  'wat/base64.wat',
  'wat/base64-threads.wat',
  'wat/base64-simd.wat',
  'wat/base64-simd-threads.wat',
];

// files.forEach(file => wasmInline(file));

files.forEach(async file => {
  let {bytes, path} = await wasmInline(file);
  let base64 = toBase64(bytes);
  await fs.writeFile(path + '.js', `export default "${base64}";`);
});
