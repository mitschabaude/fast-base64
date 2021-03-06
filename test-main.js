// this tests the main exported package, works in:
// * modern browsers, <script type="module"/>
// * node
// * deno
// import {toBytes, toBase64} from './nano.js';
// import {toBytes, toBase64} from './wasm.js';
import {toBytes, toBase64} from './dist/wasm.js';
// import {toBytes, toBase64} from './small.js'; // <-- does not work in node

(async () => {
  let base64 = 'SGVsbG8sIHdvcmxkIQ=='; // btoa('Hello, world!')
  let bytes = new TextEncoder().encode('Hello, world!');

  check([...(await toBytes(base64))].every((x, i) => x === bytes[i]));
  check((await toBase64(bytes)) === base64);
})();

function check(condition) {
  if (condition) console.log('ok');
  else console.log('not ok');
}
