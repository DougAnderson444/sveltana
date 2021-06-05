<script>
  import Solana from "../lib/Solana.svelte"

  let dapp

  let net = "devnet"

  let account = "2kNoPZhth7i9nRBQikdHUUYP9vx9FqPQP66zaQFDEtoU"

  let tokenKey = "5ipVLB12JskMNdVc7nUTzgBc2KSa6hRUnoWAVoUkWsKq"
  let hasAccess

  const checkHasAccess = async () => {
    try {
      let tokenAccounts =
        await dapp.solana.connection.getParsedTokenAccountsByOwner(
          dapp.getPublicKey(account),
          {
            mint: dapp.getPublicKey(tokenKey),
          }
        )
      if (tokenAccounts.value.length > 0) {
        tokenAccounts.value.forEach((account) => {
          if (account.account.data.parsed.info.tokenAmount.uiAmount > 0) {
            hasAccess = true
          } else {
            // setClaimTokenAccount(account.account.pubkey)
          }
        })
      }
    } catch (e) {
      console.log("error: ", e)
      return
    }
  }

  $: if (dapp) checkHasAccess()
</script>

<h1>Example usage for Sveltana</h1>

<Solana {net} bind:dapp />
{#if dapp}
  <p>Now use dapp for Solana access</p>

  <p>
    Network: {dapp.network}
  </p>
  <p>Does {account} have any {tokenKey} tokens? {hasAccess}</p>
{/if}
