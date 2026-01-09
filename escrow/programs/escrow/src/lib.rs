use anchor_lang::prelude::*;

mod blueprints;
mod contexts;
use contexts::*;

declare_id!("63B271grPqQJSo5VvScRGU5oK5JHkTWxcbVVBxBSmHQm");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
