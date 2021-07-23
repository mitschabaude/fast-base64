/* eslint-disable */
export {getWatModule, getWasmModule, allocate, memory};

const memory = new WebAssembly.Memory({initial: 0});
const wasmPromises = {};

const bytesPerPage = 65536;
function allocate(n) {
  if (n > memory.buffer.byteLength) {
    const missingPages = Math.ceil(
      (n - memory.buffer.byteLength) / bytesPerPage
    );
    console.log(
      `allocating ${missingPages * bytesPerPage} new bytes of memory`
    );
    memory.grow(missingPages);
  }
}

function getWasmModule(path) {
  let wasmPromise = wasmPromises[path];
  if (wasmPromise === undefined) {
    wasmPromise = (async () => {
      const wasmCode = await Deno.readFile(path);
      const {instance} = await WebAssembly.instantiate(wasmCode, {
        imports: {
          memory,
          log: console.log,
        },
      });
      return instance.exports;
    })();
    wasmPromises[path] = wasmPromise;
  }
  return wasmPromise;
}

function getWatModule(watPath, inlineFunctions = true) {
  let wasmPromise = wasmPromises[watPath];
  if (wasmPromise === undefined) {
    wasmPromise = (async () => {
      const wasmPath = watPath
        .replace('wat/', 'wasm/')
        .replace('.wat', '.wasm');
      console.log(wasmPath);

      if (inlineFunctions) {
        const p = Deno.run({
          cmd: ['node', 'wasm-inline.js', watPath],
        });
        await p.status();
      } else {
        const p = Deno.run({
          cmd: ['npx', 'wat2wasm', '--enable-all', watPath, '-o', wasmPath],
        });
        await p.status();
      }

      const wasmCode = await Deno.readFile(wasmPath);

      const {instance} = await WebAssembly.instantiate(wasmCode, {
        imports: {
          memory,
          log: console.log,
        },
      });
      return instance.exports;
    })();
    wasmPromises[watPath] = wasmPromise;
  }
  return wasmPromise;
}
