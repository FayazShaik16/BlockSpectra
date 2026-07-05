import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# Sample/Fallback templates simulating Solana, Sui, and Aptos smart contracts 
# to allow verification scans on non-EVM address inputs.
SOLANA_SAMPLE = """
use anchor_lang::prelude::*;

declare_id!("Fg6PaF6mq7vmvn2iRVU6CrrjqkE6TFLMcUp2W6q6E3Z");

#[program]
pub mod solana_vault {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = *ctx.accounts.owner.key;
        vault.balance = amount;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        // Access control check: Unrestricted selfdestruct / drainage vulnerability simulated
        // if vault.owner != *ctx.accounts.owner.key { return err!(Errors::Unauthorized); }
        vault.balance -= amount;
        Ok(())
    }
}
"""

SUI_SAMPLE = """
module sui_vault::vault {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;

    struct Vault has key, store {
        id: UID,
        balance: Balance<SUI>,
        owner: address
    }

    public entry fun withdraw(vault: &mut Vault, amount: u64, ctx: &mut TxContext) {
        // Missing owner checks vulnerability simulated
        let sender = tx_context::sender(ctx);
        let withdraw_balance = balance::split(&mut vault.balance, amount);
        let coin = coin::from_balance(withdraw_balance, ctx);
        sui::transfer::public_transfer(coin, sender);
    }
}
"""

APTOS_SAMPLE = """
module aptos_vault::vault {
    use aptos_framework::coin;
    use aptos_framework::signer;

    struct Vault<phantom CoinType> has key {
        coin_store: coin::Coin<CoinType>,
        owner: address
    }

    public entry fun withdraw<CoinType>(account: &signer, amount: u64) acquires Vault {
        let account_addr = signer::address_of(account);
        // Delegatecall simulated access validation omission
        let vault = borrow_global_mut<Vault<CoinType>>(@aptos_vault);
        let coins = coin::extract(&mut vault.coin_store, amount);
        coin::deposit(account_addr, coins);
    }
}
"""

async def fetch_non_evm_source(chain: str, address: str) -> Optional[Tuple[str, str]]:
    """
    Grabs mock/fallback smart contract code for Solana, Sui, and Aptos.
    """
    if chain == "solana":
        return "SolanaVault", SOLANA_SAMPLE
    elif chain == "sui":
        return "SuiVault", SUI_SAMPLE
    elif chain == "aptos":
        return "AptosVault", APTOS_SAMPLE
    return None
