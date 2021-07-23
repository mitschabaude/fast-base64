/* eslint-env node */
import wabt from 'wabt';
import binaryen from 'binaryen';
import fs from 'fs';
import {fileURLToPath} from 'url';

export {wasmInline as default};

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  wasmInline(process.argv[2]);
}

async function wasmInline(wasmPath) {
  // can be called with either .wat or .wasm path
  // creates or overwrites the .wasm with functions inlined
  let isWasm = wasmPath.indexOf('.wasm') !== -1;
  let isWat = wasmPath.indexOf('.wat') !== -1;
  if (!isWat && !isWasm) {
    console.error('ERROR: must provide .wasm or .wat file as first argument');
    process.exit(1);
  }

  let wasmBinary;
  if (isWat) {
    let watText = fs.readFileSync(wasmPath, {encoding: 'utf8'});
    wasmPath = wasmPath.replace('wat/', 'wasm/').replace('.wat', '.wasm');
    let wabtModule = (await wabt()).parseWat(wasmPath, watText, {simd: true});
    wasmBinary = wabtModule.toBinary({}).buffer;
  } else {
    wasmBinary = fs.readFileSync(wasmPath);
  }
  let module = binaryen.readBinary(wasmBinary);

  // force function inlining
  binaryen.setOptimizeLevel(3);
  binaryen.setShrinkLevel(0);
  binaryen.setFlexibleInlineMaxSize(1000000000);
  module.runPasses(['inlining-optimizing']);
  // module.optimize();

  wasmBinary = module.emitBinary();
  fs.writeFileSync(wasmPath, wasmBinary);
  return {bytes: wasmBinary, path: wasmPath};
}
