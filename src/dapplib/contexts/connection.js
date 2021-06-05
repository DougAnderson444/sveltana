import {
  Account,
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import {
  TokenListProvider,
  ENV as ChainID,
} from "@solana/spl-token-registry"

export const ENDPOINTS = [
  {
    name: "mainnet-beta",
    endpoint: "https://solana-api.projectserum.com/",
    chainID: ChainID.MainnetBeta,
  },
  {
    name: "testnet",
    endpoint: clusterApiUrl("testnet"),
    chainID: ChainID.Testnet,
  },
  {
    name: "devnet",
    endpoint: clusterApiUrl("devnet"),
    chainID: ChainID.Devnet,
  },
  {
    name: "localnet",
    endpoint: "http://127.0.0.1:8899",
    chainID: ChainID.Devnet,
  },
]

const DEFAULT = ENDPOINTS[0].endpoint;


