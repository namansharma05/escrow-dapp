import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import idl from "../app/idl/escrow.json";

import { getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface EscrowProps {
  publicKey: PublicKey;
}

// Replace with your program ID
const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;

if (!programId) {
  throw new Error("NEXT_PUBLIC_PROGRAM_ID is not defined");
}

const PROGRAM_ID = new PublicKey(programId);

const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
if (!adminKey) {
  throw new Error("NEXT_PUBLIC_ADMIN_KEY is not defined");
}

const ADMIN_KEY = new PublicKey(adminKey);

export const Escrow: FC<EscrowProps> = ({ publicKey }) => {
  const [showMinting, setShowMinting] = useState(false);

  const [tokenToMint, setTokenToMint] = useState<number | "">("");
  const [tokenToBuy, setTokenToBuy] = useState<number | "">("");
  const [tokenLeft, setTokenLeft] = useState<number | "">("");
  const [tokenPrice, setTokenPrice] = useState<number | "">("");
  const [tokenYouHave, setTokenYouHave] = useState<number>(0);

  const wallet = useAnchorWallet();

  const getProvider = () => {
    if (!wallet) return null;

    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network, "processed");

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      anchor.AnchorProvider.defaultOptions(),
    );
    return provider;
  };

  const fetchTokenDetails = async () => {
    const provider = getProvider();
    const connection = provider?.connection;
    if (!provider) throw "Provider is null";

    const program = new anchor.Program(idl as any, provider);

    try {
      const [sellerTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("seller_token_account")],
        PROGRAM_ID,
      );
      const [buyerTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("buyer_token_account"), publicKey!.toBuffer()],
        PROGRAM_ID,
      );
      const [escrowAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow")],
        PROGRAM_ID,
      );

      try {
        const sellerTokenAccountData = await getAccount(
          connection!,
          sellerTokenAccountPda,
        );
        setTokenLeft(Number(sellerTokenAccountData.amount));
      } catch (error) {
        console.log("Seller token account not found, setting to 0");
        setTokenLeft(0);
      }

      try {
        const escrowAccountData = await (program.account as any).escrow.fetch(
          escrowAccountPda,
        );
        setTokenPrice(
          Number(
            escrowAccountData.tokenPriceLamports / anchor.web3.LAMPORTS_PER_SOL,
          ),
        );
      } catch (error) {
        console.log("Escrow account not found");
        setTokenPrice(0);
      }

      try {
        const buyerTokenAccountData = await getAccount(
          connection!,
          buyerTokenAccountPda,
        );
        setTokenYouHave(Number(buyerTokenAccountData.amount));
      } catch (error) {
        console.log("Buyer token account not found yet, setting to 0");
        setTokenYouHave(0);
      }
    } catch (error) {
      console.log("error while fetching details: ", error);
    }
  };
  const mintTokens = async () => {
    const provider = getProvider();
    const connection = provider?.connection;
    if (!provider) throw "Provider is null";

    const program = new anchor.Program(idl as any, provider);

    try {
      const [mintedTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("minted_token_account")],
        PROGRAM_ID,
      );
      const [sellerTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("seller_token_account")],
        PROGRAM_ID,
      );
      const [buyerTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("buyer_token_account"), publicKey!.toBuffer()],
        PROGRAM_ID,
      );
      const [escrowAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow")],
        PROGRAM_ID,
      );

      await program.methods
        .mintTokens(new anchor.BN(tokenToMint))
        .accounts({
          authority: publicKey!,
          tokenProgram: TOKEN_PROGRAM_ID,
          mintedTokenAccount: mintedTokenAccountPda,
          sellerTokenAccount: sellerTokenAccountPda,
          escrowAccount: escrowAccountPda,
        })
        .rpc();

      console.log("Tokens minted successfully!");
      await fetchTokenDetails();
    } catch (error) {
      console.log("error minting tokens: ", error);
    }
  };

  const buyTokens = async () => {
    const provider = getProvider();
    const connection = provider?.connection;
    if (!provider) throw "Provider is null";

    const program = new anchor.Program(idl as any, provider);

    try {
      const [mintedTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("minted_token_account")],
        PROGRAM_ID,
      );
      const [sellerTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("seller_token_account")],
        PROGRAM_ID,
      );
      const [buyerTokenAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("buyer_token_account"), publicKey!.toBuffer()],
        PROGRAM_ID,
      );
      const [escrowAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow")],
        PROGRAM_ID,
      );

      await program.methods
        .buyTokens(new anchor.BN(tokenToBuy))
        .accounts({
          authority: publicKey!,
          adminWallet: ADMIN_KEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          buyerTokenAccount: buyerTokenAccountPda,
          sellerTokenAccount: sellerTokenAccountPda,
          mintedTokenAccount: mintedTokenAccountPda,
          escrowAccount: escrowAccountPda,
        })
        .rpc();

      console.log("Tokens bought successfully!");

      await fetchTokenDetails();
    } catch (error) {
      console.log("error while buying tokens: ", error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchTokenDetails();
    }
  }, [publicKey]);

  const handleStoreClick = async () => {
    setShowMinting(false);
  };

  const handleAdminClick = async () => {
    setShowMinting(true);
  };

  const handleMintTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow valid numbers or empty
    if (value === "" || /^\d+$/.test(value)) {
      setTokenToMint(value === "" ? "" : Number(value));
    }
  };

  const handleBuyTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTokenToBuy(value === "" ? "" : Number(value));
    }
  };
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8">
      {publicKey?.toBase58() == ADMIN_KEY.toBase58() ? (
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleStoreClick}
            className={`px-8 py-2 rounded-full border border-white transition-all duration-300 ease-in-out font-medium ${
              !showMinting
                ? "bg-white text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            Store
          </button>
          <button
            onClick={handleAdminClick}
            className={`px-8 py-2 rounded-full border border-white transition-all duration-300 ease-in-out font-medium ${
              showMinting
                ? "bg-white text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            Admin
          </button>
        </div>
      ) : null}

      {showMinting && publicKey?.toBase58() == ADMIN_KEY.toBase58() ? (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white text-center">
            Mint SED Tokens
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="number"
              min="1"
              value={tokenToMint}
              onChange={handleMintTokenChange}
              placeholder="Enter Tokens To Mint"
              className="bg-black/40 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={mintTokens}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
            >
              MINT TOKENS
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/2 aspect-square bg-[url(/token-image.jpg)] bg-cover bg-center rounded-2xl shadow-inner border border-white/10"></div>
            <div className="w-full md:w-1/2 bg-purple-900/40 p-6 rounded-2xl flex flex-col items-center justify-center border border-white/5">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white mb-2">
                SED TOKEN
              </p>
              <div className="space-y-1 text-center text-purple-100">
                <p className="text-sm opacity-80">Price</p>
                <p className="font-semibold">{tokenPrice} SOL</p>
                <div className="h-px w-full bg-white/10 my-2"></div>
                <p className="text-sm opacity-80">Remaining</p>
                <p className="font-semibold">{tokenLeft} SED</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="number"
              min="1"
              value={tokenToBuy}
              onChange={handleBuyTokenChange}
              placeholder="Total Tokens to Buy"
              className="flex-grow bg-black/40 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={buyTokens}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 sm:w-32"
            >
              BUY
            </button>
          </div>

          <div className="w-full bg-white/5 border border-white/5 py-4 px-6 rounded-xl flex justify-center items-center text-lg font-medium text-purple-200">
            You have{" "}
            <span className="mx-2 text-white font-bold">{tokenYouHave}</span>{" "}
            SED Tokens
          </div>
        </div>
      )}
    </div>
  );
};
