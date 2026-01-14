// components/WalletContextProvider.tsx
"use client";

import { FC, ReactNode, useMemo, useCallback } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Don't import CSS here - we'll import it in layout.tsx instead

interface WalletContextProviderProps {
    children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({
    children,
}) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        []
    );

    // Add error handler to prevent crashes
    const onError = useCallback((error: any) => {
        console.error("Wallet error:", error);

        // Check for specific error types
        if (error.message?.includes("User rejected")) {
            console.log("User rejected the connection");
        } else if (error.message?.includes("wallet is not installed")) {
            alert("Please install Phantom or Solflare wallet extension");
        } else {
            console.log("Wallet connection error - check console for details");
        }
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider
                wallets={wallets}
                autoConnect={false}
                onError={onError}
            >
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
