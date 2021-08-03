import Base64Worker from './base64-wasm.worker.js';
import {workerImport} from './worker-tools.js';

export {toBytes, toBase64};

let nWorkers = 4;

let workerImports = Promise.all(
  new Array(nWorkers).fill(0).map(() => workerImport(Base64Worker()))
);

async function toBytes(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;

  let rem = n % 4;
  let k = rem && rem - 1;
  let m = (n >> 2) * 3 + k;

  let [memory, view] = allocate(n + nWorkers * 16);

  let j = Math.floor(n / nWorkers);
  j -= j % 4;

  let slices = new Array(nWorkers);
  for (let i = 0; i < nWorkers - 1; i++) {
    slices[i] = [i * j, (i + 1) * j];
  }
  slices[nWorkers - 1] = [(nWorkers - 1) * j, n];

  let workers = await workerImports;
  await Promise.all(
    slices.map(([j0, j1], i) => {
      let workerView = {
        byteLength: j1 - j0 + 16,
        byteOffset: view.byteOffset + j0 + i * 16,
      };
      let base64Worker = base64.slice(j0, j1);
      return workers[i].toBytes(memory, workerView, base64Worker);
    })
  );

  let bytes = new Uint8Array(memory.buffer, view.byteOffset, n);
  let decoded = bytes.slice(0, m);
  free(memory, view);
  return decoded;
}

async function toBase64(bytes) {
  let m = bytes.length;
  let N = Math.ceil(m / 3) * 4;

  let [memory, view] = allocate(N + m + 2 * nWorkers);

  let j = Math.floor(m / nWorkers);
  j -= j % 3;

  let slices = new Array(nWorkers);
  for (let i = 0; i < nWorkers - 1; i++) {
    slices[i] = [i * j, (i + 1) * j];
  }
  slices[nWorkers - 1] = [(nWorkers - 1) * j, m];

  let workers = await workerImports;
  let parts = await Promise.all(
    slices.map(([j0, j1], i) => {
      let workerView = {
        byteLength: j1 - j0 + 2,
        byteOffset: view.byteOffset + j0 + i * 2,
      };
      return workers[i].toBase64(memory, workerView, bytes.slice(j0, j1));
    })
  );
  free(memory, view);
  return parts.join('');
}

// memory stuff

const bytesPerPage = 65536;
const MAX_PERSISTENT_BYTES = 1e6;
let memory = new WebAssembly.Memory({
  initial: 1,
  maximum: 1024,
  shared: true,
});
let offsets = [0]; // indices in memory.buffer until where functions have claimed memory

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
      memory = new WebAssembly.Memory({
        initial: 1,
        maximum: 1024,
        shared: true,
      });
      offsets = [0];
    }, 0);
  }
}
