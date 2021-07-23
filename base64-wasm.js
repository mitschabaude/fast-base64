import base64Wasm from './wasm/base64.wasm';
import base64SimdWasm from './wasm/base64-simd.wasm';
import {getModule} from './wasm-browser';

export {toBytes, toBase64};

const encoder = new TextEncoder();

async function toBytes(base64) {
  base64 = base64.replace(/=/g, ''); // this is super fast and does not hurt performance, simplifies logic
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1; // how many bytes the last base64 chunk encodes
  let m = (n >> 2) * 3 + k; // total encoded bytes

  const {base642bytes, memory} = await getModule('base64', base64SimdWasm, {
    allocate: n,
    fallback: base64Wasm,
  });

  let encoded = new Uint8Array(memory.buffer, 0, n);
  let tmp = encoder.encode(base64);
  encoded.set(tmp);

  base642bytes(n);
  return new Uint8Array(memory.buffer, 0, m);
}

async function toBase64(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;

  const {bytes2base64, memory} = await getModule('base64', base64SimdWasm, {
    allocate: M + N,
    fallback: base64Wasm,
  });

  let decoded = new Uint8Array(memory.buffer, 0, m);
  decoded.set(bytes);

  bytes2base64(m, M);

  let encoded = new Uint8Array(memory.buffer, M, n);
  let base64 = new TextDecoder().decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  return base64;
}
