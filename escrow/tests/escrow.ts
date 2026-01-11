import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { Keypair } from "@solana/web3.js";
import { getAccount, getMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { expect } from "chai";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.escrow as Program<Escrow>;

  const adminWallet = (provider.wallet as NodeWallet).payer;
  const tokenProgram = TOKEN_PROGRAM_ID;
  const newWallet = anchor.web3.Keypair.generate();

  let mintedTokenAccountPda: anchor.web3.PublicKey;
  let sellerTokenAccountPda: anchor.web3.PublicKey;
  const findPda = (programId: anchor.web3.PublicKey, seeds: (Buffer | Uint8Array)[]): anchor.web3.PublicKey => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
    return pda;
  }

  beforeEach(() => {
    mintedTokenAccountPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode("minted_token_account")]);
    sellerTokenAccountPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode("seller_token_account")]);
  })

  it("should mint new tokens", async () => {
    // Add your test here.
    console.log("  admin wallet public key: ", adminWallet.publicKey.toBase58());
    console.log("  token program: ",tokenProgram.toBase58());
    console.log("  minted token acount pda: ",mintedTokenAccountPda.toBase58());
    console.log("  seller token account pda: ", sellerTokenAccountPda.toBase58());
    const tokens_to_mint = 100;
    const tx = await program.methods.mintTokens(new anchor.BN(tokens_to_mint)).accounts({
      authority: adminWallet.publicKey,
      tokenProgram: tokenProgram,
      mintedTokenAccount: mintedTokenAccountPda,
      sellerTokenAccount: sellerTokenAccountPda,
    }).signers([adminWallet]).rpc();

    console.log("  Your transaction signature", tx);

    const sellerTokenAccountData = await getAccount(connection, sellerTokenAccountPda);
    const mintedTokenAccountData = await getMint(connection, mintedTokenAccountPda);
    console.log("  minted token account data: ", mintedTokenAccountData);
    expect(sellerTokenAccountData.amount.toString()).to.equals("100");
  });

  it("should return error when another signer other than deployer try to mint tokens", async()=>{
    try {
      const tokens_to_mint = 100;
      const tx = await program.methods.mintTokens(new anchor.BN(tokens_to_mint)).accounts({
        authority: adminWallet.publicKey,
        tokenProgram: tokenProgram,
        mintedTokenAccount: mintedTokenAccountPda,
        sellerTokenAccount: sellerTokenAccountPda,
      }).signers([newWallet]).rpc();

      console.log("  Your transaction signature", tx);
    } catch (error) {
      console.error(" error message: ",error.message);
    }
  });
});
