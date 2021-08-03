/* eslint-env node */
import esbuild from 'esbuild';
import {fileURLToPath} from 'url';
import watPlugin from './esbuild-plugin-wat.js';
import inlineWorkerPlugin from './esbuild-plugin-inline-worker.js';

export {build as default};

let defaultPlugins = [inlineWorkerPlugin, watPlugin({inlineFunctions: true})];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build(process.argv[2]);
}

function build(entryPoints, config) {
  if (!Array.isArray(entryPoints)) entryPoints = [entryPoints];
  let plugins = [...defaultPlugins, ...(config?.plugins ?? [])];
  esbuild.build({
    entryPoints,
    bundle: true,
    target: 'es2020',
    format: 'esm',
    plugins,
    ...config,
  });
}
