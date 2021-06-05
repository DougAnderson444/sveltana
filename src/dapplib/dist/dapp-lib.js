"use strict";
exports.__esModule = true;
var web3_js_1 = require("@solana/web3.js");
var dapp_config_json_1 = require("./dapp-config.json");
var DappLib = /** @class */ (function () {
    function DappLib() {
        this.config = dapp_config_json_1["default"];
        this.solana = new Solana(this.config);
    }
    return DappLib;
}());
exports["default"] = DappLib;
Promise < void  > {
    "const": payerAccount = await this.solana.createAccount()
    // await this.solana.connection.confirmTransaction(
    //   await this.solana.connection.requestAirdrop(payerAccount.publicKey, 1000000000)
    // )
    // await Solana._sleep(5000)
    ,
    // await this.solana.connection.confirmTransaction(
    //   await this.solana.connection.requestAirdrop(payerAccount.publicKey, 1000000000)
    // )
    // await Solana._sleep(5000)
    "const": lamports = await this.solana.getAccountBalance(Solana.getPublicKey(payerAccount.publicKey)),
    console: console, : .log("\uD83E\uDE82 Airdrop for " + payerAccount.publicKey + " (balance: " + lamports + ")"),
    "const": mintOwner = web3_js_1.Keypair.generate() // new Account()
    ,
    "const": accountOwner = web3_js_1.Keypair.generate() // new Account()
    ,
    "const": decimals = 0 // 0 for NFT , parseInt(data.decimals) ||
    ,
    "const": token = await Token.createMint(this.solana.connection, payerAccount, mintOwner.publicKey, null, decimals, TOKEN_PROGRAM_ID)
    /** https://github.com/solana-labs/solana-program-library/blob/d4dd97b3b1f6c53d471daf2c56e183a3c252458f/token/js/client/token.js#L536
    * Retrieve the associated account or create one if not found.
    *
    * This account may then be used as a `transfer()` or `approve()` destination
    *
    * @param owner User account that will own the new account
    * @return The new associated account (info)
    */
    ,
    /** https://github.com/solana-labs/solana-program-library/blob/d4dd97b3b1f6c53d471daf2c56e183a3c252458f/token/js/client/token.js#L536
    * Retrieve the associated account or create one if not found.
    *
    * This account may then be used as a `transfer()` or `approve()` destination
    *
    * @param owner User account that will own the new account
    * @return The new associated account (info)
    */
    "const": tokenOwnerAccountInfo = await token.getOrCreateAssociatedAccountInfo(accountOwner.publicKey),
    "const": tokenAccount = tokenOwnerAccountInfo.address // The address of this account
    /** https://github.com/solana-labs/solana-program-library/blob/d4dd97b3b1f6c53d471daf2c56e183a3c252458f/token/js/client/token.js#L446
    * Create and initialize a new account.
    *
    * This account may then be used as a `transfer()` or `approve()` destination
    *
    * @param owner User account that will own the new account
    * @return Public key of the new empty account
    */
    ,
    /** https://github.com/solana-labs/solana-program-library/blob/d4dd97b3b1f6c53d471daf2c56e183a3c252458f/token/js/client/token.js#L446
    * Create and initialize a new account.
    *
    * This account may then be used as a `transfer()` or `approve()` destination
    *
    * @param owner User account that will own the new account
    * @return Public key of the new empty account
    */
    "const": tokenAccount = await token.createAccount(accountOwner.publicKey),
    "const": supply = 1 // only 1 for NFT
    ,
    "return": await token.mintTo(tokenAccount, mintOwner, [], supply)
};
