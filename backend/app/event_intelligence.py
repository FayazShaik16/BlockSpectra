import logging
import httpx
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.event_schemas import (
    EventAnalysisRequest,
    EventAnalysisResponse,
    TimelineEvent,
    AssetFlow,
    VisualEventCard,
    SuspiciousActivity
)

logger = logging.getLogger(__name__)

# EVM Event Signatures Map
EVM_TOPICS = {
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": "TRANSFER",
    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": "APPROVAL",
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b418c38858f1db": "OWNERSHIP",
    "0xbc7cd75a20ee27fd9adebab32041f755214dbc2947c4c864c8db79d55b14e033": "UPGRADE",
    "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822": "SWAP_V2",
    "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb34ffd0005592d3c3e2e0": "SWAP_V3",
    "0xe41369c65a0c28c35c673b2c6b4746e974064d43ca1654b1f618a803a676b7db": "LIQUIDATION",
}

class EventIntelligenceEngine:
    @classmethod
    async def analyze_with_ai(cls, chain: str, logs: List[Dict[str, Any]], metadata: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not settings.OPENROUTER_API_KEY:
            return None
            
        system_prompt = (
            "You are a blockchain security event intelligence system. Your job is to analyze transaction events/logs on a blockchain and compile them into a chronological timeline, an asset movement map, visual event card specifications, and a list of suspicious activities.\n"
            "Output a valid JSON object ONLY containing:\n"
            "1. 'timeline': Array of events with keys: 'id' (string), 'timestamp' (string), 'event_type' (string, one of: TRANSFER, APPROVAL, MINT, BURN, OWNERSHIP, UPGRADE, BRIDGE, SWAP, LIQUIDATION, UNKNOWN), 'title' (string), 'description' (string), 'severity' (string, INFO/LOW/MEDIUM/HIGH/CRITICAL), 'contract' (string or null).\n"
            "2. 'asset_movement': Array of asset flows with keys: 'asset' (string), 'from_address' (string or null), 'to_address' (string or null), 'amount' (string), 'dollar_value' (number or null).\n"
            "3. 'visual_cards': Array of card objects with keys: 'type' (string, e.g. TRANSFER, SWAP, LIQUIDATION), 'title' (string), 'sub_text' (string), 'accent_color' (string, emerald/blue/purple/yellow/red/orange/gray), 'icon_name' (string, choose from Lucide icons: Shield, RefreshCw, ArrowUpRight, UserCheck, AlertTriangle, TrendingUp, Info, Activity, Flame).\n"
            "4. 'suspicious_activities': Array of warning flags with keys: 'type' (string), 'severity' (string, INFO/LOW/MEDIUM/HIGH/CRITICAL), 'description' (string).\n\n"
            "Your output MUST be a valid JSON object ONLY. Do not wrap it in markdown code blocks like ```json."
        )
        
        user_prompt = f"Blockchain: {chain}\nLogs / Events List:\n{json.dumps(logs, indent=2)}\n"
        if metadata:
            user_prompt += f"Metadata:\n{json.dumps(metadata, indent=2)}\n"
            
        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://blockspectra.io", 
                "X-Title": "BlockSpectra Intelligence Engine"
            }
            
            payload = {
                "model": settings.OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1
            }

            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n", "", content)
                        content = re.sub(r"\n```$", "", content)
                    content = content.strip()
                    return json.loads(content)
        except Exception as e:
            logger.error(f"OpenRouter event analysis failed: {e}", exc_info=True)
            
        return None

    @classmethod
    def get_static_fallback(cls, chain: str, logs: List[Dict[str, Any]], metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Static rule-based fallback when AI key is missing.
        """
        timeline = []
        asset_movement = []
        visual_cards = []
        suspicious_activities = []
        
        chain = chain.lower()
        
        # Heuristics for EVM
        if chain in ("ethereum", "arbitrum", "optimism", "polygon", "base", "bsc"):
            for idx, log in enumerate(logs):
                log_id = f"evm-log-{idx}"
                topics = log.get("topics", [])
                contract = log.get("address") or log.get("contract") or "0xunknown"
                data_hex = log.get("data", "0x")
                timestamp = log.get("timestamp") or f"+{idx}s"
                
                if topics:
                    topic0 = topics[0].lower()
                    ev_type = EVM_TOPICS.get(topic0)
                    
                    if ev_type == "TRANSFER":
                        from_addr = "0x" + topics[1][-40:] if len(topics) > 1 else "0x"
                        to_addr = "0x" + topics[2][-40:] if len(topics) > 2 else "0x"
                        
                        # Parse amount
                        val = 0
                        try:
                            val = int(data_hex, 16)
                        except:
                            pass
                            
                        amount_str = str(val / 10**18) if val > 10**6 else str(val)
                        
                        # Mint check
                        if from_addr.replace("0x", "") == "0" * 40:
                            timeline.append(TimelineEvent(
                                id=log_id,
                                timestamp=timestamp,
                                event_type="MINT",
                                title="Token Minted",
                                description=f"Newly minted {amount_str} tokens created at contract {contract}.",
                                severity="INFO",
                                contract=contract
                            ))
                            asset_movement.append(AssetFlow(asset="Token", from_address=None, to_address=to_addr, amount=amount_str, dollar_value=val/10**18 * 1.0))
                            visual_cards.append(VisualEventCard(type="MINT", title="Mint", sub_text=f"{amount_str} tokens created", accent_color="emerald", icon_name="Flame"))
                        
                        # Burn check
                        elif to_addr.replace("0x", "") == "0" * 40 or to_addr.lower() == "0x000000000000000000000000000000000000dead":
                            timeline.append(TimelineEvent(
                                id=log_id,
                                timestamp=timestamp,
                                event_type="BURN",
                                title="Token Burned",
                                description=f"Burned {amount_str} tokens from {from_addr} to zero/dead address.",
                                severity="INFO",
                                contract=contract
                            ))
                            asset_movement.append(AssetFlow(asset="Token", from_address=from_addr, to_address=None, amount=amount_str, dollar_value=val/10**18 * 1.0))
                            visual_cards.append(VisualEventCard(type="BURN", title="Burn", sub_text=f"{amount_str} tokens destroyed", accent_color="gray", icon_name="Flame"))
                            suspicious_activities.append(SuspiciousActivity(type="BURN", severity="LOW", description=f"Assets sent to burn address from {from_addr}."))
                        
                        # Normal transfer
                        else:
                            # Check Tornado Cash / privacy mixers
                            is_suspicious = "tornado" in to_addr.lower() or to_addr == "0x72a587DB711757529870b1774e3067ddD24a4fcf"
                            sev = "CRITICAL" if is_suspicious else "INFO"
                            
                            timeline.append(TimelineEvent(
                                id=log_id,
                                timestamp=timestamp,
                                event_type="TRANSFER",
                                title="Asset Transfer",
                                description=f"Transferred {amount_str} tokens from {from_addr} to {to_addr}.",
                                severity=sev,
                                contract=contract
                            ))
                            asset_movement.append(AssetFlow(asset="Token", from_address=from_addr, to_address=to_addr, amount=amount_str, dollar_value=None))
                            visual_cards.append(VisualEventCard(type="TRANSFER", title="Transfer", sub_text=f"Sent {amount_str} tokens to {to_addr[:8]}", accent_color="blue", icon_name="ArrowUpRight"))
                            
                            if is_suspicious:
                                suspicious_activities.append(SuspiciousActivity(type="MIXER_DEPOSIT", severity="CRITICAL", description=f"High risk transfer of assets to privacy mixer (Tornado Cash) detected at {to_addr}."))
                                
                    elif ev_type == "APPROVAL":
                        owner = "0x" + topics[1][-40:] if len(topics) > 1 else "0x"
                        spender = "0x" + topics[2][-40:] if len(topics) > 2 else "0x"
                        val = 0
                        try:
                            val = int(data_hex, 16)
                        except:
                            pass
                        
                        is_unlimited = val > 10**30 or val == 115792089237316195423570985008687907853269984665640564039457584007913129639935
                        amount_str = "Unlimited" if is_unlimited else str(val)
                        
                        timeline.append(TimelineEvent(
                            id=log_id,
                            timestamp=timestamp,
                            event_type="APPROVAL",
                            title="Spender Approval",
                            description=f"Approved spender {spender} to withdraw {amount_str} tokens from {owner}.",
                            severity="MEDIUM" if is_unlimited else "INFO",
                            contract=contract
                        ))
                        visual_cards.append(VisualEventCard(type="APPROVAL", title="Approval", sub_text=f"Spender: {spender[:8]} approved", accent_color="purple", icon_name="UserCheck"))
                        
                        if is_unlimited:
                            suspicious_activities.append(SuspiciousActivity(type="UNLIMITED_ALLOWANCE", severity="HIGH", description=f"Unlimited allowance granted to spender {spender} by owner {owner}. Risk of wallet drain."))
                            
                    elif ev_type == "OWNERSHIP":
                        prev_owner = "0x" + topics[1][-40:] if len(topics) > 1 else "0x"
                        new_owner = "0x" + topics[2][-40:] if len(topics) > 2 else "0x"
                        
                        timeline.append(TimelineEvent(
                            id=log_id,
                            timestamp=timestamp,
                            event_type="OWNERSHIP",
                            title="Ownership Transferred",
                            description=f"Admin privileges transferred from {prev_owner} to {new_owner}.",
                            severity="HIGH",
                            contract=contract
                        ))
                        visual_cards.append(VisualEventCard(type="OWNERSHIP", title="Ownership", sub_text=f"New Admin: {new_owner[:8]}", accent_color="yellow", icon_name="Shield"))
                        suspicious_activities.append(SuspiciousActivity(type="OWNERSHIP_TRANSFER", severity="MEDIUM", description=f"Ownership of contract {contract} transferred. Verify if this was a malicious takeover."))
                        
                    elif ev_type == "UPGRADE":
                        timeline.append(TimelineEvent(
                            id=log_id,
                            timestamp=timestamp,
                            event_type="UPGRADE",
                            title="Proxy upgraded",
                            description=f"Logic contract has been upgraded to a new implementation address.",
                            severity="HIGH",
                            contract=contract
                        ))
                        visual_cards.append(VisualEventCard(type="UPGRADE", title="Contract Upgraded", sub_text="Proxy implementation upgraded", accent_color="orange", icon_name="RefreshCw"))
                        suspicious_activities.append(SuspiciousActivity(type="CONTRACT_UPGRADE", severity="HIGH", description=f"Upgradable proxy {contract} modified implementation address. Threat actors often upgrade contract logics to deploy backdoors."))
                        
                    elif ev_type in ("SWAP_V2", "SWAP_V3"):
                        timeline.append(TimelineEvent(
                            id=log_id,
                            timestamp=timestamp,
                            event_type="SWAP",
                            title="Token Swap",
                            description=f"Asset swap executed at liquidity pool: {contract}.",
                            severity="INFO",
                            contract=contract
                        ))
                        visual_cards.append(VisualEventCard(type="SWAP", title="Swap", sub_text="Trade executed in liquidity pool", accent_color="blue", icon_name="TrendingUp"))
                        
                    elif ev_type == "LIQUIDATION":
                        timeline.append(TimelineEvent(
                            id=log_id,
                            timestamp=timestamp,
                            event_type="LIQUIDATION",
                            title="Collateral Liquidation",
                            description=f"Lending position at {contract} liquidated due to health factor breach.",
                            severity="HIGH",
                            contract=contract
                        ))
                        visual_cards.append(VisualEventCard(type="LIQUIDATION", title="Liquidation", sub_text="Undercollateralized loan liquidated", accent_color="red", icon_name="AlertTriangle"))
                        suspicious_activities.append(SuspiciousActivity(type="LIQUIDATION_EVENT", severity="MEDIUM", description=f"A lending account at {contract} was liquidated. Check health factor scores."))

        # Solana heuristic parsing
        elif chain == "solana":
            for idx, log in enumerate(logs):
                log_id = f"sol-log-{idx}"
                msg = log.get("message", "").strip()
                timestamp = log.get("timestamp") or f"+{idx}s"
                
                if "Instruction: Transfer" in msg:
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="TRANSFER", title="Solana Transfer", description="SPL Token transfer between accounts.", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="TRANSFER", title="Solana Transfer", sub_text="SPL Token transfer", accent_color="blue", icon_name="ArrowUpRight"))
                elif "Instruction: MintTo" in msg:
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="MINT", title="Solana MintTo", description="SPL token minted to destination.", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="MINT", title="Solana Mint", sub_text="Token minted", accent_color="emerald", icon_name="Flame"))
                elif "Instruction: Burn" in msg:
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="BURN", title="Solana Burn", description="SPL token burned.", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="BURN", title="Solana Burn", sub_text="Token burned", accent_color="gray", icon_name="Flame"))
                elif "Instruction: Swap" in msg or "swap" in msg.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="SWAP", title="Solana Swap", description="Token swap executed via Solana DEX.", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="SWAP", title="Solana Swap", sub_text="Solana DEX swap", accent_color="blue", icon_name="TrendingUp"))
                elif "liquidate" in msg.lower() or "liquidation" in msg.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="LIQUIDATION", title="Solana Liquidation", description="Lending vault position liquidated.", severity="HIGH"))
                    visual_cards.append(VisualEventCard(type="LIQUIDATION", title="Solana Liquidation", sub_text="Solana debt liquidated", accent_color="red", icon_name="AlertTriangle"))

        # Sui & Aptos heuristic parsing
        else:
            for idx, log in enumerate(logs):
                log_id = f"move-event-{idx}"
                ev_type = log.get("type", "")
                timestamp = log.get("timestamp") or f"+{idx}s"
                
                if "coin::transfer" in ev_type.lower() or "transfer" in ev_type.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="TRANSFER", title="Move Transfer", description=f"Object/Token transfer event: {ev_type}", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="TRANSFER", title="Move Transfer", sub_text="Token transfer", accent_color="blue", icon_name="ArrowUpRight"))
                elif "mint" in ev_type.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="MINT", title="Move Mint", description=f"Asset mint event: {ev_type}", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="MINT", title="Move Mint", sub_text="Token minted", accent_color="emerald", icon_name="Flame"))
                elif "burn" in ev_type.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="BURN", title="Move Burn", description=f"Asset burn event: {ev_type}", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="BURN", title="Move Burn", sub_text="Token burned", accent_color="gray", icon_name="Flame"))
                elif "swap" in ev_type.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="SWAP", title="Move Swap", description=f"Trade swap event: {ev_type}", severity="INFO"))
                    visual_cards.append(VisualEventCard(type="SWAP", title="Move Swap", sub_text="DEX swap", accent_color="blue", icon_name="TrendingUp"))
                elif "liquid" in ev_type.lower():
                    timeline.append(TimelineEvent(id=log_id, timestamp=timestamp, event_type="LIQUIDATION", title="Move Liquidation", description=f"Debt position liquidated: {ev_type}", severity="HIGH"))
                    visual_cards.append(VisualEventCard(type="LIQUIDATION", title="Move Liquidation", sub_text="Debt liquidated", accent_color="red", icon_name="AlertTriangle"))
                    
        # General backup timeline event if nothing matches
        if not timeline:
            timeline.append(TimelineEvent(
                id="default-event",
                timestamp="0s",
                event_type="UNKNOWN",
                title="Generic Operation",
                description="Custom smart contract transaction execution finalized.",
                severity="INFO"
            ))
            visual_cards.append(VisualEventCard(type="UNKNOWN", title="Operation", sub_text="Transaction execution", accent_color="gray", icon_name="Activity"))

        return {
            "success": True,
            "chain": chain,
            "timeline": timeline,
            "asset_movement": asset_movement,
            "visual_cards": visual_cards,
            "suspicious_activities": suspicious_activities
        }

    @classmethod
    async def analyze(cls, request: EventAnalysisRequest) -> EventAnalysisResponse:
        chain = request.chain.lower()
        logs = request.logs or []
        metadata = request.metadata or {}
        
        if request.tx_hash:
            from app.data_providers.etherscan import fetch_tx_receipt_logs
            fetched_logs = await fetch_tx_receipt_logs(chain, request.tx_hash)
            if fetched_logs:
                logs = fetched_logs
                metadata["tx_hash"] = request.tx_hash
        elif request.address:
            from app.data_providers.etherscan import fetch_address_logs
            fetched_logs = await fetch_address_logs(chain, request.address)
            if fetched_logs:
                logs = fetched_logs
                metadata["address"] = request.address
        
        try:
            # 1. Query LLM if key is present
            ai_data = await cls.analyze_with_ai(chain, logs, metadata)
            if ai_data:
                timeline = [TimelineEvent(**t) for t in ai_data.get("timeline", [])]
                asset_movement = [AssetFlow(**a) for a in ai_data.get("asset_movement", [])]
                visual_cards = [VisualEventCard(**v) for v in ai_data.get("visual_cards", [])]
                suspicious_activities = [SuspiciousActivity(**s) for s in ai_data.get("suspicious_activities", [])]
                
                return EventAnalysisResponse(
                    success=True,
                    chain=chain,
                    timeline=timeline,
                    asset_movement=asset_movement,
                    visual_cards=visual_cards,
                    suspicious_activities=suspicious_activities
                )
        except Exception as e:
            logger.error(f"Failed parsing AI event analysis response: {e}")
            
        # 2. Fallback to heuristic parser
        fallback = cls.get_static_fallback(chain, logs, metadata)
        return EventAnalysisResponse(**fallback)
