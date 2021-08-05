/* eslint-env node */
import esbuild from 'esbuild';
import {fileURLToPath} from 'url';
import watPlugin from 'esbuild-plugin-wat';
import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';

export {build as default};

let defaultPlugins = [
  inlineWorkerPlugin({
    target: 'es2020',
    plugins: [watPlugin({inlineFunctions: true, loader: 'base64'})],
  }),
  watPlugin({inlineFunctions: true, loader: 'base64'}),
];

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
