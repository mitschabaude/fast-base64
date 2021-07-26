import base64SimdWasm from './wat/base64-simd.wat';
import base64Wasm from './wat/base64.wat';
import {importWasm} from './wasm-import.js';

export {toBytes, toBase64};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function toBytes(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1;
  let m = (n >> 2) * 3 + k;

  const {base642bytes, memory} = await importWasm(base64SimdWasm, {
    allocate: n,
    fallback: base64Wasm,
  });

  let encoded = new Uint8Array(memory, 0, n);
  encoder.encodeInto(base64, encoded);

  base642bytes(n);
  return new Uint8Array(memory, 0, m);
}

async function toBase64(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;

  const {bytes2base64, memory} = await importWasm(base64SimdWasm, {
    allocate: N + M,
    fallback: base64Wasm,
  });
  let decoded = new Uint8Array(memory, 0, M);
  decoded.set(bytes);
  decoded[m] = 0;
  decoded[m + 1] = 0;

  bytes2base64(m, M);

  let encoded = new Uint8Array(memory, M, n);
  let base64 = decoder.decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  return base64;
}
