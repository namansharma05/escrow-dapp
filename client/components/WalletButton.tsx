// components/WalletButton.tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { Escrow } from "./Escrow";

export const WalletButton = () => {
    const { publicKey, connected } = useWallet();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering until client-side
    if (!mounted) {
        return <div className="h-12 w-40 bg-gray-200 animate-pulse rounded" />;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <WalletMultiButton />

            {connected && publicKey && (
                <div className="text-center">
                    <Escrow publicKey={publicKey} />
                </div>
            )}
        </div>
    );
};
