<script>
  import { onMount } from "svelte"
  import Dapp from "../dapplib/dapp-lib.js"

  export let dapp

  export let config = {
    // defaults
    network: "devnet",
  }

  onMount(async () => {
    import("buffer").then((Buffer) => {
      global.Buffer = Buffer.Buffer
    })

    dapp = new Dapp(config)
  })
</script>

<svelte:head>
  <script>
    global = globalThis // for solana web3 repo
  </script>
</svelte:head>
