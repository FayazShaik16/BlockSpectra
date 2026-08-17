import re
from typing import Tuple, Optional

# Supported EVM chains
EVM_CHAINS = {
    "ethereum", "eth", "mainnet",
    "base",
    "arbitrum", "arb",
    "optimism", "op",
    "polygon", "matic",
    "bsc", "bnb", "binance",
    "avalanche", "avax",
    "linea",
    "scroll",
    "zksync"
}

# Regex patterns for blockchain address formats
EVM_ADDRESS_REGEX = re.compile(r"^0x[0-9a-fA-F]{40}$")
SOLANA_ADDRESS_REGEX = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")
SUI_ADDRESS_REGEX = re.compile(r"^0x[0-9a-fA-F]{1,64}$")
APTOS_ADDRESS_REGEX = re.compile(r"^0x[0-9a-fA-F]{1,64}(::[a-zA-Z_][a-zA-Z0-9_]*)*$")
BITCOIN_ADDRESS_REGEX = re.compile(r"^(bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$")
TRON_ADDRESS_REGEX = re.compile(r"^(T[1-9A-HJ-NP-Za-km-z]{33}|41[0-9a-fA-F]{40})$")

def validate_chain_address(chain: str, address: str, field_name: str = "address") -> Tuple[bool, Optional[str]]:
    """
    Validates a blockchain address format according to network specifications.
    
    Returns:
        (is_valid: bool, error_message: Optional[str])
    """
    if not address or not isinstance(address, str):
        return False, f"{field_name.capitalize()} is required."
    
    clean_addr = address.strip()
    if not clean_addr:
        return False, f"{field_name.capitalize()} cannot be empty."
    
    chain_key = (chain or "").strip().lower()

    if chain_key in EVM_CHAINS:
        if not EVM_ADDRESS_REGEX.match(clean_addr):
            return False, (
                f"Invalid {chain.upper()} address '{clean_addr}'. "
                f"EVM addresses must start with '0x' followed by exactly 40 hexadecimal characters."
            )
        if clean_addr.lower() == "0x0000000000000000000000000000000000000000":
            return False, f"Null / zero address ('{clean_addr}') cannot be used for analysis."
        return True, None

    elif chain_key in ["solana", "sol"]:
        if not SOLANA_ADDRESS_REGEX.match(clean_addr):
            return False, (
                f"Invalid Solana address '{clean_addr}'. "
                f"Solana addresses must be Base58 strings between 32 and 44 characters (e.g. 'TokenkegQfe...')."
            )
        return True, None

    elif chain_key in ["sui"]:
        if not SUI_ADDRESS_REGEX.match(clean_addr):
            return False, (
                f"Invalid Sui address '{clean_addr}'. "
                f"Sui addresses must start with '0x' followed by up to 64 hexadecimal characters."
            )
        return True, None

    elif chain_key in ["aptos", "apt"]:
        if not APTOS_ADDRESS_REGEX.match(clean_addr):
            return False, (
                f"Invalid Aptos address or module path '{clean_addr}'. "
                f"Aptos addresses must start with '0x' followed by hex characters (optional '::module')."
            )
        return True, None

    elif chain_key in ["bitcoin", "btc"]:
        if not BITCOIN_ADDRESS_REGEX.match(clean_addr):
            return False, (
                f"Invalid Bitcoin address '{clean_addr}'. "
                f"Must be a valid P2PKH (starts with 1), P2SH (starts with 3), or Bech32 (starts with bc1) address."
            )
        return True, None

    elif chain_key in ["tron", "trx"]:
        if not TRON_ADDRESS_REGEX.match(clean_addr):
            return False, (
                f"Invalid TRON address '{clean_addr}'. "
                f"TRON addresses must start with 'T' (Base58, 34 chars) or '41' (Hex, 42 chars)."
            )
        return True, None

    else:
        # Fallback general check: ensure it's not a generic random non-address string
        if len(clean_addr) < 20 or " " in clean_addr:
            return False, f"Invalid address format '{clean_addr}' for chain '{chain}'."
        return True, None
