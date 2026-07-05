import httpx
import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)


async def generate_wallet_ai_report(
    chain: str,
    address: str,
    wallet_data: Dict[str, Any],
    analysis_result: Dict[str, Any],
) -> Dict[str, str]:
    """
    Query OpenRouter AI model to generate wallet intelligence narrative.
    Returns: Dict with behavior_profile, interaction_summary, risk_assessment
    """
    behavior_flags = analysis_result.get("behavior_flags", [])
    risk_signals = analysis_result.get("risk_signals", [])
    wallet_score = analysis_result.get("wallet_score", 50)
    risk_level = analysis_result.get("risk_level", "UNKNOWN")

    # Build context
    signals_text = ""
    for sig in risk_signals:
        signals_text += f"- [{sig['severity']}] {sig['flag']}: {sig['description']} (confidence: {sig['confidence']}%)\n"

    tokens_text = ""
    for t in wallet_data.get("tokens", [])[:8]:
        tokens_text += f"- {t['symbol']}: {t['balance']} (${t.get('value_usd', 0):,.2f})\n"

    tx_summary = wallet_data.get("tx_count", 0)
    balance_usd = wallet_data.get("balance_usd", 0)
    volume_usd = wallet_data.get("volume_usd", 0)

    fallback_report = _generate_fallback_report(
        chain, address, wallet_data, analysis_result
    )

    if not settings.OPENROUTER_API_KEY:
        logger.warning("No OpenRouter API key. Using fallback wallet report generator.")
        return fallback_report

    system_prompt = (
        "You are an elite blockchain forensics analyst. Generate a wallet intelligence report based on the data provided. "
        "Your response MUST be divided into exactly three markdown headings: "
        "'# BEHAVIOR PROFILE', '# INTERACTION SUMMARY', and '# RISK ASSESSMENT'. "
        "Be specific, cite numbers, and provide actionable insights. Do not include greetings."
    )

    user_prompt = (
        f"Wallet Address: {address}\n"
        f"Blockchain: {chain}\n"
        f"Wallet Score: {wallet_score}/100 ({risk_level})\n"
        f"Balance: ${balance_usd:,.2f}\n"
        f"Transaction Count: {tx_summary}\n"
        f"Volume: ${volume_usd:,.2f}\n"
        f"Behavior Flags: {', '.join(behavior_flags) if behavior_flags else 'None'}\n\n"
        f"Risk Signals:\n{signals_text}\n"
        f"Token Holdings:\n{tokens_text}\n"
        f"Number of Counterparties: {len(wallet_data.get('counterparties', []))}\n"
        f"Active Approvals: {len(wallet_data.get('approvals', []))}\n"
    )

    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://blockspectra.io",
            "X-Title": "BlockSpectra Wallet Intelligence"
        }

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]

                sections = _parse_sections(content)
                if sections.get("behavior_profile") or sections.get("risk_assessment"):
                    return sections

    except Exception as e:
        logger.error(f"OpenRouter wallet report generation failed: {e}")

    return fallback_report


def _parse_sections(text: str) -> Dict[str, str]:
    """Parse AI response into three sections."""
    import re
    result = {"behavior_profile": "", "interaction_summary": "", "risk_assessment": ""}

    bp_match = re.search(r"# BEHAVIOR PROFILE(.*?)(?=# INTERACTION SUMMARY|# RISK ASSESSMENT|$)", text, re.DOTALL | re.IGNORECASE)
    is_match = re.search(r"# INTERACTION SUMMARY(.*?)(?=# BEHAVIOR PROFILE|# RISK ASSESSMENT|$)", text, re.DOTALL | re.IGNORECASE)
    ra_match = re.search(r"# RISK ASSESSMENT(.*?)(?=# BEHAVIOR PROFILE|# INTERACTION SUMMARY|$)", text, re.DOTALL | re.IGNORECASE)

    if bp_match:
        result["behavior_profile"] = bp_match.group(1).strip()
    if is_match:
        result["interaction_summary"] = is_match.group(1).strip()
    if ra_match:
        result["risk_assessment"] = ra_match.group(1).strip()

    return result


def _generate_fallback_report(
    chain: str,
    address: str,
    wallet_data: Dict[str, Any],
    analysis_result: Dict[str, Any],
) -> Dict[str, str]:
    """Generate detailed fallback report without AI API."""
    flags = analysis_result.get("behavior_flags", [])
    score = analysis_result.get("wallet_score", 50)
    risk_level = analysis_result.get("risk_level", "UNKNOWN")
    balance_usd = wallet_data.get("balance_usd", 0)
    tx_count = wallet_data.get("tx_count", 0)
    tokens = wallet_data.get("tokens", [])
    counterparties = wallet_data.get("counterparties", [])
    approvals = wallet_data.get("approvals", [])

    # Behavior Profile
    behavior_lines = [
        f"This {chain.capitalize()} wallet ({address[:8]}...{address[-6:]}) holds approximately ${balance_usd:,.2f} in native assets",
        f"with {len(tokens)} ERC-20/SPL token holdings across the portfolio."
    ]
    if "whale" in flags:
        behavior_lines.append("The wallet is classified as a **whale address** based on its high asset concentration.")
    if "dormant" in flags:
        behavior_lines.append("This wallet has been **dormant** for an extended period, which may indicate a cold storage or abandoned address.")
    if "high_frequency" in flags:
        behavior_lines.append("Transaction frequency analysis indicates **automated/bot-like trading behavior**.")
    behavior_profile = " ".join(behavior_lines)

    # Interaction Summary
    interaction_lines = [
        f"Over {tx_count} recorded transactions, the wallet has interacted with {len(counterparties)} unique counterparties."
    ]
    labeled = [cp for cp in counterparties if cp.get("label")]
    if labeled:
        labels = ", ".join(set(cp["label"] for cp in labeled[:5]))
        interaction_lines.append(f"Notable protocols identified: {labels}.")
    if approvals:
        risky = [a for a in approvals if a.get("risk") == "HIGH" or a.get("allowance") == "unlimited"]
        interaction_lines.append(f"There are {len(approvals)} active token approvals, {len(risky)} of which carry elevated risk.")
    interaction_summary = " ".join(interaction_lines)

    # Risk Assessment
    risk_lines = [
        f"The wallet received a risk score of **{score}/100** ({risk_level})."
    ]
    if "wash_trader" in flags:
        risk_lines.append("⚠️ Wash trading patterns detected: concentrated transaction volume with a small number of addresses.")
    if "suspicious" in flags:
        risk_lines.append("🚨 Suspicious activity detected: potential mixer interaction or dust attack patterns identified.")
    if "risky_approvals" in flags:
        risk_lines.append("⚠️ High-risk token approvals are active. Recommend revoking unlimited allowances immediately.")
    if not flags:
        risk_lines.append("No significant risk flags were triggered. The wallet appears to operate within normal parameters.")
    risk_assessment = " ".join(risk_lines)

    return {
        "behavior_profile": behavior_profile,
        "interaction_summary": interaction_summary,
        "risk_assessment": risk_assessment,
    }
