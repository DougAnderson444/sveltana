import adapter from "@sveltejs/adapter-static"
import * as path from "path"
import fs from "fs"

const pkgJson = fs.readFileSync("./package.json", "utf8")
const pkg = JSON.parse(pkgJson) // parse JSON string to JSON object

// console.log(JSON.stringify(import.meta))

const moduleURL = new URL(import.meta.url)
// console.log(`pathname ${moduleURL.pathname}`)
// console.log(`dirname ${path.dirname(moduleURL.pathname)}`)

const __dirname = path.dirname(moduleURL.pathname)

// console.log(__dirname)

const external = [
  /@babel\/runtime/,
  "bn.js",
  "borsh",
  "bs58",
  "buffer-layout",
  "crypto-hash",
  "jayson/lib/client/browser",
  "js-sha3",
  "node-fetch",
  "rpc-websockets",
  "secp256k1",
  "superstruct",
  "tweetnacl",
]

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",

    adapter: adapter({
      // default options are shown
      pages: "build",
      assets: "build",
      fallback: null,
    }),

    vite: {
      ssr: {
        // noExternal: Object.keys(pkg.dependencies || {})
        external,
      },
      resolve: {
        mainFields: ["browser", "module", "main", "jsnext"],
        dedupe: ["bn.js", "buffer"],
        extensions: [".js", ".ts"],
        preferBuiltins: false,
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, "./src/lib/index.js"),
          name: "sveltana",
          formats: ["es"],
          // fileName: 'sveltana.es.js' // pkg.module
        },
        rollupOptions: {
          // make sure to externalize deps that shouldn't be bundled
          // into your library
          // external,
          output: {
            // Provide global variables to use in the UMD build
            // for externalized deps
            file: "sveltana.es.js",
            format: "es",
            // globals: {
            // vue: 'Vue'
            // }
          },
        },
        // terserOptions: {
        //   mangle: false,
        //   compress: false,
        //   module: true,
        //   toplevel: true,
        // },
      },
    },
  },
}

export default config
