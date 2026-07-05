import uuid
import logging
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from app.database import AsyncSessionLocal
from app.agent_schemas import SourceCard

# Import models
from app.models import ContractAnalysis
from app.wallet_models import WalletAnalysis
from app.graph_models import GraphAnalysis
from app.simulation_models import TransactionSimulation

# Import tasks
from app.tasks import run_async_analysis_task
from app.wallet_tasks import run_wallet_analysis_task
from app.graph_tasks import run_graph_build_task
from app.simulation_tasks import run_transaction_simulation_task

# Import engines & schemas
from app.threat_intelligence import ThreatIntelligenceEngine
from app.threat_schemas import ThreatAnalysisRequest
from app.risk_engine import RiskEngine
from app.risk_schemas import RiskAnalysisRequest
from app.bridge_intelligence import BridgeIntelligenceEngine
from app.bridge_schemas import BridgeAnalysisRequest
from app.event_intelligence import EventIntelligenceEngine
from app.event_schemas import EventAnalysisRequest

logger = logging.getLogger(__name__)

# JSON-serializable converter for DB models
def serialize_db_model(model_instance) -> Dict[str, Any]:
    if not model_instance:
        return {}
    data = {}
    for col in model_instance.__table__.columns:
        val = getattr(model_instance, col.name)
        if isinstance(val, datetime):
            data[col.name] = val.isoformat()
        else:
            data[col.name] = val
    return data

# Definitions of tools for OpenRouter function calling
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "analyze_contract",
            "description": "Analyze a smart contract for security vulnerabilities and risk factors using heuristics and static analysis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "chain": {
                        "type": "str",
                        "description": "Blockchain network (e.g. ethereum, arbitrum, optimism, polygon, bsc, avalanche, solana)"
                    },
                    "address": {
                        "type": "str",
                        "description": "Smart contract address to scan"
                    }
                },
                "required": ["chain", "address"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_wallet",
            "description": "Analyze a wallet address for risk profile, total balance, token/NFT holdings, and counterparty connections.",
            "parameters": {
                "type": "object",
                "properties": {
                    "chain": {
                        "type": "str",
                        "description": "Blockchain network (e.g. ethereum, arbitrum, optimism, polygon, bsc, avalanche, solana)"
                    },
                    "address": {
                        "type": "str",
                        "description": "Wallet address to scan"
                    }
                },
                "required": ["chain", "address"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "build_attack_graph",
            "description": "Build and analyze a cross-chain asset movement attack graph starting from a seed address to identify hacker paths.",
            "parameters": {
                "type": "object",
                "properties": {
                    "chain": {
                        "type": "str",
                        "description": "Blockchain network where the investigation starts"
                    },
                    "address": {
                        "type": "str",
                        "description": "Seed transaction/wallet/contract address"
                    }
                },
                "required": ["chain", "address"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "simulate_transaction",
            "description": "Simulate a mock transaction on EVM/non-EVM blockchains to detect state changes, asset movements, and risks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "chain": {
                        "type": "str",
                        "description": "Blockchain network (e.g. ethereum, arbitrum, solana, aptos, sui)"
                    },
                    "sender": {
                        "type": "str",
                        "description": "Sender wallet address"
                    },
                    "receiver": {
                        "type": "str",
                        "description": "Receiver wallet/contract address"
                    },
                    "amount": {
                        "type": "number",
                        "description": "Transfer amount in native / token units"
                    },
                    "token_address": {
                        "type": "str",
                        "description": "Optional token contract address for token transfers"
                    },
                    "contract_address": {
                        "type": "str",
                        "description": "Optional destination smart contract address"
                    },
                    "data": {
                        "type": "str",
                        "description": "Optional hexadecimal execution payload data"
                    },
                    "value": {
                        "type": "str",
                        "description": "Optional transaction value in Wei (as a string)"
                    },
                    "gas_limit": {
                        "type": "integer",
                        "description": "Optional maximum gas limit"
                    },
                    "tx_type": {
                        "type": "str",
                        "description": "Transaction type: transfer, swap, contract_call, approve, mint, burn"
                    }
                },
                "required": ["chain", "sender", "receiver", "amount"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_threats",
            "description": "Correlate threat indicators (wallets, CVEs, IPs, hashes, exploit logs) with threat intelligence feeds like OpenCTI, MISP, MITRE ATT&CK.",
            "parameters": {
                "type": "object",
                "properties": {
                    "indicator": {
                        "type": "str",
                        "description": "The indicator of compromise (IOC) to analyze (e.g. 0x..., CVE-2024-..., raw exploit signature)"
                    },
                    "indicator_type": {
                        "type": "str",
                        "description": "Category: wallet, ip, domain, file_hash, cve, smart_contract, text"
                    }
                },
                "required": ["indicator"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_risk",
            "description": "Evaluate centralized risk scoring for an entity based on contract findings, wallet intelligence, threat feeds, and anomaly scores.",
            "parameters": {
                "type": "object",
                "properties": {
                    "contract_findings": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "vulnerability": {"type": "str"},
                                "severity": {"type": "str"},
                                "description": {"type": "str"}
                            },
                            "required": ["vulnerability", "severity", "description"]
                        }
                    },
                    "wallet_intelligence": {
                        "type": "object",
                        "properties": {
                            "wallet_score": {"type": "integer"},
                            "behavior_flags": {
                                "type": "array",
                                "items": {"type": "str"}
                            }
                        },
                        "required": ["wallet_score"]
                    },
                    "threat_intelligence": {
                        "type": "object",
                        "properties": {
                            "severity": {"type": "str"},
                            "confidence_score": {"type": "number"},
                            "threat_actor": {"type": "str"},
                            "campaign": {"type": "str"}
                        },
                        "required": ["severity", "confidence_score"]
                    },
                    "transaction_anomalies": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "slippage": {"type": "number"},
                                "anomaly_score": {"type": "number"},
                                "description": {"type": "str"}
                            },
                            "required": ["anomaly_score"]
                        }
                    },
                    "bridge_activity": {
                        "type": "object",
                        "properties": {
                            "volume_usd": {"type": "number"},
                            "target_chain": {"type": "str"},
                            "frequency_24h": {"type": "integer"}
                        },
                        "required": ["volume_usd", "target_chain", "frequency_24h"]
                    },
                    "event_analysis": {
                        "type": "object",
                        "properties": {
                            "upgrade_events_count": {"type": "integer"},
                            "ownership_changes_count": {"type": "integer"},
                            "suspicious_events_count": {"type": "integer"}
                        },
                        "required": ["upgrade_events_count", "ownership_changes_count", "suspicious_events_count"]
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_bridge",
            "description": "Analyze cross-chain bridge activity, tracking volumes, protocols, recipient addresses, and looking for bridging exploits or anomalies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bridge_protocol": {
                        "type": "str",
                        "description": "Protocol: layerzero, wormhole, across, stargate, hop, native"
                    },
                    "source_chain": {
                        "type": "str",
                        "description": "Source blockchain"
                    },
                    "destination_chain": {
                        "type": "str",
                        "description": "Destination blockchain"
                    },
                    "sender_address": {
                        "type": "str",
                        "description": "Address of the sender"
                    },
                    "amount_usd": {
                        "type": "number",
                        "description": "Dollar volume of the transfer"
                    },
                    "token": {
                        "type": "str",
                        "description": "Token symbol or address being bridged"
                    },
                    "tx_hash": {
                        "type": "str",
                        "description": "Transaction hash"
                    }
                },
                "required": ["bridge_protocol", "source_chain", "destination_chain", "sender_address", "amount_usd"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_events",
            "description": "Analyze blockchain log events (transfers, mints, burns, bridge events, swaps, proxy upgrades) to map asset movements and timelines.",
            "parameters": {
                "type": "object",
                "properties": {
                    "chain": {
                        "type": "str",
                        "description": "Chain name (ethereum, solana, sui, aptos)"
                    },
                    "logs": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "description": "Raw logs / instruction event details"
                        },
                        "description": "Array of blockchain event logs"
                    }
                },
                "required": ["chain", "logs"]
            }
        }
    }
]

async def execute_tool(name: str, arguments: Dict[str, Any]) -> Tuple[Dict[str, Any], SourceCard]:
    """
    Executes an investigator tool by mapping it to internal functions/engines.
    Returns: (raw_result_dict, source_card_object)
    """
    logger.info(f"Executing tool {name} with args: {arguments}")

    if name == "analyze_contract":
        chain = arguments.get("chain", "ethereum").lower()
        address = arguments.get("address", "")
        analysis_id = str(uuid.uuid4())

        async with AsyncSessionLocal() as db:
            db_analysis = ContractAnalysis(
                id=analysis_id,
                chain=chain,
                address=address,
                status="PENDING",
                findings=[],
                risk_score=0,
                confidence_score=0
            )
            db.add(db_analysis)
            await db.commit()

        # Run task synchronously
        await run_async_analysis_task(analysis_id)

        # Reload completed record
        async with AsyncSessionLocal() as db:
            db_analysis = await db.get(ContractAnalysis, analysis_id)
            result = serialize_db_model(db_analysis)

        summary = f"Smart Contract Security Audit for {result.get('contract_name') or address[:10]}. Risk Score: {result.get('risk_score', 0)}/100. Severity: {result.get('severity', 'INFO')}."
        card = SourceCard(
            tool_name="analyze_contract",
            summary=summary,
            data=result,
            severity=result.get("severity", "INFO").upper(),
            chain=chain
        )
        return result, card

    elif name == "analyze_wallet":
        chain = arguments.get("chain", "ethereum").lower()
        address = arguments.get("address", "")
        analysis_id = str(uuid.uuid4())

        async with AsyncSessionLocal() as db:
            db_analysis = WalletAnalysis(
                id=analysis_id,
                chain=chain,
                address=address,
                status="PENDING",
                wallet_score=50,
                risk_level="UNKNOWN",
                total_balance_usd=0.0,
                token_holdings=[],
                nft_holdings=[],
                transaction_summary={},
                approvals=[],
                counterparties=[],
                behavior_flags=[]
            )
            db.add(db_analysis)
            await db.commit()

        await run_wallet_analysis_task(analysis_id)

        async with AsyncSessionLocal() as db:
            db_analysis = await db.get(WalletAnalysis, analysis_id)
            result = serialize_db_model(db_analysis)

        summary = f"Wallet analysis completed. Balance: ${result.get('total_balance_usd', 0):,.2f}. Score: {result.get('wallet_score', 50)}/100. Risk level: {result.get('risk_level', 'UNKNOWN')}. Behavior flags: {', '.join(result.get('behavior_flags', [])) or 'None'}."
        card = SourceCard(
            tool_name="analyze_wallet",
            summary=summary,
            data=result,
            severity="CRITICAL" if result.get("risk_level") == "CRITICAL" else ("HIGH" if result.get("risk_level") == "HIGH" else ("MEDIUM" if result.get("risk_level") == "MEDIUM" else "INFO")),
            chain=chain
        )
        return result, card

    elif name == "build_attack_graph":
        chain = arguments.get("chain", "ethereum").lower()
        address = arguments.get("address", "")
        analysis_id = str(uuid.uuid4())

        async with AsyncSessionLocal() as db:
            db_analysis = GraphAnalysis(
                id=analysis_id,
                chain=chain,
                address=address,
                status="PENDING",
                nodes=[],
                edges=[],
                report={}
            )
            db.add(db_analysis)
            await db.commit()

        await run_graph_build_task(analysis_id)

        async with AsyncSessionLocal() as db:
            db_analysis = await db.get(GraphAnalysis, analysis_id)
            result = serialize_db_model(db_analysis)

        summary = f"Cross-chain attack graph built starting from {address[:10]} on {chain}. Identified {len(result.get('nodes', []))} nodes and {len(result.get('edges', []))} links."
        card = SourceCard(
            tool_name="build_attack_graph",
            summary=summary,
            data=result,
            severity="HIGH" if len(result.get("edges", [])) > 5 else "INFO",
            chain=chain
        )
        return result, card

    elif name == "simulate_transaction":
        chain = arguments.get("chain", "ethereum").lower()
        sender = arguments.get("sender", "")
        receiver = arguments.get("receiver", "")
        amount = arguments.get("amount", 0.0)
        sim_id = str(uuid.uuid4())

        async with AsyncSessionLocal() as db:
            db_sim = TransactionSimulation(
                id=sim_id,
                chain=chain,
                backend=arguments.get("backend", "local").lower(),
                tx_type=arguments.get("tx_type", "transfer").lower(),
                sender=sender,
                receiver=receiver,
                amount=amount,
                token_address=arguments.get("token_address"),
                contract_address=arguments.get("contract_address"),
                data=arguments.get("data"),
                value=arguments.get("value", "0"),
                gas_limit=arguments.get("gas_limit", 21000),
                status="PENDING",
                simulation_success=True,
                execution_trace=[],
                state_changes=[],
                asset_changes=[],
                events=[],
                risk_analysis=[]
            )
            db.add(db_sim)
            await db.commit()

        await run_transaction_simulation_task(sim_id)

        async with AsyncSessionLocal() as db:
            db_sim = await db.get(TransactionSimulation, sim_id)
            result = serialize_db_model(db_sim)

        success_str = "Success" if result.get("simulation_success") else "Failed"
        summary = f"Transaction simulation finished ({success_str}). Changes: {len(result.get('asset_changes', []))} asset changes, {len(result.get('state_changes', []))} state modifications."
        card = SourceCard(
            tool_name="simulate_transaction",
            summary=summary,
            data=result,
            severity="HIGH" if len(result.get("risk_analysis", [])) > 0 else "INFO",
            chain=chain
        )
        return result, card

    elif name == "analyze_threats":
        indicator = arguments.get("indicator", "")
        indicator_type = arguments.get("indicator_type")
        
        request = ThreatAnalysisRequest(indicator=indicator, indicator_type=indicator_type)
        response = await ThreatIntelligenceEngine.analyze(request)
        result = response.dict()

        summary = f"Threat intelligence correlation. Severity: {result.get('severity', 'LOW')}. Confidence: {result.get('confidence_score', 0)*100:.0f}%. Entities: {len(result.get('entities', []))}. Mitigation: {result.get('recommended_mitigation', '')}"
        card = SourceCard(
            tool_name="analyze_threats",
            summary=summary,
            data=result,
            severity=result.get("severity", "INFO").upper(),
            chain=None
        )
        return result, card

    elif name == "calculate_risk":
        request = RiskAnalysisRequest(**arguments)
        response = await RiskEngine.calculate(request)
        result = response.dict()

        summary = f"Centralized risk scoring completed. Overall score: {result.get('overall_score', 0):.1f}/100. Severity: {result.get('severity', 'Low')}. Confidence: {result.get('confidence', 0)*100:.0f}%."
        card = SourceCard(
            tool_name="calculate_risk",
            summary=summary,
            data=result,
            severity=result.get("severity", "INFO").upper(),
            chain=None
        )
        return result, card

    elif name == "analyze_bridge":
        request = BridgeAnalysisRequest(**arguments)
        response = await BridgeIntelligenceEngine.analyze(request)
        result = response.dict()

        summary = f"Cross-chain bridge intelligence completed. Risk Score: {result.get('bridge_risk_score', 0):.1f}/100. Anomalies: {len(result.get('anomalies', []))}. Exploit references: {len(result.get('known_exploits', []))}."
        card = SourceCard(
            tool_name="analyze_bridge",
            summary=summary,
            data=result,
            severity=result.get("risk_level", "INFO").upper(),
            chain=arguments.get("source_chain")
        )
        return result, card

    elif name == "analyze_events":
        request = EventAnalysisRequest(**arguments)
        response = await EventIntelligenceEngine.analyze(request)
        result = response.dict()

        summary = f"Event intelligence parsed. Timeline events: {len(result.get('timeline', []))}. Asset transfers: {len(result.get('asset_movement', []))}. Suspicious flags: {len(result.get('suspicious_activities', []))}."
        card = SourceCard(
            tool_name="analyze_events",
            summary=summary,
            data=result,
            severity="HIGH" if len(result.get("suspicious_activities", [])) > 0 else "INFO",
            chain=arguments.get("chain")
        )
        return result, card

    else:
        raise ValueError(f"Unknown tool name: {name}")
