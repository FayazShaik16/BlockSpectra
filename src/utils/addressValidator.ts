// Comprehensive blockchain address format validator for EVM and non-EVM chains

export const EVM_CHAINS = new Set([
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
]);

const EVM_REGEX = /^0x[0-9a-fA-F]{40}$/;
const SOLANA_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SUI_REGEX = /^0x[0-9a-fA-F]{1,64}$/;
const APTOS_REGEX = /^0x[0-9a-fA-F]{1,64}(::[a-zA-Z_][a-zA-Z0-9_]*)*$/;
const BITCOIN_REGEX = /^(bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
const TRON_REGEX = /^(T[1-9A-HJ-NP-Za-km-z]{33}|41[0-9a-fA-F]{40})$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates whether an address matches the network format specifications.
 */
export function validateAddress(chain: string, address: string, fieldName = "address"): ValidationResult {
  const cleanAddr = (address || "").trim();
  const chainKey = (chain || "").trim().toLowerCase();

  if (!cleanAddr) {
    return {
      isValid: false,
      error: `Please enter a ${fieldName}.`
    };
  }

  if (EVM_CHAINS.has(chainKey)) {
    if (!EVM_REGEX.test(cleanAddr)) {
      return {
        isValid: false,
        error: `Invalid ${chain.toUpperCase()} address. EVM addresses must start with '0x' followed by 40 hex characters (e.g. 0x1234...5678).`
      };
    }
    if (cleanAddr.toLowerCase() === "0x0000000000000000000000000000000000000000") {
      return {
        isValid: false,
        error: "Null / Zero address (0x000...000) cannot be used."
      };
    }
    return { isValid: true };
  }

  if (chainKey === "solana" || chainKey === "sol") {
    if (!SOLANA_REGEX.test(cleanAddr)) {
      return {
        isValid: false,
        error: "Invalid Solana address. Must be a 32-44 character Base58 string (e.g. TokenkegQfe...)."
      };
    }
    return { isValid: true };
  }

  if (chainKey === "sui") {
    if (!SUI_REGEX.test(cleanAddr)) {
      return {
        isValid: false,
        error: "Invalid Sui address. Must start with '0x' followed by hexadecimal characters (up to 64 chars)."
      };
    }
    return { isValid: true };
  }

  if (chainKey === "aptos" || chainKey === "apt") {
    if (!APTOS_REGEX.test(cleanAddr)) {
      return {
        isValid: false,
        error: "Invalid Aptos address/module. Must start with '0x' followed by hexadecimal characters (e.g. 0x1::coin)."
      };
    }
    return { isValid: true };
  }

  if (chainKey === "bitcoin" || chainKey === "btc") {
    if (!BITCOIN_REGEX.test(cleanAddr)) {
      return {
        isValid: false,
        error: "Invalid Bitcoin address. Must start with '1', '3', or 'bc1' (e.g. bc1q...)."
      };
    }
    return { isValid: true };
  }

  if (chainKey === "tron" || chainKey === "trx") {
    if (!TRON_REGEX.test(cleanAddr)) {
      return {
        isValid: false,
        error: "Invalid TRON address. Must start with 'T' (34 Base58 chars) or '41' (hex)."
      };
    }
    return { isValid: true };
  }

  // Generic fallback for any other custom network
  if (cleanAddr.length < 20 || cleanAddr.includes(" ")) {
    return {
      isValid: false,
      error: `Invalid address format for ${chain}.`
    };
  }

  return { isValid: true };
}

/**
 * Returns dynamic placeholder string based on chain.
 */
export function getAddressPlaceholder(chain: string): string {
  const chainKey = (chain || "").trim().toLowerCase();
  if (EVM_CHAINS.has(chainKey)) {
    return "0x7a250d5630b4cf539739df2c5dacb4c659f2488d...";
  }
  if (chainKey === "solana" || chainKey === "sol") {
    return "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA...";
  }
  if (chainKey === "sui") {
    return "0x2::sui::SUI or 0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf...";
  }
  if (chainKey === "aptos" || chainKey === "apt") {
    return "0x1::aptos_coin::AptosCoin or 0x1...";
  }
  if (chainKey === "bitcoin" || chainKey === "btc") {
    return "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh...";
  }
  if (chainKey === "tron" || chainKey === "trx") {
    return "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t...";
  }
  return "Enter address...";
}
