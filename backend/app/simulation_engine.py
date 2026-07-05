import logging
import hashlib
import random
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class SimulationEngine:
    @staticmethod
    async def simulate(
        chain: str,
        backend: str,
        tx_type: str,
        sender: str,
        receiver: Optional[str] = None,
        amount: Optional[float] = None,
        token_address: Optional[str] = None,
        contract_address: Optional[str] = None,
        data: Optional[str] = None,
        value: Optional[float] = 0.0,
        gas_limit: Optional[int] = 1000000
    ) -> Dict[str, Any]:
        """
        Simulate transaction and return structured changes.
        """
        logger.info(f"Simulating {tx_type} on {chain} using {backend}")
        
        # Normalize inputs
        chain = chain.lower()
        backend = backend.lower()
        tx_type = tx_type.lower()
        receiver = receiver or ""
        token_address = token_address or ""
        contract_address = contract_address or ""
        data = data or ""
        amount = amount or 0.0
        value = value or 0.0
        gas_limit = gas_limit or 1000000

        # Deterministic simulation based on inputs hash
        input_str = f"{chain}:{backend}:{tx_type}:{sender}:{receiver}:{amount}:{token_address}:{contract_address}:{data}:{value}:{gas_limit}"
        seed = int(hashlib.md5(input_str.encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)

        # Pricing config for gas and tokens
        token_prices = {
            "usdt": 1.0, "usdc": 1.0, "dai": 1.0,
            "weth": 2500.0, "link": 15.0, "uni": 8.5,
            "sol": 150.0, "sui": 3.5, "apt": 9.0
        }
        native_prices = {
            "ethereum": 2500.0, "arbitrum": 2500.0, "base": 2500.0, "optimism": 2500.0,
            "solana": 150.0, "sui": 3.5, "aptos": 9.0
        }
        native_symbols = {
            "ethereum": "ETH", "arbitrum": "ETH", "base": "ETH", "optimism": "ETH",
            "solana": "SOL", "sui": "SUI", "aptos": "APT"
        }

        native_price = native_prices.get(chain, 1.0)
        native_symbol = native_symbols.get(chain, "ETH")

        # 1. Check for failure case simulation (e.g. if amount is 9999 or sender starts with 0x00000000)
        simulation_success = True
        error_message = None
        
        if amount > 1000000 or value > 1000000:
            simulation_success = False
            error_message = "INSUFFICIENT_BALANCE: Transaction requires more native or token balance than available."
        elif sender.startswith("0x00000000") or sender == "11111111111111111111111111111111":
            simulation_success = False
            error_message = "UNAUTHORIZED: Invalid signature or account address is not signed."
        elif contract_address.startswith("0xdead") or receiver.startswith("0xdead"):
            simulation_success = False
            error_message = "EXECUTION_REVERTED: Target contract threw error during call (revert: null address destination)."
        elif tx_type == "contract_call" and "fail" in data.lower():
            simulation_success = False
            error_message = "EXECUTION_REVERTED: Custom assert statement failed in smart contract logic."

        # Gas Calculations
        gas_used = 0
        if simulation_success:
            if tx_type == "transfer":
                gas_used = 21000 if not token_address else 55000
            elif tx_type == "swap":
                gas_used = 135000 + rng.randint(0, 15000)
            elif tx_type == "approval":
                gas_used = 45000
            else: # contract_call
                gas_used = 85000 + rng.randint(0, 120000)
        else:
            gas_used = rng.randint(15000, 45000)

        # Gas cost in USD
        if "ethereum" in chain or "base" in chain or "arbitrum" in chain or "optimism" in chain:
            # gas * gas_price (in gwei) * eth_price
            # Ethereum is ~25 gwei, L2s are ~0.1 gwei
            gas_price_gwei = 25.0 if chain == "ethereum" else 0.1
            gas_cost_usd = (gas_used * (gas_price_gwei * 1e-9)) * native_price
        elif chain == "solana":
            # SOL fee is flat (usually 0.000005 SOL)
            gas_cost_usd = 0.000005 * native_price
        else: # sui / aptos
            gas_cost_usd = 0.005 * native_price
            
        gas_cost_usd = round(gas_cost_usd, 6)

        # Build output objects
        execution_trace = []
        state_changes = []
        asset_changes = []
        events = []
        risk_analysis = []

        # Target address mapping labels
        sender_lbl = f"{sender[:6]}...{sender[-4:]}"
        receiver_lbl = f"{receiver[:6]}...{receiver[-4:]}" if receiver else ""
        token_lbl = f"{token_address[:6]}...{token_address[-4:]}" if token_address else ""
        contract_lbl = f"{contract_address[:6]}...{contract_address[-4:]}" if contract_address else ""

        # Default trace step
        main_trace = {
            "from": sender,
            "to": contract_address if tx_type in ("contract_call", "swap") else (token_address if tx_type == "approval" else receiver),
            "type": "CALL" if chain != "solana" else "INSTRUCTION",
            "gas": gas_limit,
            "gas_used": gas_used,
            "value": value,
            "input": data or "0x",
            "output": "0x0000000000000000000000000000000000000000000000000000000000000001" if simulation_success else "0x",
            "success": simulation_success
        }
        execution_trace.append(main_trace)

        # Check chain to build asset shifts & traces
        is_evm = chain in ("ethereum", "arbitrum", "base", "optimism")

        if simulation_success:
            if tx_type == "transfer":
                # Asset changes
                if not token_address: # Native transfer
                    asset_changes.append({
                        "token": native_symbol,
                        "type": "NATIVE",
                        "from": sender,
                        "to": receiver,
                        "amount": amount or value,
                        "dollar_value": (amount or value) * native_price
                    })
                    # State Changes
                    state_changes.append({
                        "address": sender,
                        "type": "Balance Update",
                        "variable": "balance",
                        "original": f"{1000.0} {native_symbol}",
                        "dirty": f"{1000.0 - (amount or value)} {native_symbol}"
                    })
                    state_changes.append({
                        "address": receiver,
                        "type": "Balance Update",
                        "variable": "balance",
                        "original": f"{10.0} {native_symbol}",
                        "dirty": f"{10.0 + (amount or value)} {native_symbol}"
                    })
                else: # ERC-20 transfer
                    sym = "USDT" if "dac" in token_address.lower() else "USDC"
                    price = token_prices.get(sym.lower(), 1.0)
                    asset_changes.append({
                        "token": sym,
                        "type": "ERC20" if is_evm else "TOKEN",
                        "from": sender,
                        "to": receiver,
                        "amount": amount,
                        "dollar_value": amount * price
                    })
                    # State Changes (balances mapping)
                    state_changes.append({
                        "address": token_address,
                        "type": "Storage",
                        "variable": f"balances[{sender}]",
                        "original": f"5000.0 {sym}",
                        "dirty": f"{5000.0 - amount} {sym}"
                    })
                    state_changes.append({
                        "address": token_address,
                        "type": "Storage",
                        "variable": f"balances[{receiver}]",
                        "original": f"0.0 {sym}",
                        "dirty": f"{amount} {sym}"
                    })
                    # Events
                    events.append({
                        "name": "Transfer" if is_evm else "transfer_event",
                        "contract": token_address,
                        "topics": [
                            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", # Transfer topic
                            f"0x{sender[2:].zfill(64)}" if is_evm else sender,
                            f"0x{receiver[2:].zfill(64)}" if is_evm else receiver
                        ],
                        "data": f"0x{hex(int(amount * 10**6))[2:].zfill(64)}"
                    })

                # Risks
                if receiver == "0x0000000000000000000000000000000000000000" or receiver == "11111111111111111111111111111111":
                    risk_analysis.append({
                        "severity": "HIGH",
                        "type": "burn_address",
                        "description": "Transaction transfers assets to the Zero/Burn Address, making them permanently unrecoverable."
                    })
                elif "tornado" in receiver.lower() or receiver == "0x72a587DB711757529870b1774e3067ddD24a4fcf":
                    risk_analysis.append({
                        "severity": "CRITICAL",
                        "type": "mixer_interaction",
                        "description": "Destination address is flagged as a privacy mixer or laundering contract (Tornado Cash). Risk of asset freezing."
                    })

            elif tx_type == "swap":
                # Uniswap/Dex Swap
                router_addr = contract_address or "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                # Input token: ETH or Token A
                # Output token: USDT or Token B
                in_sym = native_symbol if not token_address else "USDC"
                out_sym = "USDT" if not token_address else native_symbol
                
                in_price = native_price if in_sym == native_symbol else 1.0
                out_price = 1.0 if out_sym == "USDT" else native_price

                in_amount = amount or value or 1.0
                out_amount = round((in_amount * in_price) / out_price * 0.985, 4) # 1.5% fee/slippage

                # Traces
                router_trace = {
                    "from": sender,
                    "to": router_addr,
                    "type": "CALL",
                    "gas": gas_limit - 10000,
                    "gas_used": gas_used,
                    "value": value if in_sym == native_symbol else 0.0,
                    "input": "0x38ed5639...", # swapExactTokensForTokens hash
                    "output": "0x",
                    "success": True
                }
                pool_trace = {
                    "from": router_addr,
                    "to": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc", # Pool address
                    "type": "CALL",
                    "gas": gas_limit - 40000,
                    "gas_used": 65000,
                    "value": 0.0,
                    "input": "0x022c0d9f...", # swap hash
                    "output": "0x",
                    "success": True
                }
                execution_trace.append(router_trace)
                execution_trace.append(pool_trace)

                # Asset changes
                asset_changes.append({
                    "token": in_sym,
                    "type": "NATIVE" if in_sym == native_symbol else "TOKEN",
                    "from": sender,
                    "to": router_addr,
                    "amount": in_amount,
                    "dollar_value": in_amount * in_price
                })
                asset_changes.append({
                    "token": out_sym,
                    "type": "NATIVE" if out_sym == native_symbol else "TOKEN",
                    "from": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
                    "to": sender,
                    "amount": out_amount,
                    "dollar_value": out_amount * out_price
                })

                # State Changes
                state_changes.append({
                    "address": sender,
                    "type": "Balance",
                    "variable": f"balances[{in_sym}]",
                    "original": f"100.0 {in_sym}",
                    "dirty": f"{100.0 - in_amount} {in_sym}"
                })
                state_changes.append({
                    "address": sender,
                    "type": "Balance",
                    "variable": f"balances[{out_sym}]",
                    "original": f"0.0 {out_sym}",
                    "dirty": f"{out_amount} {out_sym}"
                })

                # Events
                events.append({
                    "name": "Swap",
                    "contract": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
                    "topics": [
                        "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
                        f"0x{router_addr[2:].zfill(64)}",
                        f"0x{sender[2:].zfill(64)}"
                    ],
                    "data": f"0x0000...{hex(int(in_amount * 10**18))[2:].zfill(32)}"
                })

                # Risks
                # 1. Slippage check
                if rng.random() > 0.6:
                    risk_analysis.append({
                        "severity": "MEDIUM",
                        "type": "price_slippage",
                        "description": "High slippage detected (2.5% price impact). You may receive fewer tokens than expected due to low liquidity in this pool."
                    })
                # 2. Token contract risks (check if malicious honeypot)
                if token_address and token_address.lower().startswith("0x666"):
                    risk_analysis.append({
                        "severity": "CRITICAL",
                        "type": "honeypot",
                        "description": "Target swap token contains custom tax mechanics (100% sell tax). You can buy this token but CANNOT sell it back."
                    })

            elif tx_type == "approval":
                # ERC20 Approval
                spender = receiver or "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                token_sym = "USDT" if "dac" in token_address.lower() else "USDC"
                
                # State changes
                state_changes.append({
                    "address": token_address,
                    "type": "Storage Slot",
                    "variable": f"allowances[{sender}][{spender}]",
                    "original": "0",
                    "dirty": f"{amount if amount > 0 else 'UNLIMITED'}"
                })
                # Events
                events.append({
                    "name": "Approval",
                    "contract": token_address,
                    "topics": [
                        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                        f"0x{sender[2:].zfill(64)}",
                        f"0x{spender[2:].zfill(64)}"
                    ],
                    "data": f"0x{hex(int(amount * 10**18))[2:].zfill(64)}" if amount > 0 else "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                })

                # Risks
                # Unlimited approval risk
                if amount <= 0 or amount > 1000000:
                    # check if spender is safe
                    is_safe_spender = spender.lower() in (
                        "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", # Uniswap Router
                        "0x3fc91a3afd20393e4024c96018afc62ec907a0b4", # Uniswap Permit2
                        "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b"  # Uniswap Universal Router
                    )
                    if not is_safe_spender:
                        risk_analysis.append({
                            "severity": "HIGH",
                            "type": "unlimited_approval",
                            "description": f"Unlimited approval granted to an untrusted contract ({spender_lbl}). If this contract is compromised or malicious, it can drain all your {token_sym} balance."
                        })
                    else:
                        risk_analysis.append({
                            "severity": "INFO",
                            "type": "router_approval",
                            "description": f"Unlimited approval granted to standard Uniswap Router. Safe to transact, but remember to revoke when finished."
                        })

            elif tx_type == "contract_call":
                # Custom contract call simulation
                target = contract_address or "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                # State changes
                state_changes.append({
                    "address": target,
                    "type": "Storage",
                    "variable": "nonce",
                    "original": "42",
                    "dirty": "43"
                })
                if value > 0:
                    state_changes.append({
                        "address": target,
                        "type": "Balance",
                        "variable": "balance",
                        "original": f"10.0 {native_symbol}",
                        "dirty": f"{10.0 + value} {native_symbol}"
                    })
                    asset_changes.append({
                        "token": native_symbol,
                        "type": "NATIVE",
                        "from": sender,
                        "to": target,
                        "amount": value,
                        "dollar_value": value * native_price
                    })

                # Events
                events.append({
                    "name": "ExecutedCall",
                    "contract": target,
                    "topics": [
                        "0x42df42...",
                        f"0x{sender[2:].zfill(64)}"
                    ],
                    "data": "0x0000000000000000000000000000000000000000000000000000000000000001"
                })

                # Traces
                sub_trace = {
                    "from": target,
                    "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7", # Call out to USDT as subcall
                    "type": "CALL",
                    "gas": gas_limit - 50000,
                    "gas_used": 20000,
                    "value": 0.0,
                    "input": "0xa9059cbb...", # transfer
                    "output": "0x",
                    "success": True
                }
                execution_trace.append(sub_trace)

                # Risks
                # 1. Reentrancy risk simulation if function is withdraw
                if "withdraw" in data.lower():
                    risk_analysis.append({
                        "severity": "CRITICAL",
                        "type": "reentrancy_threat",
                        "description": "Reentrancy threat detected! The contract calls sender address before updating internal balances, allowing recursive loops."
                    })
                # 2. Delegatecall warning
                if "delegate" in data.lower() or "delegatecall" in data.lower():
                    risk_analysis.append({
                        "severity": "HIGH",
                        "type": "dangerous_delegatecall",
                        "description": "Dangerous delegatecall instruction detected. The target contract runs external logic inside its own storage context, which can allow storage takeover."
                    })

        return {
            "simulation_success": simulation_success,
            "error_message": error_message,
            "gas_used": gas_used,
            "gas_cost_usd": gas_cost_usd,
            "execution_trace": execution_trace,
            "state_changes": state_changes,
            "asset_changes": asset_changes,
            "events": events,
            "risk_analysis": risk_analysis
        }
