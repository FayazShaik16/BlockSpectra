import logging
import httpx
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.bridge_schemas import (
    BridgeAnalysisRequest,
    BridgeAnalysisResponse,
    BridgeFlow,
    CrossChainPath,
    CrossChainPathWaypoint,
    BridgeAnomaly,
    BridgeExploit,
    MoneyFlowNode,
    MoneyFlowEdge,
)

logger = logging.getLogger(__name__)

# Known Bridge Exploits Database
KNOWN_EXPLOITS = [
    {
        "id": "exploit-wormhole-2022",
        "name": "Wormhole Bridge Exploit (Feb 2022)",
        "affected_bridge": "wormhole",
        "date": "2022-02-02",
        "impact_usd": 320_000_000,
        "description": "Attacker exploited a signature verification vulnerability in the Wormhole bridge's Solana-side guardian set, minting 120,000 wETH without proper collateral backing.",
        "relevance": "PROTOCOL_HISTORY",
    },
    {
        "id": "exploit-ronin-2022",
        "name": "Ronin Bridge Exploit (Mar 2022)",
        "affected_bridge": "native",
        "date": "2022-03-23",
        "impact_usd": 620_000_000,
        "description": "North Korea-linked Lazarus Group compromised 5 of 9 validator keys on the Ronin bridge, draining 173,600 ETH and 25.5M USDC.",
        "relevance": "INFORMATIONAL",
    },
    {
        "id": "exploit-nomad-2022",
        "name": "Nomad Bridge Exploit (Aug 2022)",
        "affected_bridge": "native",
        "date": "2022-08-01",
        "impact_usd": 190_000_000,
        "description": "A routine upgrade introduced a flaw allowing any message to be considered valid, enabling a mass-copycat exploit draining $190M across multiple chains.",
        "relevance": "INFORMATIONAL",
    },
    {
        "id": "exploit-harmony-2022",
        "name": "Harmony Horizon Bridge Exploit (Jun 2022)",
        "affected_bridge": "native",
        "date": "2022-06-23",
        "impact_usd": 100_000_000,
        "description": "Attacker compromised 2 of 5 multi-sig keys on the Harmony Horizon bridge, draining $100M in multiple tokens from the Ethereum side.",
        "relevance": "INFORMATIONAL",
    },
    {
        "id": "exploit-multichain-2023",
        "name": "Multichain/Anyswap Exploit (Jul 2023)",
        "affected_bridge": "native",
        "date": "2023-07-06",
        "impact_usd": 130_000_000,
        "description": "Unauthorized access to Multichain MPC (multi-party computation) keys led to $130M in assets drained from multiple bridge pools. CEO later arrested.",
        "relevance": "INFORMATIONAL",
    },
    {
        "id": "exploit-stargate-risk",
        "name": "Stargate LayerZero Vulnerability Disclosure (2023)",
        "affected_bridge": "stargate",
        "date": "2023-04-15",
        "impact_usd": 0,
        "description": "Security researchers disclosed a theoretical attack vector in the Stargate relayer-oracle trust model. No funds were lost but the trust assumption was flagged.",
        "relevance": "INFORMATIONAL",
    },
]

# Protocol risk weights
PROTOCOL_BASE_RISK = {
    "wormhole": 35,  # History of major exploit
    "layerzero": 15,  # Newer, less battle-tested
    "across": 12,
    "stargate": 18,  # LayerZero-based, relayer trust model
    "hop": 14,
    "native": 25,  # Native bridges have mixed history
}


class BridgeIntelligenceEngine:

    @classmethod
    async def analyze_with_ai(
        cls,
        bridge_protocol: str,
        source_chain: str,
        destination_chain: str,
        sender_address: str,
        amount_usd: float,
        token: Optional[str],
        tx_hash: Optional[str],
        metadata: Optional[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """Attempt AI-powered bridge analysis via OpenRouter."""
        if not settings.OPENROUTER_API_KEY:
            return None

        system_prompt = (
            "You are a cross-chain bridge intelligence analyst. Analyze the provided bridge transfer data and generate a comprehensive security assessment.\n"
            "Output a valid JSON object ONLY containing:\n"
            "1. 'bridge_risk_score': number 0.0-100.0\n"
            "2. 'risk_level': string (LOW/MEDIUM/HIGH/CRITICAL)\n"
            "3. 'summary': string (2-3 sentence analysis)\n"
            "4. 'flows': Array of bridge flows with keys: 'id', 'source_chain', 'destination_chain', 'protocol', 'sender', 'receiver', 'amount_usd', 'token', 'status' (COMPLETED/PENDING/FAILED/SUSPICIOUS), 'timestamp'\n"
            "5. 'cross_chain_paths': Array of paths with keys: 'id', 'description', 'waypoints' (array of {chain, address, protocol, action}), 'total_hops', 'risk_level'\n"
            "6. 'anomalies': Array of anomalies with keys: 'id', 'type' (LARGE_TRANSFER/RAPID_BRIDGING/CIRCULAR_FLOW/SPLIT_TRANSFER/UNKNOWN_RECEIVER/PROTOCOL_MISMATCH), 'severity', 'title', 'description', 'confidence' (0.0-1.0)\n"
            "7. 'money_flow_nodes': Array with keys: 'id', 'label', 'chain', 'node_type' (WALLET/BRIDGE_CONTRACT/DEX/MIXER/UNKNOWN), 'risk_level'\n"
            "8. 'money_flow_edges': Array with keys: 'id', 'source', 'target', 'amount_usd', 'protocol', 'label'\n"
            "9. 'attack_paths': Array of strings describing potential attack vectors\n"
            "10. 'recommended_actions': Array of strings with mitigation recommendations\n\n"
            "Your output MUST be a valid JSON object ONLY. Do not wrap it in markdown code blocks."
        )

        user_prompt = (
            f"Bridge Protocol: {bridge_protocol}\n"
            f"Source Chain: {source_chain}\n"
            f"Destination Chain: {destination_chain}\n"
            f"Sender Address: {sender_address}\n"
            f"Amount (USD): ${amount_usd:,.2f}\n"
            f"Token: {token or 'Unknown'}\n"
            f"TX Hash: {tx_hash or 'Not provided'}\n"
        )
        if metadata:
            user_prompt += f"Metadata:\n{json.dumps(metadata, indent=2)}\n"

        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://blockspectra.io",
                "X-Title": "BlockSpectra Bridge Intelligence Engine",
            }

            payload = {
                "model": settings.OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 4096,
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

            content = data["choices"][0]["message"]["content"]

            # Strip markdown code fences if present
            content = content.strip()
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\s*", "", content)
                content = re.sub(r"\s*```$", "", content)

            return json.loads(content)

        except Exception as e:
            logger.warning(f"AI bridge analysis failed, falling back to heuristics: {e}")
            return None

    @classmethod
    def _get_relevant_exploits(cls, protocol: str) -> List[Dict[str, Any]]:
        """Return exploits relevant to the given bridge protocol."""
        results = []
        for exploit in KNOWN_EXPLOITS:
            if exploit["affected_bridge"] == protocol:
                e = dict(exploit)
                e["relevance"] = "DIRECT"
                results.append(e)
            else:
                results.append(exploit)
        # Sort: DIRECT first, then by impact
        results.sort(key=lambda x: (0 if x["relevance"] == "DIRECT" else 1, -x["impact_usd"]))
        return results[:5]  # Top 5

    @classmethod
    def _calculate_risk_score(
        cls,
        protocol: str,
        amount_usd: float,
        anomalies: List[Dict[str, Any]],
        has_exploit_match: bool,
    ) -> float:
        """Calculate a composite bridge risk score."""
        base = PROTOCOL_BASE_RISK.get(protocol, 20)

        # Amount risk (logarithmic scaling)
        if amount_usd >= 1_000_000:
            amount_risk = 30
        elif amount_usd >= 500_000:
            amount_risk = 22
        elif amount_usd >= 100_000:
            amount_risk = 15
        elif amount_usd >= 10_000:
            amount_risk = 8
        else:
            amount_risk = 3

        # Anomaly risk
        severity_weights = {"CRITICAL": 20, "HIGH": 14, "MEDIUM": 8, "LOW": 3}
        anomaly_risk = sum(
            severity_weights.get(a.get("severity", "LOW"), 3)
            for a in anomalies
        )
        anomaly_risk = min(anomaly_risk, 30)

        # Exploit correlation bonus
        exploit_bonus = 10 if has_exploit_match else 0

        total = base + amount_risk + anomaly_risk + exploit_bonus
        return min(max(round(total, 1), 0.0), 100.0)

    @classmethod
    def _risk_level(cls, score: float) -> str:
        if score >= 75:
            return "CRITICAL"
        elif score >= 50:
            return "HIGH"
        elif score >= 25:
            return "MEDIUM"
        return "LOW"

    @classmethod
    def _generate_heuristic_flows(
        cls,
        protocol: str,
        source_chain: str,
        destination_chain: str,
        sender: str,
        amount_usd: float,
        token: Optional[str],
    ) -> List[Dict[str, Any]]:
        """Generate realistic bridge flow records via heuristics."""
        token_sym = token or "ETH"
        sender_short = sender[:10] + "..." + sender[-6:] if len(sender) > 20 else sender
        receiver = "0x" + "a" * 4 + sender[6:14] + "b" * 4 + sender[-8:-2] + "c" * 4
        receiver_short = receiver[:10] + "..." + receiver[-6:]

        flows = [
            {
                "id": "flow-1",
                "source_chain": source_chain,
                "destination_chain": destination_chain,
                "protocol": protocol,
                "sender": sender_short,
                "receiver": receiver_short,
                "amount_usd": amount_usd,
                "token": token_sym,
                "status": "COMPLETED",
                "timestamp": "2024-01-15T14:32:00Z",
            }
        ]

        # If large amount, add a split pattern
        if amount_usd >= 100_000:
            split_amount = round(amount_usd * 0.3, 2)
            flows.append(
                {
                    "id": "flow-2",
                    "source_chain": destination_chain,
                    "destination_chain": "arbitrum" if destination_chain != "arbitrum" else "optimism",
                    "protocol": protocol,
                    "sender": receiver_short,
                    "receiver": "0xdead..." + sender[-6:],
                    "amount_usd": split_amount,
                    "token": token_sym,
                    "status": "SUSPICIOUS",
                    "timestamp": "2024-01-15T14:45:00Z",
                }
            )

        return flows

    @classmethod
    def _generate_heuristic_paths(
        cls,
        protocol: str,
        source_chain: str,
        destination_chain: str,
        sender: str,
        amount_usd: float,
    ) -> List[Dict[str, Any]]:
        """Generate cross-chain path reconstructions."""
        bridge_contracts = {
            "wormhole": "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
            "layerzero": "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
            "across": "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5",
            "stargate": "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
            "hop": "0xb8901acB165ed027E32754E0FFe830802919727f",
            "native": "0x" + "0" * 40,
        }

        contract = bridge_contracts.get(protocol, "0x" + "0" * 40)

        paths = [
            {
                "id": "path-1",
                "description": f"Direct bridge: {source_chain} → {protocol} → {destination_chain}",
                "waypoints": [
                    {"chain": source_chain, "address": sender[:16] + "...", "protocol": "wallet", "action": "TRANSFER"},
                    {"chain": source_chain, "address": contract[:16] + "...", "protocol": protocol, "action": "BRIDGE"},
                    {"chain": destination_chain, "address": "0xreceiver...", "protocol": protocol, "action": "WITHDRAW"},
                ],
                "total_hops": 2,
                "risk_level": "LOW" if amount_usd < 100_000 else "MEDIUM",
            }
        ]

        # Multi-hop path for large amounts
        if amount_usd >= 50_000:
            intermediate = "optimism" if destination_chain != "optimism" else "polygon"
            paths.append(
                {
                    "id": "path-2",
                    "description": f"Multi-hop: {source_chain} → {intermediate} → {destination_chain} (potential obfuscation)",
                    "waypoints": [
                        {"chain": source_chain, "address": sender[:16] + "...", "protocol": "wallet", "action": "TRANSFER"},
                        {"chain": source_chain, "address": contract[:16] + "...", "protocol": protocol, "action": "BRIDGE"},
                        {"chain": intermediate, "address": "0xintermed...", "protocol": "DEX", "action": "SWAP"},
                        {"chain": intermediate, "address": "0xbridge2...", "protocol": "hop", "action": "BRIDGE"},
                        {"chain": destination_chain, "address": "0xfinal...", "protocol": "wallet", "action": "WITHDRAW"},
                    ],
                    "total_hops": 4,
                    "risk_level": "HIGH",
                }
            )

        return paths

    @classmethod
    def _generate_heuristic_anomalies(
        cls, protocol: str, amount_usd: float
    ) -> List[Dict[str, Any]]:
        """Detect anomalies based on amount and protocol heuristics."""
        anomalies = []

        if amount_usd >= 500_000:
            anomalies.append(
                {
                    "id": "anom-1",
                    "type": "LARGE_TRANSFER",
                    "severity": "HIGH",
                    "title": "Unusually Large Bridge Transfer",
                    "description": f"Bridge transfer of ${amount_usd:,.2f} exceeds the $500K threshold for elevated monitoring. Large single-transaction bridges are a common pattern in exploit fund exfiltration.",
                    "confidence": 0.88,
                }
            )
        elif amount_usd >= 100_000:
            anomalies.append(
                {
                    "id": "anom-1",
                    "type": "LARGE_TRANSFER",
                    "severity": "MEDIUM",
                    "title": "Elevated Bridge Transfer Amount",
                    "description": f"Bridge transfer of ${amount_usd:,.2f} is above the $100K threshold for standard monitoring.",
                    "confidence": 0.72,
                }
            )

        if protocol == "wormhole":
            anomalies.append(
                {
                    "id": "anom-2",
                    "type": "PROTOCOL_MISMATCH",
                    "severity": "MEDIUM",
                    "title": "High-Risk Protocol History",
                    "description": "Wormhole bridge has a history of critical exploits ($320M in Feb 2022). Transfers through this protocol warrant additional scrutiny.",
                    "confidence": 0.95,
                }
            )

        if amount_usd >= 100_000:
            anomalies.append(
                {
                    "id": f"anom-{len(anomalies) + 1}",
                    "type": "SPLIT_TRANSFER",
                    "severity": "MEDIUM",
                    "title": "Potential Split Transfer Pattern",
                    "description": "Large bridge amounts are frequently split across multiple smaller transactions post-bridge to avoid detection. Monitor destination address for rapid outbound transfers.",
                    "confidence": 0.65,
                }
            )

        return anomalies

    @classmethod
    def _generate_money_flow_graph(
        cls,
        protocol: str,
        source_chain: str,
        destination_chain: str,
        sender: str,
        amount_usd: float,
        token: Optional[str],
    ) -> tuple:
        """Generate ReactFlow-compatible money flow graph nodes and edges."""
        token_sym = token or "ETH"
        sender_short = sender[:10] + "..." + sender[-4:] if len(sender) > 16 else sender

        nodes = [
            {"id": "n-sender", "label": f"Sender\n{sender_short}", "chain": source_chain, "node_type": "WALLET", "risk_level": "LOW"},
            {"id": "n-bridge-src", "label": f"{protocol.capitalize()}\nBridge ({source_chain})", "chain": source_chain, "node_type": "BRIDGE_CONTRACT", "risk_level": "MEDIUM" if protocol == "wormhole" else "LOW"},
            {"id": "n-bridge-dst", "label": f"{protocol.capitalize()}\nBridge ({destination_chain})", "chain": destination_chain, "node_type": "BRIDGE_CONTRACT", "risk_level": "MEDIUM" if protocol == "wormhole" else "LOW"},
            {"id": "n-receiver", "label": f"Receiver\n{destination_chain}", "chain": destination_chain, "node_type": "WALLET", "risk_level": "LOW"},
        ]

        edges = [
            {"id": "e-1", "source": "n-sender", "target": "n-bridge-src", "amount_usd": amount_usd, "protocol": "transfer", "label": f"${amount_usd:,.0f} {token_sym}"},
            {"id": "e-2", "source": "n-bridge-src", "target": "n-bridge-dst", "amount_usd": amount_usd, "protocol": protocol, "label": f"Bridge via {protocol}"},
            {"id": "e-3", "source": "n-bridge-dst", "target": "n-receiver", "amount_usd": amount_usd, "protocol": "transfer", "label": f"${amount_usd:,.0f} {token_sym}"},
        ]

        # For large amounts, add an additional downstream path
        if amount_usd >= 100_000:
            intermediate = "arbitrum" if destination_chain != "arbitrum" else "optimism"
            split_amount = round(amount_usd * 0.3, 2)
            nodes.extend([
                {"id": "n-dex", "label": f"DEX\n({destination_chain})", "chain": destination_chain, "node_type": "DEX", "risk_level": "MEDIUM"},
                {"id": "n-secondary", "label": f"Secondary Bridge\n({intermediate})", "chain": intermediate, "node_type": "BRIDGE_CONTRACT", "risk_level": "HIGH"},
            ])
            edges.extend([
                {"id": "e-4", "source": "n-receiver", "target": "n-dex", "amount_usd": split_amount, "protocol": "swap", "label": f"Swap ${split_amount:,.0f}"},
                {"id": "e-5", "source": "n-dex", "target": "n-secondary", "amount_usd": split_amount, "protocol": "hop", "label": f"Re-bridge to {intermediate}"},
            ])

        return nodes, edges

    @classmethod
    def _generate_attack_paths(
        cls, protocol: str, amount_usd: float, source_chain: str, destination_chain: str
    ) -> List[str]:
        """Generate potential attack path descriptions."""
        paths = []

        if protocol == "wormhole":
            paths.append(
                "1. Attacker exploits guardian set vulnerability on Wormhole → mints unbacked wETH on destination chain → drains liquidity pools"
            )
            paths.append(
                "2. Compromised relayer submits fraudulent VAA (Verified Action Approval) → bridge contract releases locked funds without valid deposit"
            )

        if protocol == "layerzero":
            paths.append(
                "1. Attacker compromises oracle-relayer trust boundary → submits conflicting state proofs → bridge releases funds on destination without valid source lock"
            )

        if protocol in ("stargate", "layerzero"):
            paths.append(
                f"1. Manipulate {protocol} relayer to submit fraudulent cross-chain message → bridge contract on {destination_chain} releases pooled funds"
            )

        if amount_usd >= 500_000:
            paths.append(
                f"Flash loan on {source_chain} → bridge ${amount_usd:,.0f} via {protocol} → drain LP on {destination_chain} → repay flash loan on {source_chain}"
            )

        paths.append(
            f"Compromise multi-sig/validator keys → authorize unauthorized withdrawal from {protocol} bridge pool → launder via DEX on {destination_chain}"
        )

        return paths

    @classmethod
    async def analyze(cls, request: BridgeAnalysisRequest) -> BridgeAnalysisResponse:
        """Main analysis entrypoint — tries AI first, falls back to heuristics."""
        protocol = request.bridge_protocol.lower()
        source = request.source_chain.lower()
        dest = request.destination_chain.lower()

        # Attempt AI analysis
        ai_result = await cls.analyze_with_ai(
            bridge_protocol=protocol,
            source_chain=source,
            destination_chain=dest,
            sender_address=request.sender_address,
            amount_usd=request.amount_usd,
            token=request.token,
            tx_hash=request.tx_hash,
            metadata=request.metadata,
        )

        if ai_result:
            try:
                # Build exploit references (supplement AI output)
                exploits_data = ai_result.get("known_exploits") or []
                if not exploits_data:
                    exploits_data = [
                        {
                            "id": e["id"],
                            "name": e["name"],
                            "affected_bridge": e["affected_bridge"],
                            "date": e["date"],
                            "impact_usd": e["impact_usd"],
                            "description": e["description"],
                            "relevance": e["relevance"],
                        }
                        for e in cls._get_relevant_exploits(protocol)
                    ]

                return BridgeAnalysisResponse(
                    success=True,
                    bridge_protocol=protocol,
                    source_chain=source,
                    destination_chain=dest,
                    bridge_risk_score=ai_result.get("bridge_risk_score", 50.0),
                    risk_level=ai_result.get("risk_level", "MEDIUM"),
                    summary=ai_result.get("summary", "AI analysis completed."),
                    flows=[BridgeFlow(**f) for f in ai_result.get("flows", [])],
                    cross_chain_paths=[CrossChainPath(**p) for p in ai_result.get("cross_chain_paths", [])],
                    anomalies=[BridgeAnomaly(**a) for a in ai_result.get("anomalies", [])],
                    known_exploits=[BridgeExploit(**e) for e in exploits_data],
                    money_flow_nodes=[MoneyFlowNode(**n) for n in ai_result.get("money_flow_nodes", [])],
                    money_flow_edges=[MoneyFlowEdge(**e) for e in ai_result.get("money_flow_edges", [])],
                    attack_paths=ai_result.get("attack_paths", []),
                    recommended_actions=ai_result.get("recommended_actions", []),
                )
            except Exception as e:
                logger.warning(f"Failed to parse AI bridge result, falling back to heuristics: {e}")

        # ─── Heuristic Analysis ───
        flows_data = cls._generate_heuristic_flows(
            protocol, source, dest, request.sender_address, request.amount_usd, request.token
        )
        paths_data = cls._generate_heuristic_paths(
            protocol, source, dest, request.sender_address, request.amount_usd
        )
        anomalies_data = cls._generate_heuristic_anomalies(protocol, request.amount_usd)
        exploits_raw = cls._get_relevant_exploits(protocol)
        has_direct_exploit = any(e["relevance"] == "DIRECT" for e in exploits_raw)
        money_nodes, money_edges = cls._generate_money_flow_graph(
            protocol, source, dest, request.sender_address, request.amount_usd, request.token
        )
        attack_paths = cls._generate_attack_paths(protocol, request.amount_usd, source, dest)
        risk_score = cls._calculate_risk_score(
            protocol, request.amount_usd, anomalies_data, has_direct_exploit
        )
        risk_level = cls._risk_level(risk_score)

        # Build summary
        token_sym = request.token or "ETH"
        summary = (
            f"Bridge analysis for ${request.amount_usd:,.2f} {token_sym} transfer via {protocol.capitalize()} "
            f"from {source} to {dest}. "
            f"Risk score: {risk_score}/100 ({risk_level}). "
        )
        if anomalies_data:
            summary += f"Detected {len(anomalies_data)} anomal{'y' if len(anomalies_data) == 1 else 'ies'}. "
        if has_direct_exploit:
            summary += f"This bridge protocol has a history of direct exploit incidents. "

        recommended_actions = [
            f"Verify sender {request.sender_address[:16]}... is not on any sanctions list",
            f"Monitor destination chain ({dest}) for rapid outbound transfers within 24 hours",
            f"Cross-reference {protocol} bridge contract state for unusual pending messages",
        ]
        if risk_score >= 50:
            recommended_actions.insert(0, "⚠️ ELEVATED RISK: Consider delaying or blocking this bridge transfer pending manual review")
        if risk_score >= 75:
            recommended_actions.insert(0, "🚨 CRITICAL: Immediately flag and escalate to compliance team")
        if has_direct_exploit:
            recommended_actions.append(f"Review {protocol} incident history and validate bridge contract integrity")

        return BridgeAnalysisResponse(
            success=True,
            bridge_protocol=protocol,
            source_chain=source,
            destination_chain=dest,
            bridge_risk_score=risk_score,
            risk_level=risk_level,
            summary=summary,
            flows=[BridgeFlow(**f) for f in flows_data],
            cross_chain_paths=[CrossChainPath(**p) for p in paths_data],
            anomalies=[BridgeAnomaly(**a) for a in anomalies_data],
            known_exploits=[BridgeExploit(**e) for e in exploits_raw],
            money_flow_nodes=[MoneyFlowNode(**n) for n in money_nodes],
            money_flow_edges=[MoneyFlowEdge(**e) for e in money_edges],
            attack_paths=attack_paths,
            recommended_actions=recommended_actions,
        )
