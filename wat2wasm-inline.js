import wabt from 'wabt';
import binaryen from 'binaryen';
import fs from 'fs';

(async () => {
  let isWat = false;
  let wasmPath = process.argv[2];
  if (wasmPath.indexOf('.wasm') !== -1) {
    isWat = false;
  } else if (wasmPath.indexOf('.wat') !== -1) {
    isWat = true;
  } else {
    console.error('ERROR: must provide .wasm or .wat file as first argument');
    process.exit(1);
  }

  let module;
  if (isWat) {
    let wasmText = fs.readFileSync(wasmPath, {encoding: 'utf8'});
    wasmPath = wasmPath.replace('wat/', 'wasm/').replace('.wat', '.wasm');
    let wabtModule = (await wabt()).parseWat(wasmPath, wasmText, {simd: true});
    let wasmBinary = wabtModule.toBinary({}).buffer;
    module = binaryen.readBinary(wasmBinary);
  } else {
    let wasmBinary = fs.readFileSync(wasmPath);
    module = binaryen.readBinary(wasmBinary);
  }

  binaryen.setOptimizeLevel(3);
  binaryen.setShrinkLevel(0);
  binaryen.setFlexibleInlineMaxSize(10000000000000);
  module.runPasses(['inlining-optimizing']);
  // module.optimize();

  let wasmBinary = module.emitBinary();
  fs.writeFileSync(wasmPath, wasmBinary);
})();
