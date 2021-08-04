import {getWatModule, allocate, memory} from './wasm-deno.js';

const n = 1000000;

const alphabet = '0123456789abcdef';
const lookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [a.charCodeAt(0), i])
);
const encoder = new TextEncoder();

(async () => {
  let testHex = '000102030405060708090a0b0c0d0e0f1011121314';
  // let testHex = '1400002141000012';
  // let testHex = '11ff';
  await toBytes(testHex, true);
  let bytes1 = await toBytes(testHex);
  let bytes2 = toBytesJs(testHex);
  if (
    Array.from(bytes1).some((a, i) => a !== bytes2[i]) ||
    Array.from(bytes2).some((a, i) => a !== bytes1[i])
  ) {
    console.log(bytes1);
    console.log(bytes2);
    throw Error();
  }
  let start;
  const hex = randomHex(n);

  start = performance.now();
  toBytesJs(hex);
  console.log(`hex to bytes (js) ${(performance.now() - start).toFixed(2)} ms`);

  start = performance.now();
  await toBytes(hex);
  console.log(
    `hex to bytes (wasm + alloc) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBytes(hex);
  console.log(
    `hex to bytes (wasm) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBytes(hex, true);
  console.log(
    `hex to bytes (wasm, no simd) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBytesJs(hex);
  console.log(`hex to bytes (js) ${(performance.now() - start).toFixed(2)} ms`);
})();

function randomHex(n) {
  let str = '';
  for (let i = 0; i < n; i++) {
    str += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return str;
}

async function toBytes(str, noSimd) {
  const {hex2bytes} = noSimd
    ? await getWatModule('hex.wat')
    : await getWatModule('hex-simd.wat');
  const n = str.length;
  if (n % 2 === 1) throw Error('hex string must be of even length');
  allocate(n);

  const encoded = new Uint8Array(memory.buffer, 0, n);

  // encoder.encodeInto(str, encoded); // SLOW! :(
  let encodedTmp = encoder.encode(str);
  encoded.set(encodedTmp);

  // let start = performance.now();
  hex2bytes(n);
  // console.log(`wasm FUNCTION: ${(performance.now() - start).toFixed(2)} ms`);
  const decoded = new Uint8Array(memory.buffer, 0, n >> 1);
  return decoded;
}

function toBytesJs(str) {
  const n = str.length;
  const encoded = encoder.encode(str);

  let j = 0;
  for (let i = 0; i < n; i += 2, j++) {
    // let m = lookup[encoded[i + 0]];
    // let k = lookup[encoded[i + 1]];
    let m = encoded[i + 0];
    let k = encoded[i + 1];
    m -= 48 + (m > 64) * 39;
    k -= 48 + (k > 64) * 39;
    encoded[j] = 16 * m + k;
  }
  return new Uint8Array(encoded.buffer, 0, j);
}
