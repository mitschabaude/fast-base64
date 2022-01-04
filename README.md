# fast-base64

Base64 encoding/decoding optimized for speed. Converts base64 to and from `Uint8Array`.

- Hand-written in WebAssembly text format for small size.
- Uses SIMD instructions if the Browser supports it.
- Compatible with `node` and `deno`.
- ~20x faster than the fastest JS implementation on the first 100kB of input
- ~2-3x faster than the fastest JS on the first 100MB
- The fastest existing JS implementation is the one shipped in this package
- The smallest existing implementation is also shipped in this package, because why not 😁

```sh
npm install fast-base64
```

```js
import {toBytes, toBase64} from 'fast-base64';

let bytes = await toBytes('SGVsbG8sIHdvcmxkIQ==');
let base64 = await toBase64(bytes);
```

Or, using `deno`:

```js
import {toBytes, toBase64} from 'https://deno.land/x/fast_base64/mod.ts';
```

## Alternative imports

We support four versions of the library that have different speed and size trade-offs.

- `fast-base64`: The default is the fastest version, 1.9kB minzipped, **async** API
- `fast-base64/small`: Version without SIMD, 1.0kB minzipped, **async** API, no `node` support, 2-3x slower
- `fast-base64/js`: Fastest pure JS version, 600 bytes minzipped, **sync** API, 2-30x slower
- `fast-base64/nano`: Smallest possible version, 147 bytes, **sync** API, no `node` support, 3-100x slower

The APIs are all equivalent, except that the latter two are synchronous. Example for using the fast JS version:

```js
import {toBytes, toBase64} from 'fast-base64/js';

let bytes = toBytes('SGVsbG8sIHdvcmxkIQ=='); // no `await`!
let base64 = toBase64(bytes);
```

DISCLAIMER: You probably don't _need_ speed-optimized base64. `fast-base64/nano`, the slowest of all versions that I tried, could even be the best choice for typical applications, because the speed difference will simply not be noticable if payloads are not huge. For example, on my laptop, 10kB of base64 decode in 0.06ms with `fast-base64` and in 5ms with `fast-base64/nano`.

## Base64 URL

To support base64url, we offer two tiny helper functions.

```js
import {toUrl, fromUrl} from 'fast-base64/url';

let base64url = toUrl('/+A='); // "_-A"
let base64 = fromUrl(base64url); // "/+A="
```

The added runtime overhead when combining these with the fastest de-/encoder is about 2-4x, which should be fine for almost all circumstances.

## Wouldn't this be _even faster_ with threading?

Sadly, no. This repository includes threaded variants of both the Wasm and pure JS encoding/decoding, where I distribute the workload between multiple Web Workers and join their results once all are complete. You can check out the code in [./wasm-threads.js](https://github.com/mitschabaude/fast-base64/blob/main/wasm-threads.js) and [./js-threads.js](https://github.com/mitschabaude/fast-base64/blob/main/js-threads.js).

These turn out to be not faster than the single-threaded versions, irrespective of the number of workers, except for very large payloads (> 1MB) in the pure JS version (where 3-4 workers can provide a speed-up of 1.5-2x). Especially the Wasm version with threads is clearly slower. It also comes with a larger bundle size and worse browser support.

As far as I can tell, the added overhead of slicing up the input, messaging to the workers and back, and recombining the results is bigger than the gains in performing the actual calculation.

## Curious about Base64?

In making this package, I tried many different approaches for base64 encoding, including using the native `atob()` and `btoa()` functions and native data URL functionality. You can find 4 alternative encoding and 3 decoding methods here: [./alternative.js](https://github.com/mitschabaude/fast-base64/blob/main/alternative.js)

Turns out that one of the fastest bytes to base64 implementations in JS uses the FileReader API 😮

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

Oh, and maybe you can decipher `fast-base64/nano`?

```js
let y = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)),
  a = b => btoa([...b].map(x => String.fromCharCode(x)).join(''));
export {y as toBytes, a as toBase64};
```

If you want to compare and possibly tune performance by yourself, try running `yarn build` and `npx chrodemon test-base64.js` in the cloned repo.
