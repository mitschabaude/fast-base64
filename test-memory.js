import {toBytes, toBase64} from './small.js';
import {toBase64Simple} from './alternative.js';

// not quite sure if freeing memory really works and how to best test it
// at least memory stays at higher levels if removing free()

setInterval(() => {
  console.log(
    'heap size (MB)',
    performance.memory.usedJSHeapSize >> 20,
    performance.memory.totalJSHeapSize >> 20
  );
}, 250);

let i = 0;
setInterval(() => {
  if (i % 4 === 0) toBytes(randomBase64(10000000)[0]);
  if (i % 4 === 1) toBase64(randomBase64(10000000)[1]);
  if (i % 4 === 2) toBytes(randomBase64(100000)[0]);
  if (i % 4 === 3) toBase64(randomBase64(100000)[1]);
  i++;
}, 5000);

function randomBase64(n) {
  const randomBytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }
  return [toBase64Simple(randomBytes), randomBytes];
}
