// inline-worker:__inline-worker
function inlineWorker(scriptText) {
  let blob = new Blob([scriptText], { type: "text/javascript" });
  let url = URL.createObjectURL(blob);
  let worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

// wasm.worker.js
function Worker2() {
  return inlineWorker('var u="AGFzbQEAAAABDAJgAn9/AGADf39/AAIVAQdpbXBvcnRzBm1lbW9yeQIDAIAIAwMCAAEHHwIMYmFzZTY0MmJ5dGVzAAAMYnl0ZXMyYmFzZTY0AAEKjgUCxQICAn8BeyAAIQIgACEDA0AgAv0ABAAhBCAEQQT9D/1uIARBwAD9D/0oQcUA/Q/9Tv1xIARB4AD9D/0oQQb9D/1O/XEgBEEr/Q/9I0EP/Q/9Tv1uIARBL/0P/SNBDP0P/U79biEEIAT9DD8AAAA/AAAAPwAAAD8AAAD9TkEC/asBIAT9DAAwAAAAMAAAADAAAAAwAAD9TkEM/a0B/VAgBP0MAA8AAAAPAAAADwAAAA8AAP1OQQT9qwEgBP0MAAA8AAAAPAAAADwAAAA8AP1OQQr9rQH9UP1QIAT9DAAAAwAAAAMAAAADAAAAAwD9TkEG/asBIAT9DAAAAD8AAAA/AAAAPwAAAD/9TkEI/a0B/VD9UP0MAAECBAUGCAkKDA0OEBAQEP0OIQQgAyAE/QsEACACQRBqIQIgA0EMaiEDIAIgAUkNAAsLxAICAn8BeyACIQMgACEEA0AgBP0ABAD9DAABAhADBAUQBgcIEAkKCxD9DiEFIAX9DPwAAAD8AAAA/AAAAPwAAAD9TkEC/a0BIAX9DAMAAAADAAAAAwAAAAMAAAD9TkEM/asBIAX9DADwAAAA8AAAAPAAAADwAAD9TkEE/a0B/VD9UCAF/QwADwAAAA8AAAAPAAAADwAA/U5BCv2rASAF/QwAAMAAAADAAAAAwAAAAMAA/U5BBv2tAf1Q/VAgBf0MAAA/AAAAPwAAAD8AAAA/AP1OQQj9qwH9UCEFIAVBwQD9D/1uIAVBGf0P/ShBBv0P/U79biAFQTP9D/0oQcsA/Q/9Tv1xIAVBPv0P/SNBD/0P/U79cSAFQT/9D/0jQQz9D/1O/XEhBSADIAX9CwQAIANBEGohAyAEQQxqIQQgBCABSQ0ACws=";var b="AGFzbQEAAAABDAJgAn9/AGADf39/AAITAQdpbXBvcnRzBm1lbW9yeQIAAAMDAgABBx8CDGJhc2U2NDJieXRlcwAADGJ5dGVzMmJhc2U2NAABCrcEApgCAQJ/IAAhAwNAIAMgAEEDai0AACICQQRqIAJBwABLQcUAbGsgAkHgAEtBBmxrIAJBK0ZBD2xqIAJBL0ZBDGxqIAAtAAAiAkEEaiACQcAAS0HFAGxrIAJB4ABLQQZsayACQStGQQ9saiACQS9GQQxsakESdCAAQQFqLQAAIgJBBGogAkHAAEtBxQBsayACQeAAS0EGbGsgAkErRkEPbGogAkEvRkEMbGpBDHRyIABBAmotAAAiAkEEaiACQcAAS0HFAGxrIAJB4ABLQQZsayACQStGQQ9saiACQS9GQQxsakEGdHJyIgJBEHY6AAAgA0EBaiACQQh2OgAAIANBAmogAjoAACADQQNqIQMgAEEEaiIAIAFJDQALC5oCAQJ/A0AgAiAAQQJqLQAAIAAtAABBEHQgAEEBai0AAEEIdHJyIgRBEnYiA0HBAGogA0EZS0EGbGogA0EzS0HLAGxrIANBPkZBD2xrIANBP0ZBDGxrOgAAIAJBAWogBEEMdkE/cSIDQcEAaiADQRlLQQZsaiADQTNLQcsAbGsgA0E+RkEPbGsgA0E/RkEMbGs6AAAgAkECaiAEQQZ2QT9xIgNBwQBqIANBGUtBBmxqIANBM0tBywBsayADQT5GQQ9sayADQT9GQQxsazoAACACQQNqIARBP3EiA0HBAGogA0EZS0EGbGogA0EzS0HLAGxrIANBPkZBD2xrIANBP0ZBDGxrOgAAIAJBBGohAiAAQQNqIgAgAUkNAAsL";var i=WebAssembly,m={},j={};function y(r,{fallback:n}){let e=Math.random().toString();return s=>w(e,r,s,n)}async function w(r,n,e={},s){let t=j[r];if(t===void 0||!O(e,t.importObject)){let l=m[r];if(l)t=l.then(A=>i.instantiate(A,e));else{let A=p(n),o=i.instantiate(A,e).catch(a=>{if(s===void 0)throw a;return console.warn(a),console.warn("falling back to version without experimental feature"),A=p(s),i.instantiate(A,e)});m[r]=o.then(a=>a.module),t=o.then(a=>a.instance)}t.importObject=e,j[r]=t}return(await t).exports}var L=new i.Memory({initial:1});function O(r,n){let e=Object.keys(r),s=e.length;for(let t=0;t<s;t++)if(!N(r[e[t]],n[e[t]]))return!1;return s===Object.keys(n).length}function N(r,n){if(r===n)return!0;let e=Object.keys(r),s=e.length;for(let t=0;t<s;t++)if(r[e[t]]!==n[e[t]])return!1;return s===Object.keys(n).length}var P="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=Object.fromEntries(Array.from(P).map((r,n)=>[r.charCodeAt(0),n]));f[61]=0;function p(r){r=r.replace(/=/g,"");let n=r.length,e=n%4,s=(n>>2)*3+(e&&e-1),t=new TextEncoder().encode(r+"===");for(let l=0,A=0;l<n;l+=4,A+=3){let o=(f[t[l]]<<18)+(f[t[l+1]]<<12)+(f[t[l+2]]<<6)+f[t[l+3]];t[A]=o>>16,t[A+1]=o>>8&255,t[A+2]=o&255}return new Uint8Array(t.buffer,0,s)}function d(r){postMessage([-1,!0,Object.keys(r)]),addEventListener("message",async({data:[n,e,s]})=>{try{let t=await r[e](...s),l=F([t]);postMessage([n,!0,t],l)}catch(t){postMessage([n,!1,""+t])}})}function F(r){let n=[];for(let e of r)e instanceof ArrayBuffer||e instanceof MessagePort||globalThis.ImageBitmap&&e instanceof ImageBitmap||globalThis.OffscreenCanvas&&e instanceof OffscreenCanvas?n.push(e):ArrayBuffer.isView(e)&&e.buffer instanceof ArrayBuffer&&n.push(e.buffer);return n}d({toBytes:T,toBase64:x});var K=new TextEncoder,v=new TextDecoder,k=y(u,{fallback:b});async function T(r,n,e){let s=e.length,{base642bytes:t}=await k({imports:{memory:r}}),l=new Uint8Array(r.buffer,n.byteOffset,s);l.set(K.encode(e)),t(l.byteOffset,l.byteOffset+s)}async function x(r,n){let e=n.byteLength-2,s=e%3,t=Math.floor(e/3)*4+(s&&s+1),l=e+2,{bytes2base64:A}=await k({imports:{memory:r}}),o=new Uint8Array(r.buffer,n.byteOffset,l);o[e]=0,o[e+1]=0,A(n.byteOffset,n.byteOffset+e,n.byteOffset+l);let a=new Uint8Array(r.buffer,n.byteOffset+l,t).slice(),c=v.decode(a);return s===1&&(c+="=="),s===2&&(c+="="),c}\n');
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

// wasm-threads.js
var nWorkers = 4;
var workerImports = Promise.all(new Array(nWorkers).fill(0).map(() => workerImport(Worker2())));
async function toBytes(base64) {
  base64 = base64.replace(/=/g, "");
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1;
  let m = (n >> 2) * 3 + k;
  let [memory2, view] = allocate(n + nWorkers * 16);
  let j = Math.floor(n / nWorkers);
  j -= j % 4;
  let slices = new Array(nWorkers);
  for (let i = 0; i < nWorkers - 1; i++) {
    slices[i] = [i * j, (i + 1) * j];
  }
  slices[nWorkers - 1] = [(nWorkers - 1) * j, n];
  let workers = await workerImports;
  await Promise.all(slices.map(([j0, j1], i) => {
    let workerView = {
      byteLength: j1 - j0 + 16,
      byteOffset: view.byteOffset + j0 + i * 16
    };
    let base64Worker = base64.slice(j0, j1);
    return workers[i].toBytes(memory2, workerView, base64Worker);
  }));
  let bytes = new Uint8Array(memory2.buffer, view.byteOffset, n);
  let decoded = bytes.slice(0, m);
  free(memory2, view);
  return decoded;
}
async function toBase64(bytes) {
  let m = bytes.length;
  let N = Math.ceil(m / 3) * 4;
  let [memory2, view] = allocate(N + m + 2 * nWorkers);
  let array = new Uint8Array(memory2.buffer, view.byteOffset, view.byteLength);
  let j = Math.floor(m / nWorkers);
  j -= j % 3;
  let slices = new Array(nWorkers);
  for (let i = 0; i < nWorkers - 1; i++) {
    slices[i] = [i * j, (i + 1) * j];
  }
  slices[nWorkers - 1] = [(nWorkers - 1) * j, m];
  let workers = await workerImports;
  let parts = await Promise.all(slices.map(([j0, j1], i) => {
    let workerView = {
      byteLength: j1 - j0 + 2,
      byteOffset: view.byteOffset + j0 + i * 2
    };
    array.set(bytes.slice(j0, j1), workerView.byteOffset);
    return workers[i].toBase64(memory2, workerView);
  }));
  free(memory2, view);
  return parts.join("");
}
var bytesPerPage = 65536;
var MAX_PERSISTENT_BYTES = 1e6;
var memory = new WebAssembly.Memory({
  initial: 1,
  maximum: 1024,
  shared: true
});
var offsets = [0];
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
      memory = new WebAssembly.Memory({
        initial: 1,
        maximum: 1024,
        shared: true
      });
      offsets = [0];
    }, 0);
  }
}
export {
  toBase64,
  toBytes
};
