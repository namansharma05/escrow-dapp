// app/layout.tsx
import { WalletContextProvider } from "@/components/WalletContextProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const metadata = {
    title: "Solana Escrow dApp",
    description: "A Solana dApp built with Next.js",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <WalletContextProvider>{children}</WalletContextProvider>
            </body>
        </html>
    );
}
