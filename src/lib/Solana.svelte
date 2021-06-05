<script>
  import { onMount } from "svelte"
  import Dapp from "../dapplib/dapp-lib.js"

  export let config

  export let dapp

  onMount(async () => {
    import("buffer").then((Buffer) => {
      global.Buffer = Buffer.Buffer
    })

    dapp = new Dapp(config)

    console.log({ dapp })
  })
</script>

<svelte:head>
  <script>
    global = globalThis // for solana web3 repo
  </script>
</svelte:head>

Solana Setup
