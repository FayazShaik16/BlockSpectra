import httpx
import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

async def generate_ai_report(
    contract_name: str, 
    source_code: str, 
    findings: List[Dict[str, Any]], 
    chain: str
) -> Dict[str, str]:
    """
    Query OpenRouter Free model to compile vulnerability details into a structured security report.
    Returns: Dict containing executive_summary, attack_scenarios, recommendations
    """
    # Truncate source code if too long for prompt token efficiency
    code_summary = source_code
    if len(source_code) > 6000:
        code_summary = source_code[:3000] + "\n\n... [TRUNCATED CODE] ...\n\n" + source_code[-3000:]

    findings_summary = ""
    for f in findings:
        findings_summary += f"- [{f['severity']}] {f['vulnerability']} at line {f.get('line', 'N/A')}: {f['description']}\n"

    system_prompt = (
        "You are an elite smart contract security auditor. Your task is to output a detailed audit report based on code metadata and static analyzer findings. "
        "Your response MUST be divided into exactly three markdown headings: "
        "'# EXECUTIVE SUMMARY', '# ATTACK SCENARIOS', and '# RECOMMENDATIONS'. "
        "Do not include any greeting or text outside these headings."
    )

    user_prompt = (
        f"Contract Name: {contract_name}\n"
        f"Blockchain: {chain}\n\n"
        f"Findings from static analyzer:\n{findings_summary}\n\n"
        f"Source Code:\n```solidity\n{code_summary}\n```"
    )

    fallback_report = {
        "executive_summary": f"Audit complete for {contract_name}. Static analyzer flagged {len(findings)} issues on chain {chain}.",
        "attack_scenarios": "Simulated scenario: Exploiter targets code flow anomalies to drain contract balance.",
        "recommendations": "Add standard ReentrancyGuard modifiers and restrict permissions to authorized addresses only."
    }

    # If API key is not present, return fallback immediately
    if not settings.OPENROUTER_API_KEY:
        logger.warning("No OpenRouter API key. Using local fallback generator.")
        return fallback_report

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
                
                # Simple parsing logic to segment response into three sections
                sections = {"executive_summary": "", "attack_scenarios": "", "recommendations": ""}
                
                parts = re_split_sections(content)
                if parts.get("exec"):
                    sections["executive_summary"] = parts["exec"]
                if parts.get("attack"):
                    sections["attack_scenarios"] = parts["attack"]
                if parts.get("recs"):
                    sections["recommendations"] = parts["recs"]
                
                # Make sure the parsed parts are not empty before returning
                if sections["executive_summary"] or sections["attack_scenarios"]:
                    return sections

    except Exception as e:
        logger.error(f"OpenRouter report generation failed: {e}")

    return fallback_report

def re_split_sections(text: str) -> Dict[str, str]:
    import re
    result = {"exec": "", "attack": "", "recs": ""}
    
    # Split text into sections by matches
    exec_match = re.search(r"# EXECUTIVE SUMMARY(.*?)(?=# ATTACK SCENARIOS|# RECOMMENDATIONS|$)", text, re.DOTALL | re.IGNORECASE)
    attack_match = re.search(r"# ATTACK SCENARIOS(.*?)(?=# RECOMMENDATIONS|# EXECUTIVE SUMMARY|$)", text, re.DOTALL | re.IGNORECASE)
    recs_match = re.search(r"# RECOMMENDATIONS(.*?)(?=# EXECUTIVE SUMMARY|# ATTACK SCENARIOS|$)", text, re.DOTALL | re.IGNORECASE)
    
    if exec_match:
        result["exec"] = exec_match.group(1).strip()
    if attack_match:
        result["attack"] = attack_match.group(1).strip()
    if recs_match:
        result["recs"] = recs_match.group(1).strip()
        
    return result
