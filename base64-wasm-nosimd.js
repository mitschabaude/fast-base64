import base64Wasm from './wasm/base64.wasm';
import {getModule} from './wasm-browser';

export {toBytesNoSimd, toBase64NoSimd};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function toBytesNoSimd(base64) {
  base64 = base64.replace(/=/g, ''); // this is super fast and does not hurt performance, simplifies logic
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1; // how many bytes the last base64 chunk encodes
  let m = (n >> 2) * 3 + k; // total encoded bytes

  const {base642bytes, memory} = await getModule('base64-nosimd', base64Wasm, {
    allocate: n,
  });

  let encoded = new Uint8Array(memory.buffer, 0, n);
  encoder.encodeInto(base64, encoded);

  base642bytes(n);
  return new Uint8Array(memory.buffer, 0, m);
}

async function toBase64NoSimd(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;

  const {bytes2base64, memory} = await getModule('base64-nosimd', base64Wasm, {
    allocate: M + N,
  });

  let decoded = new Uint8Array(memory.buffer, 0, m);
  decoded.set(bytes);

  bytes2base64(m, M);

  let encoded = new Uint8Array(memory.buffer, M, n);
  let base64 = decoder.decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  return base64;
}
