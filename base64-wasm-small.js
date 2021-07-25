export {toBytes, toBase64};

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const bytesPerPage = 65536;
let memory = new WebAssembly.Memory({initial: 0});

let wasm64 =
  'AGFzbQEAAAABCgJgAX8AYAJ/fwACEwEHaW1wb3J0cwZtZW1vcnkCAAADAwIAAQcfAgxiYXNlNjQyYnl0' +
  'ZXMAAAxieXRlczJiYXNlNjQAAQqzBAKUAgEDfwNAIAMgAkEDai0AACIBQQRqIAFBwABLQcUAbGsgAUHg' +
  'AEtBBmxrIAFBK0ZBD2xqIAFBL0ZBDGxqIAItAAAiAUEEaiABQcAAS0HFAGxrIAFB4ABLQQZsayABQStG' +
  'QQ9saiABQS9GQQxsakESdCACQQFqLQAAIgFBBGogAUHAAEtBxQBsayABQeAAS0EGbGsgAUErRkEPbGog' +
  'AUEvRkEMbGpBDHRyIAJBAmotAAAiAUEEaiABQcAAS0HFAGxrIAFB4ABLQQZsayABQStGQQ9saiABQS9G' +
  'QQxsakEGdHJyIgFBEHY6AAAgA0EBaiABQQh2OgAAIANBAmogAToAACADQQNqIQMgAkEEaiICIABJDQAL' +
  'C5oCAQN/A0AgASADQQJqLQAAIAMtAABBEHQgA0EBai0AAEEIdHJyIgRBEnYiAkHBAGogAkEZS0EGbGog' +
  'AkEzS0HLAGxrIAJBPkZBD2xrIAJBP0ZBDGxrOgAAIAFBAWogBEEMdkE/cSICQcEAaiACQRlLQQZsaiAC' +
  'QTNLQcsAbGsgAkE+RkEPbGsgAkE/RkEMbGs6AAAgAUECaiAEQQZ2QT9xIgJBwQBqIAJBGUtBBmxqIAJB' +
  'M0tBywBsayACQT5GQQ9sayACQT9GQQxsazoAACABQQNqIARBP3EiAkHBAGogAkEZS0EGbGogAkEzS0HL' +
  'AGxrIAJBPkZBD2xrIAJBP0ZBDGxrOgAAIAFBBGohASADQQNqIgMgAEkNAAsL';

// meta: base64-decode the base64 decoder
// this takes ~0.2ms
let wasmStr = atob(wasm64);
let wasmBytes = new Uint8Array(
  [...wasmStr].map((_, i) => wasmStr.charCodeAt(i))
);

// wasm takes ~1-2ms to instantiate
let wasmModule = WebAssembly.compile(wasmBytes);
let wasmInstance = wasmModule.then(m =>
  WebAssembly.instantiate(m, {imports: {memory}})
);

async function toBytes(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1;
  let m = (n >> 2) * 3 + k;

  let {base642bytes} = (await wasmInstance).exports;

  allocate(n);
  let encoded = new Uint8Array(memory.buffer, 0, n);
  encoder.encodeInto(base64, encoded);

  base642bytes(n);
  free();
  return new Uint8Array(memory.buffer, 0, m);
}

async function toBase64(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;

  let {bytes2base64} = (await wasmInstance).exports;

  allocate(M + N);
  let decoded = new Uint8Array(memory.buffer, 0, M);
  decoded.set(bytes);
  decoded[m] = 0;
  decoded[m + 1] = 0;

  bytes2base64(m, M);

  let encoded = new Uint8Array(memory.buffer, M, n);
  let base64 = decoder.decode(encoded);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  free();
  return base64;
}

function allocate(n) {
  if (n > memory.buffer.byteLength) {
    memory.grow(Math.ceil((n - memory.buffer.byteLength) / bytesPerPage));
  }
}
function free() {
  if (memory.buffer.byteLength < 1e6) return;
  setTimeout(async () => {
    memory = new WebAssembly.Memory({initial: 0});
    wasmInstance = WebAssembly.instantiate(await wasmModule, {
      imports: {memory},
    });
  }, 0);
}
