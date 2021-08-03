import Base64Worker from './base64-js.worker.js';
import {concat} from './util.js';
import {workerImport} from './worker-tools.js';

export {toBytes, toBase64};

let nWorkers = 4;

let workerImports = Promise.all(
  new Array(nWorkers).fill(0).map(() => workerImport(Base64Worker()))
);

async function toBytes(base64) {
  let n = base64.length;
  let k = Math.floor(n / nWorkers);
  k -= k % 4;

  let slices = new Array(nWorkers);
  for (let i = 0; i < nWorkers - 1; i++) {
    slices[i] = [i * k, (i + 1) * k];
  }
  slices[nWorkers - 1] = [(nWorkers - 1) * k, n];

  let workers = await workerImports;
  let parts = await Promise.all(
    slices.map(([j0, j1], i) => workers[i].toBytes(base64.slice(j0, j1)))
  );
  return concat(...parts);
}

async function toBase64(bytes) {
  let n = bytes.length;
  let k = Math.floor(n / nWorkers);
  k -= k % 3;

  let slices = new Array(nWorkers);
  for (let i = 0; i < nWorkers - 1; i++) {
    slices[i] = [i * k, (i + 1) * k];
  }
  slices[nWorkers - 1] = [(nWorkers - 1) * k, n];

  let workers = await workerImports;
  let parts = await Promise.all(
    slices.map(([j0, j1], i) => workers[i].toBase64(bytes.slice(j0, j1)))
  );
  return parts.join('');
}
