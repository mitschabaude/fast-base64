import base64SimdWasm from './wat/base64-simd-threads.wat';
import base64Wasm from './wat/base64.wat';
import {wrap} from './wasm-tools.js';
import {workerExport} from './worker-tools';

workerExport({toBytes, toBase64});

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const wasmModule = wrap(base64SimdWasm, {fallback: base64Wasm});

async function toBytes(memory, view, base64) {
  let n = base64.length;
  const {base642bytes} = await wasmModule({imports: {memory}});
  let bytes = new Uint8Array(memory.buffer, view.byteOffset, n);
  bytes.set(encoder.encode(base64));
  base642bytes(bytes.byteOffset, bytes.byteOffset + n);
}

async function toBase64(memory, view) {
  let m = view.byteLength - 2;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  const {bytes2base64} = await wasmModule({imports: {memory}});

  let decoded = new Uint8Array(memory.buffer, view.byteOffset, M);
  decoded[m] = 0;
  decoded[m + 1] = 0;
  bytes2base64(view.byteOffset, view.byteOffset + m, view.byteOffset + M);

  let encoded = new Uint8Array(memory.buffer, view.byteOffset + M, n).slice();
  let base64 = decoder.decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  return base64;
}
