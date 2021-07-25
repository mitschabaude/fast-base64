// this tests the exported package, works in:
// * modern browsers, <script type="module"/>
// * node
// * deno
import {toBytes, toBase64} from './base64-wasm-small.js';

(async () => {
  let base64 = 'SGVsbG8sIHdvcmxkIQ=='; // btoa('Hello, world!')
  let bytes = new TextEncoder().encode('Hello, world!');

  check((await toBase64(bytes)) === base64);
  check([...(await toBytes(base64))].every((x, i) => x === bytes[i]));
})();

function check(condition) {
  if (condition) console.log('ok');
  else console.log('not ok');
}
