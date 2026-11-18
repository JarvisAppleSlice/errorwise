// Packs the extension and the Anthropic SDK into one file: dist/extension.js.
// One file installs and starts faster than hundreds of separate files from node_modules.
//
//   node esbuild.js              build for testing (F5), with a source map for debugging
//   node esbuild.js --production smaller build for the .vsix (run by `vsce package`)

const esbuild = require('esbuild');

const production = process.argv.includes('--production');

esbuild
  .build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    // VS Code provides the `vscode` module itself when the extension runs.
    external: ['vscode'],
    minify: production,
    sourcemap: !production,
    logLevel: 'info',
  })
  .catch(() => process.exit(1));
