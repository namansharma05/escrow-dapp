import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { Keypair } from "@solana/web3.js";
import { getAccount, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.escrow as Program<Escrow>;

  const adminWallet = (provider.wallet as NodeWallet).payer;
  const tokenProgram = TOKEN_PROGRAM_ID;

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
    console.log("admin wallet public key: ", adminWallet.publicKey.toBase58());
    console.log("token program: ",tokenProgram.toBase58());
    const tokens_to_mint = 100;
    const tx = await program.methods.mintTokens(new anchor.BN(tokens_to_mint)).accounts({
      authority: adminWallet.publicKey,
      tokenProgram: tokenProgram,
      mintedTokenAccount: mintedTokenAccountPda,
      sellerTokenAccount: sellerTokenAccountPda,
    }).signers([adminWallet]).rpc();

    console.log("Your transaction signature", tx);

    const sellerTokenAccountData = await getAccount(connection, sellerTokenAccountPda);

    console.log("Token Balance: ", sellerTokenAccountData.amount.toString());
  });
});
