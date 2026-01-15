## Solana Escrow DApp

A full-stack Solana escrow marketplace built with Anchor, React, Next.js, and Tailwind CSS. Users can mint SED tokens (admin-only) and buy tokens with SOL via escrow.

# ✨ Features

Admin Panel: Mint new SED tokens (deployer wallet only)

Token Store: Buy SED tokens with SOL (PDA escrow)

Wallet Authentication: Phantom/Solflare wallet integration

Token Balance Checks: Real-time seller token availability

Responsive UI: Tailwind CSS + mobile-first design

PDA Token Accounts: Program-Derived Addresses for seller/buyer tokens

# 🛠 Tech Stack

Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + @solana/wallet-adapter
Backend: Anchor (Rust) + Solana SPL Tokens
Testing: Anchor test framework + Chai

# 📁 Project Structure

escrow-dapp/
├── client/ # Next.js frontend
│ ├── app/ # App Router pages
│ ├── components/ # React components (Escrow.tsx)
│ ├── public/ # Static assets (token-image.jpg)
│ └── globals.css # Tailwind CSS
├── programs/escrow/ # Anchor Solana program
│ ├── src/
│ │ ├── lib.rs # Main program logic
│ │ ├── contexts.rs # Account validation
│ │ └── errors.rs # Custom errors
│ └── Anchor.toml
├── tests/ # Anchor tests (escrow.ts)
├── README.md
└── package.json

# 🚀 Quick Start

1. Clone & Install

```
git clone https://github.com/yourusername/escrow-dapp.git
cd escrow-dapp
cd client && npm install
cd ../ && anchor build
```

2. Environment Setup

```
cp client/.env.example client/.env.local
```

`solana-test-validator` 3. Deploy Program
`anchor deploy`
