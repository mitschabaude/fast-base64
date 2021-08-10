// wat/base64-simd.wat
var base64_simd_default = "AGFzbQEAAAABDAJgAn9/AGADf39/AAITAQdpbXBvcnRzBm1lbW9yeQIAAAMDAgABBx8CDGJhc2U2NDJieXRlcwAADGJ5dGVzMmJhc2U2NAABCo4FAsUCAgJ/AXsgACECIAAhAwNAIAL9AAQAIQQgBEEE/Q/9biAEQcAA/Q/9KEHFAP0P/U79cSAEQeAA/Q/9KEEG/Q/9Tv1xIARBK/0P/SNBD/0P/U79biAEQS/9D/0jQQz9D/1O/W4hBCAE/Qw/AAAAPwAAAD8AAAA/AAAA/U5BAv2rASAE/QwAMAAAADAAAAAwAAAAMAAA/U5BDP2tAf1QIAT9DAAPAAAADwAAAA8AAAAPAAD9TkEE/asBIAT9DAAAPAAAADwAAAA8AAAAPAD9TkEK/a0B/VD9UCAE/QwAAAMAAAADAAAAAwAAAAMA/U5BBv2rASAE/QwAAAA/AAAAPwAAAD8AAAA//U5BCP2tAf1Q/VD9DAABAgQFBggJCgwNDhAQEBD9DiEEIAMgBP0LBAAgAkEQaiECIANBDGohAyACIAFJDQALC8QCAgJ/AXsgAiEDIAAhBANAIAT9AAQA/QwAAQIQAwQFEAYHCBAJCgsQ/Q4hBSAF/Qz8AAAA/AAAAPwAAAD8AAAA/U5BAv2tASAF/QwDAAAAAwAAAAMAAAADAAAA/U5BDP2rASAF/QwA8AAAAPAAAADwAAAA8AAA/U5BBP2tAf1Q/VAgBf0MAA8AAAAPAAAADwAAAA8AAP1OQQr9qwEgBf0MAADAAAAAwAAAAMAAAADAAP1OQQb9rQH9UP1QIAX9DAAAPwAAAD8AAAA/AAAAPwD9TkEI/asB/VAhBSAFQcEA/Q/9biAFQRn9D/0oQQb9D/1O/W4gBUEz/Q/9KEHLAP0P/U79cSAFQT79D/0jQQ/9D/1O/XEgBUE//Q/9I0EM/Q/9Tv1xIQUgAyAF/QsEACADQRBqIQMgBEEMaiEEIAQgAUkNAAsL";

// wat/base64.wat
var base64_default = "";

// wasm-tools.js
var W = WebAssembly;
var modules = {};
var instances = {};
function wrap(base64, { fallback }) {
  let id = Math.random().toString();
  return (importObject) => {
    return instantiate(id, base64, importObject, fallback);
  };
}
async function instantiate(id, base64, importObject = {}, fallback) {
  let instance = instances[id];
  if (instance === void 0 || !importObjectEqual(importObject, instance.importObject)) {
    let compiled = modules[id];
    if (compiled) {
      instance = compiled.then((mod) => W.instantiate(mod, importObject));
    } else {
      let wasmCode = toBytesJs(base64);
      let promise = W.instantiate(wasmCode, importObject).catch((err) => {
        if (fallback === void 0)
          throw err;
        console.error(err);
        console.log("falling back to version without experimental feature");
        wasmCode = toBytesJs(fallback);
        return W.instantiate(wasmCode, importObject);
      });
      modules[id] = promise.then((r) => r.module);
      instance = promise.then((r) => r.instance);
    }
    instance.importObject = importObject;
    instances[id] = instance;
  } else {
  }
  return (await instance).exports;
}
var memory = new W.Memory({ initial: 1 });
var offsets = [0];
var MAX_PERSISTENT_BYTES = 1e6;
var bytesPerPage = 65536;
function allocate(n) {
  let lastOffset = offsets[offsets.length - 1];
  if (lastOffset + n > memory.buffer.byteLength) {
    const missingPages = Math.ceil((lastOffset + n - memory.buffer.byteLength) / bytesPerPage);
    memory.grow(missingPages);
  }
  offsets.push(lastOffset + n);
  return [memory, { byteOffset: lastOffset, byteLength: n }];
}
function free(myMemory, { byteOffset: start, byteLength: n }) {
  if (myMemory !== memory) {
    return;
  }
  let i = offsets.indexOf(start + n);
  if (i !== -1)
    offsets.splice(i, 1);
  if (memory.buffer.byteLength >= MAX_PERSISTENT_BYTES) {
    setTimeout(() => {
      memory = new W.Memory({ initial: 1 });
      offsets = [0];
      instances = {};
    }, 0);
  }
}
function importObjectEqual(a, b) {
  let keys = Object.keys(a);
  let length = keys.length;
  for (let i = 0; i < length; i++) {
    if (!objectEqual(a[keys[i]], b[keys[i]]))
      return false;
  }
  return length === Object.keys(b).length;
}
function objectEqual(a, b) {
  if (a === b)
    return true;
  let keys = Object.keys(a);
  let length = keys.length;
  for (let i = 0; i < length; i++) {
    if (a[keys[i]] !== b[keys[i]])
      return false;
  }
  return length === Object.keys(b).length;
}
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = Object.fromEntries(Array.from(alphabet).map((a, i) => [a.charCodeAt(0), i]));
lookup[61] = 0;
function toBytesJs(base64) {
  base64 = base64.replace(/=/g, "");
  let n = base64.length;
  let rem = n % 4;
  let m = (n >> 2) * 3 + (rem && rem - 1);
  let encoded = new TextEncoder().encode(base64 + "===");
  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    let x = (lookup[encoded[i]] << 18) + (lookup[encoded[i + 1]] << 12) + (lookup[encoded[i + 2]] << 6) + lookup[encoded[i + 3]];
    encoded[j] = x >> 16;
    encoded[j + 1] = x >> 8 & 255;
    encoded[j + 2] = x & 255;
  }
  return new Uint8Array(encoded.buffer, 0, m);
}

// base64-wasm.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var wasmModule = wrap(base64_simd_default, { fallback: base64_default });
async function toBytes(base64) {
  base64 = base64.replace(/=/g, "");
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1;
  let m = (n >> 2) * 3 + k;
  let [memory2, view] = allocate(n + 16);
  const { base642bytes } = await wasmModule({ imports: { memory: memory2 } });
  let bytes = new Uint8Array(memory2.buffer, view.byteOffset, n);
  encoder.encodeInto(base64, bytes);
  base642bytes(bytes.byteOffset, bytes.byteOffset + n);
  let decoded = bytes.slice(0, m);
  free(memory2, view);
  return decoded;
}
async function toBase64(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let M = m + 2;
  let N = Math.ceil(m / 3) * 4;
  let [memory2, view] = allocate(N + M);
  const { bytes2base64 } = await wasmModule({ imports: { memory: memory2 } });
  let decoded = new Uint8Array(memory2.buffer, view.byteOffset, M);
  decoded.set(bytes);
  decoded[m] = 0;
  decoded[m + 1] = 0;
  bytes2base64(view.byteOffset, view.byteOffset + m, view.byteOffset + M);
  let encoded = new Uint8Array(memory2.buffer, view.byteOffset + M, n);
  let base64 = decoder.decode(encoded);
  if (k === 1)
    base64 += "==";
  if (k === 2)
    base64 += "=";
  free(memory2, view);
  return base64;
}
export {
  toBase64,
  toBytes
};
