// tools for using small wasm modules in the browser, deno and node
// uses a single shared Memory which is only replaced when it gets too large to avoid memory leaks
// pro: avoids most re-instantiations => faster
// con: need to manually free() memory after using => more code, more fragility
export {wrap, instantiate, allocate, free};
const W = WebAssembly;

let modules = {};
let instances = {};

function wrap(base64, {fallback}) {
  let id = Math.random().toString();
  return importObject => {
    return instantiate(id, base64, importObject, fallback);
  };
}

async function instantiate(id, base64, importObject = {}, fallback) {
  let instance = instances[id];
  // we have to create a new instance if either it never existed,
  // or was garbage collected, or the imports changed
  if (
    instance === undefined ||
    !importObjectEqual(importObject, instance.importObject)
  ) {
    let compiled = modules[id];
    if (compiled) {
      // console.time('recover instance from module');
      instance = compiled.then(mod => W.instantiate(mod, importObject));
      // instance.then(() => console.timeEnd('recover instance from module'));
    } else {
      // console.time('full instantiate');
      let wasmCode = toBytesJs(base64);
      let promise = W.instantiate(wasmCode, importObject).catch(err => {
        if (fallback === undefined) throw err;
        console.error(err);
        console.log('falling back to version without experimental feature');
        wasmCode = toBytesJs(fallback.base64);
        return W.instantiate(wasmCode, importObject);
      });
      modules[id] = promise.then(r => r.module);
      instance = promise.then(r => r.instance);
      // instance.then(() => console.timeEnd('full instantiate'));
    }
    instance.importObject = importObject;
    instances[id] = instance;
  } else {
    // console.log('can use existing instance');
  }
  return (await instance).exports;
  // return {...wasmExports, memory};
}

// memory management
let memory = new W.Memory({initial: 1});
let offsets = [0]; // indices in memory.buffer until where functions have claimed memory
const MAX_PERSISTENT_BYTES = 1e6;
const bytesPerPage = 65536;

function allocate(n) {
  let lastOffset = offsets[offsets.length - 1];
  if (lastOffset + n > memory.buffer.byteLength) {
    const missingPages = Math.ceil(
      (lastOffset + n - memory.buffer.byteLength) / bytesPerPage
    );
    memory.grow(missingPages);
  }
  offsets.push(lastOffset + n);
  // console.log('allocating', lastOffset, lastOffset + n);
  return [memory, {byteOffset: lastOffset, byteLength: n}];
}

// convenience wrapper for memory allocation
// BEWARE: this is a leaky abstraction, because memory.grow makes the underlying buffer unusable,
// so the array can never be assumed to survive an await
// function allocateUint8(n) {
//   let [memory, view] = allocate(n);
//   return [memory, new Uint8Array(memory.buffer, view.byteOffset, n)];
// }

function free(myMemory, {byteOffset: start, byteLength: n}) {
  if (myMemory !== memory) {
    // myMemory won't be used by new function calls => no need to free
    return;
  }
  let i = offsets.indexOf(start + n);
  if (i !== -1) offsets.splice(i, 1);
  if (memory.buffer.byteLength >= MAX_PERSISTENT_BYTES) {
    // let memory be garbage collected after current consumers dispose references
    // => have to replace memory AND instances which hold a reference to memory
    setTimeout(() => {
      memory = new W.Memory({initial: 1});
      offsets = [0];
      instances = {};
    }, 0);
  }
}

// helpers

function importObjectEqual(a, b) {
  let keys = Object.keys(a);
  let length = keys.length;
  for (let i = 0; i < length; i++) {
    if (!objectEqual(a[keys[i]], b[keys[i]])) return false;
  }
  return length === Object.keys(b).length;
}

function objectEqual(a, b) {
  if (a === b) return true;
  let keys = Object.keys(a);
  let length = keys.length;
  for (let i = 0; i < length; i++) {
    if (a[keys[i]] !== b[keys[i]]) return false;
  }
  return length === Object.keys(b).length;
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
