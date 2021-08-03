export {workerExport, workerImport, inlineWorker};

// in worker:
// function myFunction(...) { ... }
// workerExport({myFunction});

// in main thread:
// let worker = new Worker(...);
// let {myFunction} = await workerImport(worker);
// let result = await myFunction(...);

function workerExport(functionExports) {
  // post the function keys under a special id
  postMessage([-1, true, Object.keys(functionExports)]);

  addEventListener('message', async ({data: [id, funcName, args]}) => {
    try {
      let result = await functionExports[funcName](...args);
      let transfer = getTransferables([result]);
      postMessage([id, true, result], transfer);
    } catch (err) {
      postMessage([id, false, '' + err]);
    }
  });
}

async function workerImport(worker, knownImports) {
  let id = 0;
  let promises = {};
  promises[-1] = !knownImports && Resolvable();

  worker.addEventListener('message', ({data: [id, isSuccess, result]}) => {
    if (isSuccess) promises[id]?.resolve(result);
    else promises[id]?.reject(result);
    delete promises[id];
  });
  let imports = knownImports ?? (await promises[-1].promise);

  const caller =
    funcName =>
    (...args) => {
      let thisId = id++;
      promises[thisId] = Resolvable();
      let transfer = getTransferables(args);
      worker.postMessage([thisId, funcName, args], transfer);
      return promises[thisId].promise;
    };

  return Object.fromEntries(imports.map(name => [name, caller(name)]));
}

function inlineWorker(scriptText, options) {
  let blob = new Blob([scriptText], {type: 'application/javascript'});
  let url = URL.createObjectURL(blob);
  let worker = new Worker(url, options);
  URL.revokeObjectURL(url);
  return worker;
}

// helpers

// Resolvable is a wrapper for a promise with resolve/reject exposed
// resolvable === {promise, resolve, reject}
function Resolvable() {
  let resolvable = {};
  resolvable.promise = new Promise((resolve, reject) => {
    resolvable.resolve = resolve;
    resolvable.reject = reject;
  });
  return resolvable;
}

function ResolvableWithTimeout({timeout} = {}) {
  let resolvable = {};
  resolvable.promise = new Promise((resolve, reject) => {
    if (timeout) {
      let timeoutId = setTimeout(
        () => reject(new Error(`Promise timed out after ${timeout}ms`)),
        timeout
      );
      resolvable.resolve = result => {
        clearTimeout(timeoutId);
        resolve(result);
      };
      resolvable.reject = result => {
        clearTimeout(timeoutId);
        reject(result);
      };
    } else {
      resolvable.resolve = resolve;
      resolvable.reject = reject;
    }
  });
  return resolvable;
}

// for transfering in postMessage
function getTransferables(args) {
  let transfer = [];
  for (let x of args) {
    if (
      x instanceof ArrayBuffer ||
      x instanceof MessagePort ||
      (globalThis.ImageBitmap && x instanceof ImageBitmap) ||
      (globalThis.OffscreenCanvas && x instanceof OffscreenCanvas)
    ) {
      // transfer transferable objects directly
      transfer.push(x);
    } else if (ArrayBuffer.isView(x) && x.buffer instanceof ArrayBuffer) {
      // transfer TypedArray's buffer if it's not a SharedArrayBuffer
      transfer.push(x.buffer);
    }
  }
  return transfer;
}
