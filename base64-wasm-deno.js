import {getWatModule, allocate, memory, getWasmModule} from './deno-wasm.js';
export {toBytes, toBase64};

const encoder = new TextEncoder();

async function toBytes(base64, noSimd) {
  const {base642bytes} = await getWatModule(
    noSimd ? 'wat/base64-like-js.wat' : 'wat/base64-simd.wat'
  );
  // const {base642bytes} = await getWasmModule(
  //   noSimd ? 'wasm/base64.wasm' : 'wasm/base64-simd.wasm'
  // );
  base64 = base64.replace(/=/g, ''); // this is super fast and does not hurt performance, simplifies logic
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1; // how many bytes the last base64 chunk encodes
  let m = (n >> 2) * 3 + k; // total encoded bytes

  allocate(n);
  let encoded = new Uint8Array(memory.buffer, 0, n);
  let tmp = encoder.encode(base64);
  encoded.set(tmp);

  base642bytes(n);
  return new Uint8Array(memory.buffer, 0, m);
}

async function toBase64(bytes) {
  const {bytes2base64} = await getWatModule('wat/base64-simd.wat');
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;

  allocate(M + N);
  let decoded = new Uint8Array(memory.buffer, 0, m);
  decoded.set(bytes);

  bytes2base64(m, M);

  let encoded = new Uint8Array(memory.buffer, M, n);
  let base64 = new TextDecoder().decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  return base64;
}
