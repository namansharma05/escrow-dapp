use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub sol_in_lamports: u64,
    pub token_price_lamports: u64,
    pub authority: Pubkey,
}
