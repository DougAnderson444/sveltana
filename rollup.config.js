import { nodeResolve } from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import builtins from 'rollup-plugin-node-builtins'
import json from '@rollup/plugin-json'

import pkg from './package.json'

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase())

export default {
  input: 'src/lib/index.js',
  output: [
    { file: pkg.module, format: 'es' },
    { file: pkg.main, format: 'umd', name, globals: { hypns: 'hypns' } }
  ],
  // rollup pulls the es module destined for nodejs, not the one for the browser
  // so these alias need to be included here, even though they are in the upstream module :(
  plugins: [
    json(),
    nodeResolve(
      {
        browser: true, // instructs the plugin to use the "browser" property in package.json files to specify alternative files to load for bundling
        preferBuiltins: false
      }
    ),
    svelte(),
    commonjs({
      extensions: ['.mjs', '.js'],
      include: [/node_modules/], // require is not defined?
      requireReturnsDefault: 'auto' // what is returned when requiring an ES module from a CommonJS file
      // dynamicRequireTargets: [
      //   // include using a glob pattern (either a string or an array of strings)
      //   'node_modules/hypns/*'
      // ]
      // exclude: /node_modules/ // require is not defined?
    }), // converts Nodejs modules to ES6 module // https://rollupjs.org/guide/en/#rollupplugin-commonjs
    nodePolyfills(),
    builtins()
  ]
}
