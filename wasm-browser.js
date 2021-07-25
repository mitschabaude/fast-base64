import {toBytesJs} from './base64';

// tools for using small wasm modules in the browser
// TODO: needing to pass a name is a bit clumsy, but I'm afraid of using a huge string as key

export {getModule, free};

let memory = new WebAssembly.Memory({initial: 0});
let modules = {};
let instances = {};

async function getModule(name, wasmCodeBase64, {allocate, fallback}) {
  let instance = instances[name];
  if (instance === undefined) {
    let imports = {memory, log: console.log};
    let module = modules[name];
    if (module) {
      console.time('recover instance from module');
      instance = WebAssembly.instantiate(await module, {imports});
      instance.then(() => console.timeEnd('recover instance from module'));
    } else {
      console.time('decode wasm bytes');
      let wasmCode = toBytesJs(wasmCodeBase64);
      console.timeEnd('decode wasm bytes');
      console.time('full instantiate');
      let promise = WebAssembly.instantiate(wasmCode, {imports}).catch(err => {
        if (fallback === undefined) throw err;
        console.error(err);
        console.log('falling back to version without experimental feature');
        wasmCode = toBytesJs(fallback);
        return WebAssembly.instantiate(wasmCode, {imports});
      });
      modules[name] = promise.then(r => r.module);
      instance = promise.then(r => r.instance);
      instance.then(() => console.timeEnd('full instantiate'));
    }
    instances[name] = instance;
  }
  let wasmExports = (await instance).exports;
  if (allocate !== undefined) {
    allocateMemory(allocate);
  }
  return {...wasmExports, memory};
}

const bytesPerPage = 65536;
function allocateMemory(n) {
  if (n > memory.buffer.byteLength) {
    const missingPages = Math.ceil(
      (n - memory.buffer.byteLength) / bytesPerPage
    );
    memory.grow(missingPages);
  }
}
function free() {
  if (memory.buffer.byteLength < 1e6) return;
  setTimeout(() => {
    memory = new WebAssembly.Memory({initial: 0});
    instances = {};
  }, 0);
}
