use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, MintTo};

mod blueprints;
mod contexts;
use contexts::*;

declare_id!("63B271grPqQJSo5VvScRGU5oK5JHkTWxcbVVBxBSmHQm");

#[program]
pub mod escrow {

    use super::*;

    pub fn mint_tokens(ctx: Context<CreateMint>, token_amount_to_mint: u64) -> Result<()> {
        let mint_authority_seeds = &[
            b"seller_token_account".as_ref(),
            &[ctx.bumps.seller_token_account],
        ];
        let signer_seeds = &[&mint_authority_seeds[..]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.minted_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.seller_token_account.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(cpi_context, token_amount_to_mint)?;
        Ok(())
    }

    pub fn buy_tokens(_ctx: Context<BuyTokens>, _token_to_buy: u16) -> Result<()> {
        // let timestamp = Clock::get()?.unix_timestamp;
        // let escrow_account = &mut ctx.accounts.escrow_account;
        // escrow_account.authority = ctx.accounts.authority.key();
        // escrow_account.timestamp = timestamp;
        // escrow_account.token_price_lamports = 100_000_000;

        // let minted_token_account = &mut ctx.accounts.minted_token_account;

        // let buyer_token_account = &mut ctx.accounts.buyer_token_account;
        // let seller_token_account = &mut ctx.accounts.seller_token_account;

        Ok(())
    }
}
