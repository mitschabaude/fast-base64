import base64SimdWasm from './wat/base64-simd.wat';
import base64Wasm from './wat/base64.wat';
import {allocate, free, wrap} from './wasm-tools.js';

export {toBytes, toBase64};

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const wasmModule = wrap(base64SimdWasm, {fallback: base64Wasm});

async function toBytes(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1;
  let m = (n >> 2) * 3 + k;

  let [memory, view] = allocate(n + 16);
  const {base642bytes} = await wasmModule({imports: {memory}});

  let bytes = new Uint8Array(memory.buffer, view.byteOffset, n);
  encoder.encodeInto(base64, bytes);

  base642bytes(bytes.byteOffset, bytes.byteOffset + n);
  let decoded = bytes.slice(0, m);
  free(memory, view);
  return decoded;
}

async function toBase64(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;

  let [memory, view] = allocate(N + M);
  const {bytes2base64} = await wasmModule({imports: {memory}});

  let decoded = new Uint8Array(memory.buffer, view.byteOffset, M);
  decoded.set(bytes);
  decoded[m] = 0;
  decoded[m + 1] = 0;

  bytes2base64(view.byteOffset, view.byteOffset + m, view.byteOffset + M);

  let encoded = new Uint8Array(memory.buffer, view.byteOffset + M, n);
  let base64 = decoder.decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  free(memory, view);
  return base64;
}
