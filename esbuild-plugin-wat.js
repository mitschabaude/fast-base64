/* eslint-env node */
import crypto from 'crypto';
import wabt from 'wabt';
import binaryen from 'binaryen';
import fs from 'fs';
import path from 'path';
import findCacheDir from 'find-cache-dir';

export {watPlugin as default};

let cacheDir = findCacheDir({name: 'eslint-plugin-wat', create: true});

function watPlugin({inlineFunctions = false} = {}) {
  return {
    name: 'wat',
    setup(build) {
      build.onLoad({filter: /.wat$/}, async ({path: watPath}) => {
        let watBytes = await fs.promises.readFile(watPath);
        let {result, hash} = await fromCache(
          watPath,
          watBytes,
          async watBytes => {
            let watText = new TextDecoder().decode(watBytes);
            let wabtModule = (await wabt()).parseWat(watPath, watText, {
              simd: true,
            });
            let bytes = new Uint8Array(wabtModule.toBinary({}).buffer);
            if (inlineFunctions) {
              bytes = transformInlineFunctions(bytes);
            }
            return bytes;
          }
        );
        let base64 = Buffer.from(result).toString('base64');
        return {
          contents: JSON.stringify({id: hash, base64}),
          loader: 'json',
        };
      });

      build.onLoad({filter: /.wasm$/}, async ({path: wasmPath}) => {
        let bytes = await fs.promises.readFile(wasmPath);
        let {result, hash} = await fromCache(wasmPath, bytes, bytes => {
          if (inlineFunctions) {
            bytes = transformInlineFunctions(bytes);
          }
          return bytes;
        });
        let base64 = Buffer.from(result).toString('base64');
        return {
          contents: JSON.stringify({id: hash, base64}),
          loader: 'json',
        };
      });
    },
  };
}

function transformInlineFunctions(wasmBytes) {
  let module = binaryen.readBinary(wasmBytes);

  binaryen.setOptimizeLevel(3);
  binaryen.setShrinkLevel(0);
  binaryen.setFlexibleInlineMaxSize(1000000000);
  module.runPasses(['inlining-optimizing']);
  // module.optimize();

  return module.emitBinary();
}

function hash(stuff) {
  return crypto.createHash('sha1').update(stuff).digest('base64url');
}

//  memoize bytes-to-bytes transform
async function fromCache(key, content, transform) {
  let keyHash = hash(key);
  let contentHash = hash(content);
  let result;

  try {
    result = await fs.promises.readFile(
      path.resolve(cacheDir, `${keyHash}.${contentHash}`)
    );
  } catch {}

  if (result === undefined) {
    result = await transform(content);
    // clean old cached files, then write new one
    fs.promises
      .readdir(cacheDir)
      .then(files =>
        Promise.all(
          files
            .filter(f => f.startsWith(keyHash))
            .map(f => fs.promises.unlink(path.resolve(cacheDir, f)))
        )
      )
      .then(() => {
        fs.promises.writeFile(
          path.resolve(cacheDir, `${keyHash}.${contentHash}`),
          result
        );
      });
  }
  return {result, hash: contentHash};
}
