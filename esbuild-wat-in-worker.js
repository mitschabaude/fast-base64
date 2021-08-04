/* eslint-env node */
import esbuild from 'esbuild';
import {fileURLToPath} from 'url';
import watPlugin from 'esbuild-plugin-wat';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build(process.argv[2]);
}

function build(scriptPath) {
  esbuild.build({
    bundle: true,
    entryPoints: [scriptPath],
    minify: true,
    // outfile: '',
    target: 'es2020',
    format: 'esm',
    plugins: [watPlugin({inlineFunctions: true, loader: 'base64'})],
  });
}
