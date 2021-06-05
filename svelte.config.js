/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: {
      ssr: {
        // noExternal: Object.keys(pkg.dependencies || {})
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
};

export default config;
