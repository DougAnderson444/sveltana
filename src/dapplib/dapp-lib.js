import { Solana } from "./solana.js"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import * as bs58 from "bs58"
import dappConfig from "./dapp-config.json"
import { Account, Keypair, PublicKey } from "@solana/web3.js"
import { AccountLayout, u64 } from "@solana/spl-token"
import { getNetworkId } from "./utils/ids.js";

export default class DappLib {
  constructor(config = {}) {
    this.config = DappLib.getConfig()
    this.network = getNetworkId(config?.network) || "devnet"
    this.solana = new Solana({endpoint: this.network})
  }

  getPublicKey(key){
    return Solana.getPublicKey(key)
  }

  static getConfig() {
    return dappConfig
  }
  parseTokenAccountInfo(info) {
    const data = Buffer.from(info)
    const accountInfo = AccountLayout.decode(data)

    accountInfo.mint = new PublicKey(accountInfo.mint)
    accountInfo.owner = new PublicKey(accountInfo.owner)
    accountInfo.amount = u64.fromBuffer(accountInfo.amount)

    return accountInfo
  }
  async getUserTokens() {
    const tokenInfo = []
    // get all Token Accounts for this user
    await Promise.all(
      this.config.accounts.map(async (account) => {
        const tokenAccounts = await this.getTokenAccounts(account)
        // get all MintInfo for each Token Account
        if (
          tokenAccounts &&
          tokenAccounts.value &&
          tokenAccounts.value.length
        ) {
          tokenAccounts.value.forEach((token) => {
            const data = this.parseTokenAccountInfo(token.account.data)
            tokenInfo.push(data)
          })
        }
      })
    )
    return tokenInfo
  }

  getExplorerLink(tx) {
    return `https://explorer.solana.com/address/${tx}?cluster=${this.network}`
  }

  async createNFT(data = {}) {
    console.log("Creating NFT")
    // const payerAccount =
    //   data.payerAccount || (await this.solana.createAccount())

    const payerAccount = Solana.getSigningAccount(
      bs58.decode(this.config.programInfo.programAccounts.payer.privateKey)
    )

    const mintOwner = payerAccount // data.mintOwner || Keypair.generate()
    const accountOwner = payerAccount // data.accountOwner || Keypair.generate()

    const decimals = 0
    console.log("Creating token...")

    // token object is a utility object so you can access the functions such as
    // createAccount() and mintTo()
    const token = await Token.createMint(
      this.solana.connection,
      payerAccount, // Signer type, has publicKey() and secretKey() getters
      mintOwner.publicKey, // PublicKey returned from .publicKey getter function
      null, //  freezeAuthority: PublicKey | null
      decimals,
      TOKEN_PROGRAM_ID
    )
    console.log("Token Created", { token: token.publicKey.toString() })

    /** https://github.com/solana-labs/solana-program-library/blob/d4dd97b3b1f6c53d471daf2c56e183a3c252458f/token/js/client/token.js#L536
     * Retrieve the associated account or create one if not found.
     *
     * This account may then be used as a `transfer()` or `approve()` destination
     *
     * @param owner User account that will own the new account
     * @return The new associated account (info)
     */
    // const associatedAccountInfo = await token.getOrCreateAssociatedAccountInfo(
    //   accountOwner.publicKey
    // )
    // const tokenAccount = associatedAccountInfo.address // The address of this account
    // // Should check balance of this assoc account to see if it needed funding before I sent it a token?
    // const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
    //   this.solana.connection
    // )

    // console.log({ balanceNeeded })

    // const tokenAccountBalance = await this.solana.getAccountBalance(
    //   tokenAccount
    // )

    // console.log({ balanceNeeded }, { tokenAccountBalance })

    /** https://github.com/solana-labs/solana-program-library/blob/d4dd97b3b1f6c53d471daf2c56e183a3c252458f/token/js/client/token.js#L446
     * Create and initialize a new account.
     *
     * This account may then be used as a `transfer()` or `approve()` destination
     *
     * @param owner User account that will own the new account
     * @return Public key of the new account
     */
    console.log("Creating token account to hold the token...")
    const tokenAccount = await token.createAccount(accountOwner.publicKey) // funds the new account with the token's payer  https://github.com/solana-labs/solana-program-library/blob/6b3fbb8ff58a8d19b44bde0f954cf4c3b0a058b2/token/js/client/token.js#L479
    console.log("Token Account Created", {
      tokenAccount: tokenAccount.toString(),
    })
    const supply = 1 // only 1 for NFT
    console.log(
      `Minting ${supply} token${
        supply > 1 ? "s" : ""
      } to ${tokenAccount.toString()}...`
    )
    await token.mintTo(tokenAccount, mintOwner, [], supply)
    console.log("Supply Created")
    return {
      token,
      tokenAccount,
      accountOwner,
      payerAccount: payerAccount.publicKey,
      mintOwner: mintOwner.publicKey,
    }
  }

  // Source: https://github.com/solana-labs/solana-program-library/blob/8555f2d2226d318aa6b78eb8c8fdef8984a15dac/token/js/client/token.js#L383
  async createFT(data) {
    // Required Properties:
    //      data.mintAuthority
    //      data.freezeAuthority
    //      data.decimals

    // Explicitly make each parameter a variable to make debugging easier
    const payer = Solana.getSigningAccount(
      bs58.decode(this.config.programInfo.programAccounts.payer.privateKey)
    )
    /**
     * mintAuthority: Optional authority used to mint new tokens. The mint authority may only be provided during
     * mint creation. If no mint authority is present then the mint has a fixed supply and no
     * further tokens may be minted.
     */
    const mintAuthority = Solana.getPublicKey(data.mintAuthority)
    const freezeAuthority = null
    const decimals = parseInt(data.decimals) || 9

    const token = await Token.createMint(
      this.solana.connection,
      payer,
      mintAuthority,
      freezeAuthority,
      decimals,
      TOKEN_PROGRAM_ID
    )
    const network = this.config.httpUri.indexOf("devnet") ? "devnet" : "mainnet"
    return {
      type: DappLib.DAPP_RESULT_OBJECT,
      label: "Token PublicKey",
      result: {
        token, // const mintInfo = await token.getMintInfo();
        publicKey: token.publicKey.toString(),
        explorer: `<a href="https://explorer.solana.com/address/${token.publicKey.toString()}?cluster=${network}" target="_new" style="text-decoration:underline;">View Address</a>`,
      },
    }
  }

  async getAssociatedAccount(walletAddress, tokenMintAddress) {
    console.log(
      { walletAddress: Solana.getPublicKey(walletAddress) },
      { TOKEN_PROGRAM_ID },
      { tokenMintAddress: Solana.getPublicKey(tokenMintAddress) }
    )
    return await Solana.findAssociatedTokenAddress(
      Solana.getPublicKey(walletAddress),
      TOKEN_PROGRAM_ID,
      Solana.getPublicKey(tokenMintAddress)
    )
  }

  // Source: https://github.com/solana-labs/solana-program-library/blob/26560daae234bc3e00c08a2f2c8d81d1c2f41498/token/js/client/token.js#L1026
  async mintFT(data) {
    // Required Properties:
    //      data.mintAuthority
    //      data.tokenAccount
    //      data.recipientAccount
    //      data.amount

    // Explicitly make each parameter a variable to make debugging easier
    const payer = Solana.getSigningAccount(
      bs58.decode(this.config.programInfo.programAccounts.payer.privateKey)
    )
    const tokenPublicKey = Solana.getPublicKey(data.tokenAccount)
    const signingAccount = this.config.wallets.find(
      (w) => w.publicKey === data.mintAuthority
    )
    if (signingAccount.length === 0) {
      throw new Error("Invalid Mint Authority")
    }
    const authority = Solana.getSigningAccount(
      bs58.decode(signingAccount.privateKey)
    )
    const recipientPublicKey = Solana.getPublicKey(data.recipientAccount)

    const amount = parseInt(data.amount) || 1000

    /**
     * Create a Token object attached to the specific mint
     */
    const token = new Token(
      this.solana.connection,
      tokenPublicKey,
      TOKEN_PROGRAM_ID,
      payer
    )

    console.log({ token }, { recipientPublicKey }, { authority }, { amount })

    const mintInfo = await token.mintTo(
      recipientPublicKey,
      authority,
      [],
      amount
    )

    const network = this.config.httpUri.indexOf("devnet") ? "devnet" : "mainnet"
    return {
      type: DappLib.DAPP_RESULT_OBJECT,
      label: "Token PublicKey",
      result: {
        mintInfo,
        token: tokenPublicKey.toString(),
        explorer: `<a href="https://explorer.solana.com/address/${recipientPublicKey.toString()}?cluster=${network}" target="_new" style="text-decoration:underline;">View Address</a>`,
      },
    }
  }

  getAccounts() {
    const accounts = dappConfig.accounts
    return accounts
  }

  async getTokenAccounts(owner) {
    return await this.solana.getTokenAccounts(
      Solana.getPublicKey(owner),
      TOKEN_PROGRAM_ID
    )
  }

  async getMintInfoFromTokenAccount(tokenAccount) {
    return await this.solana.getMintInfoFromTokenAccount(tokenAccount)
  }

  async getAccountInfo(account) {
    return await this.solana.getAccountInfo(Solana.getPublicKey(account))
  }
}
