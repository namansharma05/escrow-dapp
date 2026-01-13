use anchor_lang::prelude::*;
use anchor_lang::system_program::Transfer;
use anchor_spl::token::{mint_to, MintTo};

mod blueprints;
mod contexts;
mod errors;
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
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.authority = ctx.accounts.authority.key();
        escrow_account.token_price_lamports = 100_000_000;
        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, token_to_buy: u64) -> Result<()> {
        let total_lamports_to_transfer = token_to_buy
            .checked_mul(ctx.accounts.escrow_account.token_price_lamports)
            .unwrap();

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.escrow_account.to_account_info(),
            },
        );

        anchor_lang::system_program::transfer(cpi_context, total_lamports_to_transfer)?;

        let seller_seeds = &[
            b"seller_token_account".as_ref(),
            &[ctx.bumps.seller_token_account],
        ];
        let signer_seeds = &[&seller_seeds[..]];

        let transfer_token_cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.seller_token_account.to_account_info(),
            },
            signer_seeds,
        );

        anchor_spl::token::transfer(transfer_token_cpi_context, token_to_buy)?;

        Ok(())
    }
}
