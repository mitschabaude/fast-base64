import {toBytes, toBase64} from './dist/base64-wasm.js';
import {
  toBytes as toBytesNoSimd,
  toBase64 as toBase64NoSimd,
} from './base64-wasm-small.js';
import {toBytes as toBytesJs, toBase64 as toBase64Js} from './base64-js.js';
import {
  toBytes as toBytesThreads,
  toBase64 as toBase64Threads,
} from './dist/base64-wasm-threads.js';
import {
  toBytes as toBytesJsThreads,
  toBase64 as toBase64JsThreads,
} from './dist/base64-js-threads.js';
import {
  toBytes as toBytesSmallest,
  toBase64 as toBase64Smallest,
} from './base64-nano.js';
import {
  toBase64Simple,
  toBytesSimple,
  toBytesCharCodeAt,
  toBytesStringLookup,
  toBytesDataUri,
  toBase64DataUri,
  toBase64StringLookup,
} from './base64-alternative.js';
import {toUrl, fromUrl} from './url.js';

const n = 1000000;
let decoder = new TextDecoder();
let encoder = new TextEncoder();

(async () => {
  await checkCorrectness();

  let start;
  let [base64, bytes] = randomBase64(n);

  start = performance.now();
  encoder.encodeInto(base64, new Uint8Array(base64.length));
  console.log(
    `baseline: TextEncoder.encodeInto ${(performance.now() - start).toFixed(
      2
    )} ms`
  );

  start = performance.now();
  await toBytes(base64);
  console.log(
    `base64 to bytes (wasm) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBytesNoSimd(base64);
  console.log(
    `base64 to bytes (wasm, no simd) ${(performance.now() - start).toFixed(
      2
    )} ms`
  );

  start = performance.now();
  await toBytesThreads(base64);
  console.log(
    `base64 to bytes (wasm threads) ${(performance.now() - start).toFixed(
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
  await toBytesJsThreads(base64);
  console.log(
    `base64 to bytes (js threads) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBytesStringLookup(base64);
  console.log(
    `base64 to bytes (js string) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBytesDataUri(base64);
  console.log(
    `base64 to bytes (js datauri) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBytesSmallest(base64);
  console.log(
    `base64 to bytes (js smallest) ${(performance.now() - start).toFixed(2)} ms`
  );
  console.log('===========');

  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const encodeLookup = Object.fromEntries(
    Array.from(alphabet).map((a, i) => [i, a.charCodeAt(0)])
  );
  let m = bytes.length;
  let k = m % 3;
  let nn = Math.floor(m / 3) * 4 + (k && k + 1);
  let N = Math.ceil(m / 3) * 4;
  let encoded = new Uint8Array(N);
  for (let i = 0, j = 0; j < m; i += 4, j += 3) {
    let y = (bytes[j] << 16) + (bytes[j + 1] << 8) + (bytes[j + 2] | 0);
    encoded[i] = encodeLookup[y >> 18];
    encoded[i + 1] = encodeLookup[(y >> 12) & 0x3f];
    encoded[i + 2] = encodeLookup[(y >> 6) & 0x3f];
    encoded[i + 3] = encodeLookup[y & 0x3f];
  }
  let encodedBytes = new Uint8Array(encoded.buffer, 0, nn);

  start = performance.now();
  decoder.decode(encodedBytes);
  console.log(
    `baseline: TextDecoder.decode ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBase64(bytes);
  console.log(
    `bytes to base64 (wasm) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBase64NoSimd(bytes);
  console.log(
    `bytes to base64 (wasm, no simd) ${(performance.now() - start).toFixed(
      2
    )} ms`
  );

  start = performance.now();
  await toBase64Threads(bytes);
  console.log(
    `bytes to base64 (wasm threads) ${(performance.now() - start).toFixed(
      2
    )} ms`
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

  start = performance.now();
  await toBase64JsThreads(bytes);
  console.log(
    `bytes to base64 (js threads) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBase64StringLookup(bytes);
  console.log(
    `bytes to base64 (js string) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  await toBase64DataUri(bytes);
  console.log(
    `bytes to base64 (js datauri) ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  toBase64Smallest(bytes);
  console.log(
    `bytes to base64 (js smallest) ${(performance.now() - start).toFixed(2)} ms`
  );
  console.log('===========');

  start = performance.now();
  let base64Url = toUrl(base64);
  console.log(
    `base64 to base64url ${(performance.now() - start).toFixed(2)} ms`
  );

  start = performance.now();
  fromUrl(base64Url);
  console.log(
    `base64url to base64 ${(performance.now() - start).toFixed(2)} ms`
  );
})();

function randomBase64(n) {
  const randomBytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }
  return [toBase64Simple(randomBytes), randomBytes];
}

async function checkCorrectness() {
  for (let i = 0; i < 10; i++) {
    let [base64, bytes] = randomBase64(Math.ceil(Math.random() * 100));
    encoder.encode(base64);
    decoder.decode(bytes);
    let bytes1 = toBytesSimple(base64);
    let bytes2 = toBytesJs(base64);
    let [, bytes3, , bytes4] = await Promise.all([
      toBytesNoSimd(base64),
      toBytesNoSimd(base64),
      toBytes(base64),
      toBytes(base64),
    ]);
    let bytes5 = await toBytesJsThreads(base64);
    if (
      Array.from(bytes1).some((x, i) => x !== bytes2[i]) ||
      Array.from(bytes1).some((x, i) => x !== bytes2[i])
    ) {
      console.log('correct', bytes1);
      console.log('ours/js', bytes2);
      throw Error('not equal');
    }
    if (
      bytes4.length !== bytes1.length ||
      Array.from(bytes1).some((x, i) => x !== bytes4[i])
    ) {
      console.log('correct', bytes1.toString());
      console.log('ours/wa', bytes4.toString());
      throw Error('not equal');
    }
    if (
      bytes3.length !== bytes1.length ||
      Array.from(bytes1).some((x, i) => x !== bytes3[i])
    ) {
      console.log('correct', bytes1.toString());
      console.log('ours/wa', bytes4.toString());
      throw Error('not equal');
    }
    if (
      bytes5.length !== bytes5.length ||
      Array.from(bytes1).some((x, i) => x !== bytes5[i])
    ) {
      console.log('correct', bytes1.toString());
      console.log('ours/js-threads', bytes5.toString());
      throw Error('not equal');
    }
    let [, base641, base642, base643] = await Promise.all([
      toBase64NoSimd(bytes),
      toBase64NoSimd(bytes),
      toBase64Js(bytes),
      toBase64JsThreads(bytes),
    ]);
    if (base641 !== base64) {
      console.log('correct', base64);
      console.log('ours/wa', base641);
      throw Error('not equal');
    }
    if (base642 !== base64) {
      console.log('correct', base64);
      console.log('ours/js', base642);
      throw Error('not equal');
    }
    if (base643 !== base64) {
      console.log('correct', base64);
      console.log('ours/js-threads', base643);
      throw Error('not equal');
    }
  }
}
