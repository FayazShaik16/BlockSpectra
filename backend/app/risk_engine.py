import logging
import httpx
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.risk_schemas import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    Subscores,
    ContractFindingInput,
    WalletIntelInput,
    ThreatIntelInput,
    TransactionAnomalyInput,
    BridgeActivityInput,
    EventAnalysisInput
)

logger = logging.getLogger(__name__)

class RiskEngine:
    @classmethod
    async def calculate_with_ai(cls, request: RiskAnalysisRequest) -> Optional[Dict[str, Any]]:
        if not settings.OPENROUTER_API_KEY:
            return None

        system_prompt = (
            "You are a centralized security Risk Engine for a blockchain security intelligence platform. "
            "Your task is to analyze multiple risk telemetry streams (contract findings, wallet intelligence, "
            "threat intelligence, transaction anomalies, bridge activity, and event logs) and calculate:\n"
            "1. Subscores for each category (contract_risk, wallet_risk, threat_risk, anomaly_risk, bridge_risk, event_risk) from 0.0 to 100.0.\n"
            "2. Overall aggregated risk score from 0.0 (no threat) to 100.0 (maximum threat).\n"
            "3. Confidence level (0.0 to 1.0) based on the completeness and reliability of inputs.\n"
            "4. Overall severity level (Low, Medium, High, Critical).\n"
            "5. Detailed reasoning explaining the risk correlation and threat vector.\n"
            "6. Priority recommended mitigation actions.\n\n"
            "Output a valid JSON object ONLY containing:\n"
            "1. 'success': true (boolean)\n"
            "2. 'overall_score': (number between 0.0 and 100.0)\n"
            "3. 'severity': (string, one of: Low, Medium, High, Critical)\n"
            "4. 'confidence': (number between 0.0 and 1.0)\n"
            "5. 'subscores': object with keys: 'contract_risk', 'wallet_risk', 'threat_risk', 'anomaly_risk', 'bridge_risk', 'event_risk' (each a number between 0.0 and 100.0)\n"
            "6. 'reasoning': (string)\n"
            "7. 'recommended_actions': Array of strings\n\n"
            "Your output MUST be a valid JSON object ONLY. Do not wrap it in markdown code blocks like ```json."
        )

        user_prompt = f"Risk Inputs Request:\n{request.json()}"

        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://blockspectra.io",
                "X-Title": "BlockSpectra Risk Engine"
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
            logger.error(f"OpenRouter risk calculation failed: {e}", exc_info=True)

        return None

    @classmethod
    def get_static_fallback(cls, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        subscores = {
            "contract_risk": 0.0,
            "wallet_risk": 0.0,
            "threat_risk": 0.0,
            "anomaly_risk": 0.0,
            "bridge_risk": 0.0,
            "event_risk": 0.0
        }

        active_components = []

        # 1. Contract Findings Risk Calculation
        if request.contract_findings is not None:
            active_components.append("contract")
            score = 0.0
            for f in request.contract_findings:
                sev = f.severity.upper()
                if sev == "CRITICAL":
                    score += 100.0
                elif sev == "HIGH":
                    score += 70.0
                elif sev == "MEDIUM":
                    score += 40.0
                elif sev == "LOW":
                    score += 15.0
            subscores["contract_risk"] = min(score, 100.0)

        # 2. Wallet Rep Risk Calculation
        if request.wallet_intelligence is not None:
            active_components.append("wallet")
            w_intel = request.wallet_intelligence
            # Wallet risk is high if raw wallet reputation score is low
            score = 100.0 - w_intel.wallet_score
            for flag in w_intel.behavior_flags:
                f_lower = flag.lower()
                if "mixer" in f_lower:
                    score += 30.0
                elif "large" in f_lower or "velocity" in f_lower:
                    score += 15.0
                else:
                    score += 10.0
            subscores["wallet_risk"] = min(max(score, 0.0), 100.0)

        # 3. Threat Intel Risk Calculation
        if request.threat_intelligence is not None:
            active_components.append("threat")
            t_intel = request.threat_intelligence
            t_sev = t_intel.severity.upper()
            base_score = 0.0
            if t_sev == "CRITICAL":
                base_score = 100.0
            elif t_sev == "HIGH":
                base_score = 75.0
            elif t_sev == "MEDIUM":
                base_score = 45.0
            elif t_sev == "LOW":
                base_score = 20.0
            
            subscores["threat_risk"] = min(base_score * t_intel.confidence_score, 100.0)

        # 4. Anomaly Risk Calculation
        if request.transaction_anomalies is not None and len(request.transaction_anomalies) > 0:
            active_components.append("anomaly")
            scores = [a.anomaly_score * 100.0 for a in request.transaction_anomalies]
            subscores["anomaly_risk"] = sum(scores) / len(scores)

        # 5. Bridge Risk Calculation
        if request.bridge_activity is not None:
            active_components.append("bridge")
            b_act = request.bridge_activity
            score = 0.0
            if b_act.volume_usd > 500000.0:
                score += 40.0
            elif b_act.volume_usd > 100000.0:
                score += 25.0
            elif b_act.volume_usd > 10000.0:
                score += 10.0

            if b_act.frequency_24h > 15:
                score += 30.0
            elif b_act.frequency_24h > 5:
                score += 15.0

            target = b_act.target_chain.lower()
            if "tornado" in target or "mixer" in target or "unknown" in target:
                score += 30.0

            subscores["bridge_risk"] = min(score, 100.0)

        # 6. Event Risk Calculation
        if request.event_analysis is not None:
            active_components.append("event")
            e_anal = request.event_analysis
            score = (
                (e_anal.upgrade_events_count * 40.0) +
                (e_anal.ownership_changes_count * 30.0) +
                (e_anal.suspicious_events_count * 20.0)
            )
            subscores["event_risk"] = min(score, 100.0)

        # Calculate Overall Risk Score as a weighted average of active components
        # Default Weights
        weights = {
            "contract": 0.25,
            "threat": 0.25,
            "wallet": 0.15,
            "anomaly": 0.15,
            "bridge": 0.10,
            "event": 0.10
        }

        overall_score = 0.0
        if len(active_components) > 0:
            active_weights_sum = sum([weights[c] for c in active_components])
            # Re-normalize weights among active components
            weighted_risk_sum = 0.0
            for c in active_components:
                normalized_weight = weights[c] / active_weights_sum
                weighted_risk_sum += subscores[c + "_risk"] * normalized_weight
            overall_score = round(weighted_risk_sum, 1)

        # Determine Severity Level
        if overall_score >= 85.0:
            severity = "Critical"
        elif overall_score >= 60.0:
            severity = "High"
        elif overall_score >= 30.0:
            severity = "Medium"
        else:
            severity = "Low"

        # Determine Confidence
        confidence = max(len(active_components) / 6.0, 0.50) if active_components else 0.0

        # Generate Reasoning
        reason_parts = []
        reason_parts.append(f"Risk evaluation calculated over {len(active_components)} telemetry feeds.")
        
        if "contract" in active_components:
            f_count = len(request.contract_findings)
            reason_parts.append(f"Smart contract static analysis flagged {f_count} vulnerability findings (Subscore: {subscores['contract_risk']:.0f}).")
        if "wallet" in active_components:
            reason_parts.append(f"Wallet behavior tracking reports a raw reputation index of {request.wallet_intelligence.wallet_score} with active flags (Subscore: {subscores['wallet_risk']:.0f}).")
        if "threat" in active_components:
            reason_parts.append(f"Threat feeds correlated malicious indicators attributed to actor '{request.threat_intelligence.threat_actor or 'Unknown'}' (Subscore: {subscores['threat_risk']:.0f}).")
        if "anomaly" in active_components:
            reason_parts.append(f"Machine-learning execution anomaly deviation scores averaged {subscores['anomaly_risk']:.0f}%.")
        if "bridge" in active_components:
            reason_parts.append(f"Cross-chain bridge volume shows a value of ${request.bridge_activity.volume_usd:,.2f} over 24h.")
        if "event" in active_components:
            reason_parts.append(f"Log monitors identified {request.event_analysis.upgrade_events_count} proxy upgrades and {request.event_analysis.ownership_changes_count} ownership changes.")

        reasoning = " ".join(reason_parts)

        # Generate Recommended Actions
        recommended_actions = []
        if subscores["contract_risk"] >= 50.0:
            recommended_actions.append("Trigger emergency contract pause mechanisms to lock state access.")
            recommended_actions.append("Schedule a manual code review focusing on reentrancy checks.")
        if subscores["wallet_risk"] >= 50.0:
            recommended_actions.append("Blacklist wallet address on frontend UI and transaction routing endpoints.")
            recommended_actions.append("Trace address outbound transfers for mixer or smart contract interactions.")
        if subscores["threat_risk"] >= 50.0:
            recommended_actions.append("Block connections related to the associated threat intelligence IOC feeds.")
            recommended_actions.append("Review threat actor intelligence reports for matching exploit patterns.")
        if subscores["anomaly_risk"] >= 50.0:
            recommended_actions.append("Enforce strict slippage slippage settings to restrict sandwich exploits.")
        if subscores["bridge_risk"] >= 50.0:
            recommended_actions.append("Temporarily restrict bridge gateway withdrawals for the target address.")
        if subscores["event_risk"] >= 50.0:
            recommended_actions.append("Enforce multi-signature verification for key rotation and implementation upgrades.")

        if overall_score >= 70.0 and len(recommended_actions) == 0:
            recommended_actions.append("Initiate emergency protocol response checklist.")
        if overall_score < 30.0:
            recommended_actions.append("No immediate actions required. Continue routine telemetry audit.")

        subscore_obj = Subscores(
            contract_risk=subscores["contract_risk"],
            wallet_risk=subscores["wallet_risk"],
            threat_risk=subscores["threat_risk"],
            anomaly_risk=subscores["anomaly_risk"],
            bridge_risk=subscores["bridge_risk"],
            event_risk=subscores["event_risk"]
        )

        return RiskAnalysisResponse(
            success=True,
            overall_score=overall_score,
            severity=severity,
            confidence=confidence,
            subscores=subscore_obj,
            reasoning=reasoning,
            recommended_actions=recommended_actions
        )

    @classmethod
    async def calculate(cls, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        ai_data = await cls.calculate_with_ai(request)
        if ai_data:
            try:
                sub = Subscores(**ai_data.get("subscores", {}))
                return RiskAnalysisResponse(
                    success=True,
                    overall_score=ai_data.get("overall_score", 0.0),
                    severity=ai_data.get("severity", "Low"),
                    confidence=ai_data.get("confidence", 0.50),
                    subscores=sub,
                    reasoning=ai_data.get("reasoning", "AI risk calculation successfully completed."),
                    recommended_actions=ai_data.get("recommended_actions", ["Routine check advised."])
                )
            except Exception as e:
                logger.error(f"Error parsing AI risk response schema: {e}", exc_info=True)

        return cls.get_static_fallback(request)
