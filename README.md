# Create Solana Svelte Component

Built with svelte kit!

## Background

Had issues with solana/web3 in the browser, so made this to make life easier. What problems you ask? Buffer, global, and more buffer issues. Bundling them up here skips all that pain and uses the libraries in the browser with ease.

## Usage

```js
// somewhere.svelte

import Solana from 'sveltana'

let config = {
    net: 'devnet' || 'main'
}

<Solana {config} />

```

## Summary of Hacks

To get Solana to work:

1. In `svelte.config.js`, add `vite` to `kit`: 

```js
kit:{
    
    ... // previous boring config stuff

    vite: {
      ssr: {
        external: [
          /@babel\/runtime/,
          'bn.js',
          'borsh',
          'bs58',
          'buffer-layout',
          'crypto-hash',
          'jayson/lib/client/browser',
          'js-sha3',
          'node-fetch',
          'rpc-websockets',
          'secp256k1',
          'superstruct',
          'tweetnacl'
        ]
      },
      resolve: {
        mainFields: ['browser', 'module', 'main', 'jsnext'],
        dedupe: ['bn.js', 'buffer'],
        extensions: ['.js', '.ts'],
        preferBuiltins: false
      }
    }
}
```

2. GlobalThis

In main component, add:

```svelte
<svelte:head>
  <script>
    global = globalThis // for solana web3 repo
  </script>
</svelte:head>
```

3. Buffer issues

In main component, add:

```js
  onMount(async () => {
    // setup some globals
    import("buffer").then((Buffer) => {
      global.Buffer = Buffer.Buffer
    })
  })

```

## Building

Follow [this](https://kit.svelte.dev/docs#packaging)

Running svelte-kit package will take the contents of src/lib and generate a package directory 

