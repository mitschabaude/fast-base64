import {toBytesJs, toBase64Js} from './base64.js';
import {toBytes, toBase64} from './base64-wasm-deno.js';
import {
  toBase64Simple,
  toBytesSimple,
  toBytesCharCodeAt,
  toBytesStringLookup,
} from './base64-alternative.js';

const n = 1000000;

(async () => {
  // check correctness
  let [base64, bytes] = randomBase64(Math.ceil(Math.random() * 100));
  await toBytes(base64, true);
  let bytes1 = toBytesSimple(base64);
  let bytes2 = toBytesJs(base64);
  let bytes3 = await toBytes(base64);
  if (
    Array.from(bytes1).some((x, i) => x !== bytes2[i]) ||
    Array.from(bytes1).some((x, i) => x !== bytes2[i])
  ) {
    console.log('correct', bytes1);
    console.log('ours (js)', bytes2);
    throw Error('not equal');
  }
  if (
    Array.from(bytes1).some((x, i) => x !== bytes3[i]) ||
    Array.from(bytes3).some((x, i) => x !== bytes1[i])
  ) {
    console.log('correct', bytes1);
    console.log('ours (wasm)', bytes3);
    throw Error('not equal');
  }
  let base641 = await toBase64(bytes);
  let base642 = toBase64Js(bytes);
  if (base641 !== base64) {
    console.log('correct', base64);
    console.log('ours (wasm)', base641);
    throw Error('not equal');
  }
  if (base642 !== base64) {
    console.log('correct', base64);
    console.log('ours (js)', base642);
    throw Error('not equal');
  }

  let start;
  [base64, bytes] = randomBase64(n);

  start = performance.now();
  await toBytes(base64);
  console.log(
    `base64 to bytes (wasm) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBytes(base64);
  console.log(
    `base64 to bytes (wasm) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBytes(base64, true);
  console.log(
    `base64 to bytes (wasm, no simd) ${(performance.now() - start).toFixed(
      2
    )} ms`
  );

  start = performance.now();
  toBytesSimple(base64);
  console.log(
    `base64 to bytes (js simple) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBytesCharCodeAt(base64);
  console.log(
    `base64 to bytes (js charcode) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBytesJs(base64);
  console.log(
    `base64 to bytes (js fast) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBytesStringLookup(base64);
  console.log(
    `base64 to bytes (js string) ${(performance.now() - start).toFixed(2)} ms`
  );
  console.log('===========');

  start = performance.now();
  await toBase64(bytes);
  console.log(
    `bytes to base64 (wasm) ${(performance.now() - start).toFixed(2)} ms`
  );
  start = performance.now();
  toBase64Simple(bytes);
  console.log(
    `bytes to base64 (js simple) ${(performance.now() - start).toFixed(2)} ms`
  );
  start = performance.now();
  toBase64Js(bytes);
  console.log(
    `bytes to base64 (js fast) ${(performance.now() - start).toFixed(2)} ms`
  );
})();

function randomBase64(n) {
  const randomBytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }
  return [toBase64Simple(randomBytes), randomBytes];
}
