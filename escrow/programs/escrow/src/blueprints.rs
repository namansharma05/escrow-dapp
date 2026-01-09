use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub sol_in_lamports: u64,
    pub buyer: Pubkey,
    pub timestamp: i64,
}
