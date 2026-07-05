import httpx
import logging
from typing import Optional, Tuple, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

# Etherscan V2 Chain IDs mapping
ETHERSCAN_V2_CHAINS = {
    "ethereum": 1,
    "arbitrum": 42161,
    "optimism": 10,
    "polygon": 137,
    "bnb": 56,
    "bsc": 56,
    "avalanche": 43114,
    "base": 8453,
    "linea": 59144,
    "scroll": 534352,
    "zkSync": 324
}

# Legacy Base API directories for other custom chains if needed
API_URLS = {
    "ethereum": ("https://api.etherscan.io/api", settings.ETHERSCAN_API_KEY),
    "arbitrum": ("https://api.arbiscan.io/api", settings.ARBISCAN_API_KEY),
    "optimism": ("https://api-optimistic.etherscan.io/api", settings.OP_ETHERSCAN_API_KEY),
    "polygon": ("https://api.polygonscan.com/api", settings.POLYGONSCAN_API_KEY),
    "bnb": ("https://api.bscscan.com/api", settings.BSCSCAN_API_KEY),
    "bsc": ("https://api.bscscan.com/api", settings.BSCSCAN_API_KEY),
    "avalanche": ("https://api.snowtrace.io/api", settings.SNOWTRACE_API_KEY),
}

# Blockscout public fallbacks when explorer APIs don't resolve code source
BLOCKSCOUT_EXPLORERS = {
    "ethereum": "https://eth.blockscout.com/api",
    "base": "https://base.blockscout.com/api",
    "arbitrum": "https://arbitrum.blockscout.com/api",
    "optimism": "https://optimism.blockscout.com/api",
    "polygon": "https://polygon.blockscout.com/api",
    "avalanche": "https://avalanche.blockscout.com/api",
    "bsc": "https://bsc.blockscout.com/api",
}

async def fetch_etherscan_source(chain: str, address: str) -> Optional[Tuple[str, str]]:
    """
    Query Etherscan API family (V2 or V1) for source code.
    Returns: Tuple[contract_name, source_code] or None
    """
    chain_id = ETHERSCAN_V2_CHAINS.get(chain)
    
    if chain_id:
        api_url = "https://api.etherscan.io/v2/api"
        api_key = settings.ETHERSCAN_API_KEY
        key_attr = f"{chain.upper()}_API_KEY" if chain != "ethereum" else "ETHERSCAN_API_KEY"
        if chain in ("bnb", "bsc"):
            key_attr = "BSCSCAN_API_KEY"
        elif chain == "optimism":
            key_attr = "OP_ETHERSCAN_API_KEY"
        elif chain == "avalanche":
            key_attr = "SNOWTRACE_API_KEY"
        
        specific_key = getattr(settings, key_attr, "")
        if specific_key:
            api_key = specific_key

        params = {
            "chainid": chain_id,
            "module": "contract",
            "action": "getsourcecode",
            "address": address,
        }
        if api_key:
            params["apikey"] = api_key
    else:
        config = API_URLS.get(chain)
        if not config:
            return None
        api_url, api_key = config
        if not api_key and settings.ETHERSCAN_API_KEY:
            api_key = settings.ETHERSCAN_API_KEY
            
        params = {
            "module": "contract",
            "action": "getsourcecode",
            "address": address,
        }
        if api_key:
            params["apikey"] = api_key

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(api_url, params=params)
            if response.status_code != 200:
                return None
            data = response.json()
            if data.get("status") == "1" and data.get("result"):
                result = data["result"][0]
                contract_name = result.get("ContractName", "Unknown")
                source_code = result.get("SourceCode", "")
                if source_code:
                    return contract_name, source_code
    except Exception as e:
        logger.error(f"Etherscan fetch exception on {chain}: {e}")
    
    return None

async def fetch_blockscout_source(chain: str, address: str) -> Optional[Tuple[str, str]]:
    """
    Fallback query to Blockscout Explorer public endpoints.
    """
    base_url = BLOCKSCOUT_EXPLORERS.get(chain)
    if not base_url:
        if chain == "linea":
            base_url = "https://explorer.linea.build/api"
        elif chain == "scroll":
            base_url = "https://blockscout.scroll.io/api"
        elif chain == "zkSync":
            base_url = "https://zksync-blockscout.io/api"
        else:
            return None

    params = {
        "module": "contract",
        "action": "getsourcecode",
        "address": address
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(base_url, params=params)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "1" and data.get("result"):
                    result = data["result"][0]
                    contract_name = result.get("ContractName", "Unknown")
                    source_code = result.get("SourceCode", "")
                    if source_code:
                        return contract_name, source_code
    except Exception as e:
        logger.error(f"Blockscout fetch exception on {chain}: {e}")
    return None

async def fetch_tx_receipt_logs(chain: str, tx_hash: str) -> Optional[List[Dict[str, Any]]]:
    """
    Fetch raw transaction receipt logs from explorer proxy API.
    """
    chain_id = ETHERSCAN_V2_CHAINS.get(chain)
    if chain_id:
        api_url = "https://api.etherscan.io/v2/api"
        api_key = settings.ETHERSCAN_API_KEY
        key_attr = f"{chain.upper()}_API_KEY" if chain != "ethereum" else "ETHERSCAN_API_KEY"
        if chain in ("bnb", "bsc"):
            key_attr = "BSCSCAN_API_KEY"
        elif chain == "optimism":
            key_attr = "OP_ETHERSCAN_API_KEY"
        elif chain == "avalanche":
            key_attr = "SNOWTRACE_API_KEY"
        
        specific_key = getattr(settings, key_attr, "")
        if specific_key:
            api_key = specific_key

        params = {
            "chainid": chain_id,
            "module": "proxy",
            "action": "eth_getTransactionReceipt",
            "txhash": tx_hash,
        }
        if api_key:
            params["apikey"] = api_key
    else:
        config = API_URLS.get(chain)
        if not config:
            return None
        api_url, api_key = config
        if not api_key and settings.ETHERSCAN_API_KEY:
            api_key = settings.ETHERSCAN_API_KEY

        params = {
            "module": "proxy",
            "action": "eth_getTransactionReceipt",
            "txhash": tx_hash,
        }
        if api_key:
            params["apikey"] = api_key

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(api_url, params=params)
            if response.status_code == 200:
                data = response.json()
                result = data.get("result")
                if isinstance(result, dict) and "logs" in result:
                    return result["logs"]
    except Exception as e:
        logger.error(f"Failed to fetch tx logs for {tx_hash} on {chain}: {e}")
    return None

async def fetch_address_logs(chain: str, address: str) -> Optional[List[Dict[str, Any]]]:
    """
    Fetch event logs of a contract address from explorer API.
    """
    chain_id = ETHERSCAN_V2_CHAINS.get(chain)
    if chain_id:
        api_url = "https://api.etherscan.io/v2/api"
        api_key = settings.ETHERSCAN_API_KEY
        key_attr = f"{chain.upper()}_API_KEY" if chain != "ethereum" else "ETHERSCAN_API_KEY"
        if chain in ("bnb", "bsc"):
            key_attr = "BSCSCAN_API_KEY"
        elif chain == "optimism":
            key_attr = "OP_ETHERSCAN_API_KEY"
        elif chain == "avalanche":
            key_attr = "SNOWTRACE_API_KEY"
        
        specific_key = getattr(settings, key_attr, "")
        if specific_key:
            api_key = specific_key

        params = {
            "chainid": chain_id,
            "module": "logs",
            "action": "getLogs",
            "address": address,
            "fromBlock": "0",
            "toBlock": "latest",
            "page": "1",
            "offset": "100",
        }
        if api_key:
            params["apikey"] = api_key
    else:
        config = API_URLS.get(chain)
        if not config:
            return None
        api_url, api_key = config
        if not api_key and settings.ETHERSCAN_API_KEY:
            api_key = settings.ETHERSCAN_API_KEY

        params = {
            "module": "logs",
            "action": "getLogs",
            "address": address,
            "fromBlock": "0",
            "toBlock": "latest",
            "page": "1",
            "offset": "100",
        }
        if api_key:
            params["apikey"] = api_key

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(api_url, params=params)
            if response.status_code == 200:
                data = response.json()
                result = data.get("result")
                if isinstance(result, list):
                    return result
    except Exception as e:
        logger.error(f"Failed to fetch address logs for {address} on {chain}: {e}")
    return None

async def fetch_tx_calldata(chain: str, tx_hash: str) -> Optional[Dict[str, Any]]:
    """
    Fetch transaction details (to, input, value) by tx hash.
    """
    chain_id = ETHERSCAN_V2_CHAINS.get(chain)
    if chain_id:
        api_url = "https://api.etherscan.io/v2/api"
        api_key = settings.ETHERSCAN_API_KEY
        key_attr = f"{chain.upper()}_API_KEY" if chain != "ethereum" else "ETHERSCAN_API_KEY"
        if chain in ("bnb", "bsc"):
            key_attr = "BSCSCAN_API_KEY"
        elif chain == "optimism":
            key_attr = "OP_ETHERSCAN_API_KEY"
        elif chain == "avalanche":
            key_attr = "SNOWTRACE_API_KEY"
        
        specific_key = getattr(settings, key_attr, "")
        if specific_key:
            api_key = specific_key

        params = {
            "chainid": chain_id,
            "module": "proxy",
            "action": "eth_getTransactionByHash",
            "txhash": tx_hash,
        }
        if api_key:
            params["apikey"] = api_key
    else:
        config = API_URLS.get(chain)
        if not config:
            return None
        api_url, api_key = config
        if not api_key and settings.ETHERSCAN_API_KEY:
            api_key = settings.ETHERSCAN_API_KEY

        params = {
            "module": "proxy",
            "action": "eth_getTransactionByHash",
            "txhash": tx_hash,
        }
        if api_key:
            params["apikey"] = api_key

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(api_url, params=params)
            if response.status_code == 200:
                data = response.json()
                result = data.get("result")
                if isinstance(result, dict) and "input" in result:
                    return {
                        "to": result.get("to", ""),
                        "input": result.get("input", "0x"),
                        "value": result.get("value", "0x0"),
                    }
    except Exception as e:
        logger.error(f"Failed to fetch tx details for {tx_hash} on {chain}: {e}")
    return None
