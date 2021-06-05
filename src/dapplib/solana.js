import {
  Account,
  Connection,
  BpfLoader,
  BPF_LOADER_PROGRAM_ID,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js"
import * as bs58 from "bs58"
import DataLayouts from "./scripts/layouts.js"

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
)

export class Solana {
  constructor(config) {
    this.serviceUri = config.httpUri
    this.connection = new Connection(this.serviceUri, "singleGossip")
  }

  /**
   * Create an Associated Token Account to hold this token type
   */
  static async findAssociatedTokenAddress(
    walletAddress,
    programId,
    tokenMintAddress
  ) {
    return (
      await PublicKey.findProgramAddress(
        [
          walletAddress.toBuffer(),
          programId.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      )
    )[0]
  }

  static getPublicKey(publicKey) {
    return typeof publicKey === "string" ? new PublicKey(publicKey) : publicKey
  }

  static getSigningAccount(privateKey) {
    return new Account(privateKey)
  }

  async getTokenAccounts(publicKey, programId) {
    return await this.connection.getTokenAccountsByOwner(publicKey, {
      programId,
    })
  }

  async getMintInfoFromTokenAccount(tokenAccount) {
    // TokenAccountBalancePair
    return await this.connection.getTokenAccountsByOwner(publicKey, {
      mint,
    })
  }

  async getAccountInfo(publicKey) {
    return await this.connection.getAccountInfo(Solana.getPublicKey(publicKey))
  }

  static getDataLayouts() {
    return DataLayouts.get()
  }

  async getAccountBalance(publicKey) {
    return await this.connection.getBalance(Solana.getPublicKey(publicKey))
  }

  async airDrop(account, lamports) {
    await this.connection.requestAirdrop(Solana.getPublicKey(account), lamports)
  }

  async createSystemAccount() {
    const self = this
    const lamports = 1
    const account = new Account()

    console.log(
      `🤖 Account ${account.publicKey} created. Requesting Airdrop...`
    )
    await self.airDrop(Solana.getPublicKey(account.publicKey), lamports)
    return account
  }

  /**
   * Creates an account and adds lamports
   *
   * @param options   lamports: Number of lamports to add
   *                  entropy:  Secret key used to generate account keypair Buffer | Uint8Array | Array<number>
   * @returns Account that was created
   */
  async createAccount(options = {}) {
    const self = this
    const lamports = options.lamports || 1000000000
    const account = options.entropy
      ? Keypair.fromSeed(options.entropy)
      : Keypair.generate()

    let retries = 10

    console.log(
      `🤖 Account ${account.publicKey} created. Requesting Airdrop...`
    )
    await self.airDrop(Solana.getPublicKey(account.publicKey), lamports)
    for (;;) {
      await Solana._sleep(500)
      if (
        lamports ===
        (await self.getAccountBalance(Solana.getPublicKey(account.publicKey)))
      ) {
        console.log(
          `🪂 Airdrop success for ${account.publicKey} (balance: ${lamports})`
        )
        return account
      }
      if (--retries <= 0) {
        break
      }
      console.log(`--- Airdrop retry #${retries} for ${account.publicKey}`)
    }
    throw new Error(`Airdrop of ${lamports} failed for ${account.publicKey}`)
  }

  async createPayerAccount(program) {
    const self = this
    const dataLayouts = Solana.getDataLayouts()
    let fees = 0
    const { feeCalculator } = await self.connection.getRecentBlockhash()

    // Calculate the cost to load the program
    const NUM_RETRIES = 500
    fees +=
      feeCalculator.lamportsPerSignature *
        (BpfLoader.getMinNumSignatures(program.length) + NUM_RETRIES) +
      (await self.connection.getMinimumBalanceForRentExemption(program.length))

    // Calculate the cost to fund all state accounts
    for (let l = 0; l < dataLayouts.length; l++) {
      fees += await self.connection.getMinimumBalanceForRentExemption(
        dataLayouts[l].span
      )
    }

    // Calculate the cost of sending the transactions
    fees += feeCalculator.lamportsPerSignature * 100 // wag

    // Fund a new payer via airdrop
    return await self.createAccount({ lamports: fees })
  }

  async deployProgram(program) {
    const self = this
    const dataLayouts = Solana.getDataLayouts()

    const payerAccount = await self.createPayerAccount(program)
    const deployAccounts = {
      payer: {
        publicKey: payerAccount.publicKey.toBase58(),
        privateKey: bs58.encode(payerAccount.secretKey),
        lamports: await self.getAccountBalance(payerAccount.publicKey),
      },
    }

    const programAccount = new Account()
    await BpfLoader.load(
      self.connection,
      payerAccount,
      programAccount,
      program,
      BPF_LOADER_PROGRAM_ID
    )
    const programId = programAccount.publicKey

    // Create all the state accounts
    const transactionAccounts = [payerAccount]
    const transaction = new Transaction()
    for (let l = 0; l < dataLayouts.length; l++) {
      const stateAccount = new Account()
      transactionAccounts.push(stateAccount)
      const space = dataLayouts[l].layout.span
      const lamports = await self.connection.getMinimumBalanceForRentExemption(
        dataLayouts[l].layout.span
      )
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: payerAccount.publicKey,
          newAccountPubkey: stateAccount.publicKey,
          lamports,
          space,
          programId,
        })
      )

      deployAccounts[dataLayouts[l].name] = {
        publicKey: stateAccount.publicKey.toBase58(),
        privateKey: bs58.encode(stateAccount.secretKey),
        lamports,
      }
    }

    await sendAndConfirmTransaction(
      self.connection,
      transaction,
      transactionAccounts,
      {
        commitment: "singleGossip",
        preflightCommitment: "singleGossip",
      }
    )

    return {
      programId: programAccount.publicKey.toBase58(),
      programAccounts: deployAccounts,
    }
  }

  async submitTransaction(options) {
    const self = this
    const instruction = new TransactionInstruction({
      keys: options.keys,
      programId: options.programId,
      data: options.data,
    })

    return await sendAndConfirmTransaction(
      self.connection,
      new Transaction().add(instruction),
      [options.payer],
      {
        commitment: "singleGossip",
        preflightCommitment: "singleGossip",
      }
    )
  }

  static async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
