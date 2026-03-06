// app/page.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import WalletButton with no SSR to prevent hydration errors
const WalletButton = dynamic(
  () => import("@/components/WalletButton").then((mod) => mod.WalletButton),
  { ssr: false },
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center transition-all duration-300 ease-in-out hover:scale-105">
        Solana Escrow dApp
      </h1>
      <WalletButton />
    </main>
  );
}
