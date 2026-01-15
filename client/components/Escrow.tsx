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
    const [showMiniting, setShowMinting] = useState(false);
    const [tokenToMint, setTokenToMint] = useState<number | "">("");
    const [tokenToBuy, setTokenToBuy] = useState<number | "">("");
    const [tokenLeft, setTokenLeft] = useState<number | "">("");
    const [tokenPrice, setTokenPrice] = useState<number | "">("");
    const [tokenYouHave, setTokenYouHave] = useState<number>(0);

    const wallet = useAnchorWallet();

    const getProvider = () => {
        if (!wallet) return null;

        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");

        const provider = new anchor.AnchorProvider(
            connection,
            wallet,
            anchor.AnchorProvider.defaultOptions()
        );
        return provider;
    };

    const fetchTokenDetails = async () => {
        const provider = getProvider();
        const connection = provider?.connection;
        if (!provider) throw "Provider is null";

        const program = new anchor.Program(idl, provider);

        try {
            const [sellerTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("seller_token_account")],
                PROGRAM_ID
            );
            const [buyerTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("buyer_token_account"), publicKey!.toBuffer()],
                PROGRAM_ID
            );
            const [escrowAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow")],
                PROGRAM_ID
            );

            try {
                const sellerTokenAccountData = await getAccount(
                    connection!,
                    sellerTokenAccountPda
                );
                setTokenLeft(Number(sellerTokenAccountData.amount));
            } catch (error) {
                console.log("Seller token account not found, setting to 0");
                setTokenLeft(0);
            }

            try {
                const escrowAccountData = await program.account.escrow.fetch(
                    escrowAccountPda
                );
                setTokenPrice(
                    Number(
                        escrowAccountData.tokenPriceLamports /
                            anchor.web3.LAMPORTS_PER_SOL
                    )
                );
            } catch (error) {
                console.log("Escrow account not found");
                setTokenPrice(0);
            }

            try {
                const buyerTokenAccountData = await getAccount(
                    connection!,
                    buyerTokenAccountPda
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

        const program = new anchor.Program(idl, provider);

        try {
            const [mintedTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("minted_token_account")],
                PROGRAM_ID
            );
            const [sellerTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("seller_token_account")],
                PROGRAM_ID
            );
            const [buyerTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("buyer_token_account"), publicKey!.toBuffer()],
                PROGRAM_ID
            );
            const [escrowAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow")],
                PROGRAM_ID
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

        const program = new anchor.Program(idl, provider);

        try {
            const [mintedTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("minted_token_account")],
                PROGRAM_ID
            );
            const [sellerTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("seller_token_account")],
                PROGRAM_ID
            );
            const [buyerTokenAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("buyer_token_account"), publicKey!.toBuffer()],
                PROGRAM_ID
            );
            const [escrowAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow")],
                PROGRAM_ID
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
        <div className="">
            {publicKey?.toBase58() == ADMIN_KEY.toBase58() ? (
                <div>
                    <button
                        onClick={handleStoreClick}
                        className="bg-[#512da8] hover:bg-gray-900 text-white h-10 w-25 mr-5 rounded-sm"
                    >
                        Store
                    </button>
                    <button
                        onClick={handleAdminClick}
                        className="bg-[#512da8] hover:bg-gray-900 text-white h-10 w-25 rounded-sm"
                    >
                        Admin
                    </button>
                </div>
            ) : null}

            {showMiniting && publicKey?.toBase58() == ADMIN_KEY.toBase58() ? (
                <div>
                    <div className="h-30 w-100 bg-[#9172da] mt-4 pt-5 rounded-sm text-white">
                        <input
                            type="number"
                            min="1"
                            value={tokenToMint}
                            onChange={handleMintTokenChange}
                            placeholder="Enter Tokens To Mint"
                            className="bg-[#512da8] h-20 w-65 mr-5 rounded-lg"
                        ></input>
                        <button
                            onClick={mintTokens}
                            className="bg-[#512da8] hover:bg-gray-900 h-20 w-20 rounded-lg"
                        >
                            MINT
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-100 w-100 bg-[#9172da] mt-4 rounded-sm text-white">
                    <div className="flex">
                        <div className="bg-[url(/token-image.jpg)] bg-cover bg-center h-45 w-55 m-5 rounded-lg"></div>
                        <div className="h-45 w-55 bg-[#512da8] mt-5 mr-5 mb-5 rounded-lg flex flex-col items-center justify-center">
                            <p className="text-[22px]">SED TOKEN</p>
                            <div className="text-start">
                                <p>Token Price: {tokenPrice} SOL</p>
                                <p>Token Left: {tokenLeft} SED</p>
                            </div>
                        </div>
                    </div>
                    <input
                        type="number"
                        min="1"
                        value={tokenToBuy}
                        onChange={handleBuyTokenChange}
                        placeholder="Enter Tokens To Buy"
                        className="bg-[#512da8] h-20 w-65 mr-5 rounded-lg"
                    ></input>
                    <button
                        onClick={buyTokens}
                        className="bg-[#512da8] hover:bg-gray-900 h-20 w-20 rounded-lg"
                    >
                        BUY
                    </button>
                    <div className="h-15 w-90 bg-[#512da8] mt-5 ml-5 rounded-lg flex justify-center items-center text-xl">
                        You have {tokenYouHave} SED Tokens
                    </div>
                </div>
            )}
        </div>
    );
};
