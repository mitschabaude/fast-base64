// inline-worker:__inline-worker
function inlineWorker(scriptText) {
  let blob = new Blob([scriptText], { type: "text/javascript" });
  let url = URL.createObjectURL(blob);
  let worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

// base64-wasm.worker.js
function Worker2() {
  return inlineWorker('var u="AGFzbQEAAAABDAJgAn9/AGADf39/AAIVAQdpbXBvcnRzBm1lbW9yeQIDAIAIAwMCAAEHHwIMYmFzZTY0MmJ5dGVzAAAMYnl0ZXMyYmFzZTY0AAEKjgUCxQICAn8BeyAAIQIgACEDA0AgAv0ABAAhBCAEQQT9D/1uIARBwAD9D/0oQcUA/Q/9Tv1xIARB4AD9D/0oQQb9D/1O/XEgBEEr/Q/9I0EP/Q/9Tv1uIARBL/0P/SNBDP0P/U79biEEIAT9DD8AAAA/AAAAPwAAAD8AAAD9TkEC/asBIAT9DAAwAAAAMAAAADAAAAAwAAD9TkEM/a0B/VAgBP0MAA8AAAAPAAAADwAAAA8AAP1OQQT9qwEgBP0MAAA8AAAAPAAAADwAAAA8AP1OQQr9rQH9UP1QIAT9DAAAAwAAAAMAAAADAAAAAwD9TkEG/asBIAT9DAAAAD8AAAA/AAAAPwAAAD/9TkEI/a0B/VD9UP0MAAECBAUGCAkKDA0OEBAQEP0OIQQgAyAE/QsEACACQRBqIQIgA0EMaiEDIAIgAUkNAAsLxAICAn8BeyACIQMgACEEA0AgBP0ABAD9DAABAhADBAUQBgcIEAkKCxD9DiEFIAX9DPwAAAD8AAAA/AAAAPwAAAD9TkEC/a0BIAX9DAMAAAADAAAAAwAAAAMAAAD9TkEM/asBIAX9DADwAAAA8AAAAPAAAADwAAD9TkEE/a0B/VD9UCAF/QwADwAAAA8AAAAPAAAADwAA/U5BCv2rASAF/QwAAMAAAADAAAAAwAAAAMAA/U5BBv2tAf1Q/VAgBf0MAAA/AAAAPwAAAD8AAAA/AP1OQQj9qwH9UCEFIAVBwQD9D/1uIAVBGf0P/ShBBv0P/U79biAFQTP9D/0oQcsA/Q/9Tv1xIAVBPv0P/SNBD/0P/U79cSAFQT/9D/0jQQz9D/1O/XEhBSADIAX9CwQAIANBEGohAyAEQQxqIQQgBCABSQ0ACws=";var b="";var i=WebAssembly,w={},D={};function m(t,{fallback:r}){let e=Math.random().toString();return n=>Q(e,t,n,r)}async function Q(t,r,e={},n){let A=D[t];if(A===void 0||!d(e,A.importObject)){let s=w[t];if(s)A=s.then(a=>i.instantiate(a,e));else{let a=B(r),l=i.instantiate(a,e).catch(o=>{if(n===void 0)throw o;return console.error(o),console.log("falling back to version without experimental feature"),a=B(n),i.instantiate(a,e)});w[t]=l.then(o=>o.module),A=l.then(o=>o.instance)}A.importObject=e,D[t]=A}return(await A).exports}var U=new i.Memory({initial:1});function d(t,r){let e=Object.keys(t),n=e.length;for(let A=0;A<n;A++)if(!p(t[e[A]],r[e[A]]))return!1;return n===Object.keys(r).length}function p(t,r){if(t===r)return!0;let e=Object.keys(t),n=e.length;for(let A=0;A<n;A++)if(t[e[A]]!==r[e[A]])return!1;return n===Object.keys(r).length}var h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=Object.fromEntries(Array.from(h).map((t,r)=>[t.charCodeAt(0),r]));f[61]=0;function B(t){t=t.replace(/=/g,"");let r=t.length,e=r%4,n=(r>>2)*3+(e&&e-1),A=new TextEncoder().encode(t+"===");for(let s=0,a=0;s<r;s+=4,a+=3){let l=(f[A[s]]<<18)+(f[A[s+1]]<<12)+(f[A[s+2]]<<6)+f[A[s+3]];A[a]=l>>16,A[a+1]=l>>8&255,A[a+2]=l&255}return new Uint8Array(A.buffer,0,n)}function y(t){postMessage([-1,!0,Object.keys(t)]),addEventListener("message",async({data:[r,e,n]})=>{try{let A=await t[e](...n),s=I([A]);postMessage([r,!0,A],s)}catch(A){postMessage([r,!1,""+A])}})}function I(t){let r=[];for(let e of t)e instanceof ArrayBuffer||e instanceof MessagePort||globalThis.ImageBitmap&&e instanceof ImageBitmap||globalThis.OffscreenCanvas&&e instanceof OffscreenCanvas?r.push(e):ArrayBuffer.isView(e)&&e.buffer instanceof ArrayBuffer&&r.push(e.buffer);return r}y({toBytes:M,toBase64:O});var P=new TextEncoder,T=new TextDecoder,g=m(u,{fallback:b});async function M(t,r,e){let n=e.length,A=n%4,s=A&&A-1,a=(n>>2)*3+s,{base642bytes:l}=await g({imports:{memory:t}}),o=new Uint8Array(t.buffer,r.byteOffset,n);o.set(P.encode(e)),l(o.byteOffset,o.byteOffset+n)}async function O(t,r){let e=r.byteLength-2,n=e%3,A=Math.floor(e/3)*4+(n&&n+1),s=e+2,a=Math.ceil(e/3)*4,{bytes2base64:l}=await g({imports:{memory:t}}),o=new Uint8Array(t.buffer,r.byteOffset,s);o[e]=0,o[e+1]=0,l(r.byteOffset,r.byteOffset+e,r.byteOffset+s);let E=new Uint8Array(t.buffer,r.byteOffset+s,A).slice(),c=T.decode(E);return n===1&&(c+="=="),n===2&&(c+="="),c}\n');
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

// base64-wasm-threads.js
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
