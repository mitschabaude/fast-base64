# fast-base64

Base64 encoding/decoding optimized for speed. Converts base64 to and from `Uint8Array`.

- Hand-written in WebAssembly text format for small size.
- Uses SIMD instructions if the Browser supports it.
- Compatible with `node` and `deno`.
- ~20x faster than the fastest JS implementation on the first 100kB of input
- ~2-3x faster than the fastest JS on the first 100MB
- The fastest existing JS implementation is the one shipped in this package

```sh
npm install fast-base64
```

```js
import {toBytes, toBase64} from 'fast-base64';

let bytes = await toBytes('SGVsbG8sIHdvcmxkIQ==');
let base64 = await toBase64(bytes);
```

## Alternative imports

We support three versions of the library that have different speed and size trade-offs

- `fast-base64`: The default is the fastest version, 1.9kB minzipped, **async** API
- `fast-base64/small`: Version without SIMD, 1.0kB minzipped, **async** API, no `node` support, 2-3x slower
- `fast-base64/js`: Fastest pure JS version, 600 bytes minzipped, **sync** API, 2-30x slower

Example for using the pure JS version:

```js
import {toBytes, toBase64} from 'fast-base64/js';

let bytes = toBytes('SGVsbG8sIHdvcmxkIQ=='); // no `await`!
let base64 = toBase64(bytes);
```

## Base64 URL

To support base64url, we offer two tiny helper functions (the runtime overhead compared with base64 transcoding itself is negligible):

```js
import {toUrl, fromUrl} from 'fast-base64/url';

let base64url = toUrl('/+A='); // "_-A"
let base64 = fromUrl(base64url); // "/+A="
```

## Curious about Base64?

In making this package, I tried many different approaches for base64 encoding, including using the native `atob()` and `btoa()` functions and native dataURI functionality. You can find 4 alternative encoding and 3 decoding methods here: https://github.com/mitschabaude/fast-base64/blob/main/base64-alternative.js

Turns out that one of the fastest bytes to base64 implementations in JS uses the good old FileReader API!

```js
async function toBase64DataUri(bytes) {
  let reader = new FileReader();
  let promise = new Promise(resolve => {
    reader.onload = () => resolve(reader.result);
  });
  let blob = new Blob([bytes.buffer], {type: 'application/octet-stream'});
  reader.readAsDataURL(blob);
  return (await promise).replace('data:application/octet-stream;base64,', '');
}
```
