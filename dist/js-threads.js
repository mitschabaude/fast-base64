// inline-worker:__inline-worker
function inlineWorker(scriptText) {
  let blob = new Blob([scriptText], { type: "text/javascript" });
  let url = URL.createObjectURL(blob);
  let worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

// js.worker.js
function Worker2() {
  return inlineWorker('function u(t){postMessage([-1,!0,Object.keys(t)]),addEventListener("message",async({data:[e,r,i]})=>{try{let l=await t[r](...i),o=w([l]);postMessage([e,!0,l],o)}catch(l){postMessage([e,!1,""+l])}})}function w(t){let e=[];for(let r of t)r instanceof ArrayBuffer||r instanceof MessagePort||globalThis.ImageBitmap&&r instanceof ImageBitmap||globalThis.OffscreenCanvas&&r instanceof OffscreenCanvas?e.push(r):ArrayBuffer.isView(r)&&r.buffer instanceof ArrayBuffer&&e.push(r.buffer);return e}var b=new TextEncoder,g=new TextDecoder;function p(t){t=t.replace(/=/g,"");let e=t.length,r=e%4,i=r&&r-1,l=(e>>2)*3+i,o=new Uint8Array(e+3);b.encodeInto(t+"===",o);for(let n=0,s=0;n<e;n+=4,s+=3){let a=(f[o[n]]<<18)+(f[o[n+1]]<<12)+(f[o[n+2]]<<6)+f[o[n+3]];o[s]=a>>16,o[s+1]=a>>8&255,o[s+2]=a&255}return new Uint8Array(o.buffer,0,l)}function d(t){let e=t.length,r=e%3,i=Math.floor(e/3)*4+(r&&r+1),l=Math.ceil(e/3)*4,o=new Uint8Array(l);for(let s=0,a=0;a<e;s+=4,a+=3){let c=(t[a]<<16)+(t[a+1]<<8)+(t[a+2]|0);o[s]=m[c>>18],o[s+1]=m[c>>12&63],o[s+2]=m[c>>6&63],o[s+3]=m[c&63]}let n=g.decode(new Uint8Array(o.buffer,0,i));return r===1&&(n+="=="),r===2&&(n+="="),n}var h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=Object.fromEntries(Array.from(h).map((t,e)=>[t.charCodeAt(0),e]));f["=".charCodeAt(0)]=0;f["-".charCodeAt(0)]=62;f["_".charCodeAt(0)]=63;var m=Object.fromEntries(Array.from(h).map((t,e)=>[e,t.charCodeAt(0)]));u({toBytes:p,toBase64:d});\n');
}

// util.js
function concat(...arrays) {
  if (!arrays.length)
    return null;
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  let result = new Uint8Array(totalLength);
  let length = 0;
  for (let array of arrays) {
    result.set(array, length);
    length += array.length;
  }
  return result;
}

// worker-tools.js
async function workerImport(worker, knownImports) {
  let id = 0;
  let promises = {};
  promises[-1] = !knownImports && Resolvable();
  worker.addEventListener("message", ({ data: [id2, isSuccess, result] }) => {
    if (isSuccess)
      promises[id2]?.resolve(result);
    else
      promises[id2]?.reject(result);
    delete promises[id2];
  });
  let imports = knownImports ?? await promises[-1].promise;
  const caller = (funcName) => (...args) => {
    let thisId = id++;
    promises[thisId] = Resolvable();
    let transfer = getTransferables(args);
    worker.postMessage([thisId, funcName, args], transfer);
    return promises[thisId].promise;
  };
  return Object.fromEntries(imports.map((name) => [name, caller(name)]));
}
function Resolvable() {
  let resolvable = {};
  resolvable.promise = new Promise((resolve, reject) => {
    resolvable.resolve = resolve;
    resolvable.reject = reject;
  });
  return resolvable;
}
function getTransferables(args) {
  let transfer = [];
  for (let x of args) {
    if (x instanceof ArrayBuffer || x instanceof MessagePort || globalThis.ImageBitmap && x instanceof ImageBitmap || globalThis.OffscreenCanvas && x instanceof OffscreenCanvas) {
      transfer.push(x);
    } else if (ArrayBuffer.isView(x) && x.buffer instanceof ArrayBuffer) {
      transfer.push(x.buffer);
    }
  }
  return transfer;
}

// js-threads.js
var nWorkers = 4;
var workerImports = Promise.all(new Array(nWorkers).fill(0).map(() => workerImport(Worker2())));
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
  let parts = await Promise.all(slices.map(([j0, j1], i) => workers[i].toBytes(base64.slice(j0, j1))));
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
  let parts = await Promise.all(slices.map(([j0, j1], i) => workers[i].toBase64(bytes.slice(j0, j1))));
  return parts.join("");
}
export {
  toBase64,
  toBytes
};
