use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::blueprints::*;

pub const DEPLOYER: Pubkey = pubkey!("29KKX9fQspSenNUibR9fxJCLvwGfozFPGbt486SF8JqY");

#[derive(Accounts)]
pub struct CloseAccounts<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow"],
        close = authority,
        bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        mut,
        mint::decimals = 0,
        mint::authority = seller_token_account,
        seeds = [b"minted_token_account"],
        bump,
    )]
    pub minted_token_account: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = minted_token_account,
        token::authority = authority,
        seeds = [b"buyer_token_account", authority.key().as_ref()],
        bump,
    )]
    pub buyer_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = minted_token_account,
        token::authority = seller_token_account.owner,
        token::token_program = token_program,
        seeds = [b"seller_token_account"],
        bump,
    )]
    pub seller_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow"],
        bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    pub minted_token_account: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = minted_token_account,
        token::authority = authority,
        seeds = [b"buyer_token_account", authority.key().as_ref()],
        bump,
    )]
    pub buyer_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"seller_token_account"],
        bump,
    )]
    pub seller_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(mut, constraint = authority.key() == DEPLOYER)]
    pub authority: Signer<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        mint::decimals = 0,
        mint::authority = seller_token_account,
        seeds = [b"minted_token_account"],
        bump,
    )]
    pub minted_token_account: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow"],
        bump,
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        init_if_needed,
        payer = authority,
        token::mint = minted_token_account,
        token::authority = seller_token_account,
        seeds = [b"seller_token_account"],
        bump,
    )]
    pub seller_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
