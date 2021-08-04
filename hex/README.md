# fast hex to bytes

This folder contains some initial experiments with hex to bytes decoding, e.g. `"0aff"` => `Uint8Array [ 10, 255 ]`.

This helped me wrap my head around writing `.wat` files, using SIMD instructions and setting up a build/instantiate pipeline, all while dealing with a simpler algorithm than base64 decoding/encoding.

I ran these with Deno, which is convenient for being a CLI that supports most browser APIs:

```sh
deno run -A test-hex.js
```
