// tools for using small wasm modules in the browser, deno and node
export {importWasm, allocate, free};
let {Memory, instantiate} = WebAssembly;

let memory = new Memory({initial: 1});
let modules = {};
let instances = {};

async function importWasm({id, base64}, {fallback, allocate: allocateN} = {}) {
  let instance = instances[id];
  if (instance === undefined) {
    let imports = {memory, log: console.log};
    let module = modules[id];
    if (module) {
      // console.time('recover instance from module');
      instance = instantiate(await module, {imports});
      // instance.then(() => console.timeEnd('recover instance from module'));
    } else {
      // console.time('decode wasm bytes');
      let wasmCode = toBytesJs(base64);
      // console.timeEnd('decode wasm bytes');
      // console.time('full instantiate');
      let promise = instantiate(wasmCode, {imports}).catch(err => {
        if (fallback === undefined) throw err;
        console.error(err);
        console.log('falling back to version without experimental feature');
        wasmCode = toBytesJs(fallback.base64);
        return instantiate(wasmCode, {imports});
      });
      modules[id] = promise.then(r => r.module);
      instance = promise.then(r => r.instance);
      // instance.then(() => console.timeEnd('full instantiate'));
    }
    instances[id] = instance;
  }
  let wasmExports = (await instance).exports;
  if (allocateN !== undefined) {
    allocate(allocateN);
    free();
  }
  return {...wasmExports, memory: memory.buffer};
}

// memory management
const bytesPerPage = 65536;

function allocate(n) {
  if (n > memory.buffer.byteLength) {
    const missingPages = Math.ceil(
      (n - memory.buffer.byteLength) / bytesPerPage
    );
    memory.grow(missingPages);
  }
  return memory.buffer;
}

function free() {
  if (memory.buffer.byteLength < 1e6) return;
  setTimeout(() => {
    memory = new Memory({initial: 1});
    instances = {};
  }, 0);
}

// fast cross-platform base64 decode
const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [a.charCodeAt(0), i])
);
lookup[61] = 0;
function toBytesJs(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;
  let rem = n % 4;
  let m = (n >> 2) * 3 + (rem && rem - 1);
  let encoded = new TextEncoder().encode(base64 + '===');
  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    let x =
      (lookup[encoded[i]] << 18) +
      (lookup[encoded[i + 1]] << 12) +
      (lookup[encoded[i + 2]] << 6) +
      lookup[encoded[i + 3]];
    encoded[j] = x >> 16;
    encoded[j + 1] = (x >> 8) & 0xff;
    encoded[j + 2] = x & 0xff;
  }
  return new Uint8Array(encoded.buffer, 0, m);
}
