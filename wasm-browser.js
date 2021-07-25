import {toBytesJs} from './base64';

// tools for using small wasm modules in the browser
// TODO: dispose instance (but keep compiled module) if needed memory is too large
// TODO: needing to pass a name is a bit clumsy, but I'm afraid of using a huge string as key

export {getModule, isModuleReady};

const memory = new WebAssembly.Memory({initial: 0});
const wasmPromises = {};

function isModuleReady(name) {
  return name in wasmPromises;
}

async function getModule(name, wasmCodeBase64, {allocate, fallback}) {
  let wasmPromise = wasmPromises[name];
  if (wasmPromise === undefined) {
    let wasmCode = toBytesJs(wasmCodeBase64);
    let imports = {memory, log: console.log};
    wasmPromise = WebAssembly.instantiate(wasmCode, {imports}).catch(err => {
      if (fallback === undefined) throw err;
      console.error(err);
      console.log('falling back to version without experimental feature');
      wasmCode = toBytesJs(fallback);
      return WebAssembly.instantiate(wasmCode, {imports});
    });
    wasmPromises[name] = wasmPromise;
  }
  let wasmExports = (await wasmPromise).instance.exports;
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
