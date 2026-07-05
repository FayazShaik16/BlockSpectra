import httpx
import logging
import re
from typing import Dict
from app.config import settings

logger = logging.getLogger(__name__)

# Level-specific prompt instructions that control explanation depth and tone
LEVEL_PROMPTS = {
    "beginner": (
        "EXPLANATION LEVEL: BEGINNER\n"
        "- Write for someone who has NEVER used cryptocurrency or blockchain before.\n"
        "- Use extremely simple, everyday language. Imagine explaining to a curious friend.\n"
        "- Replace ALL technical jargon with plain-language equivalents.\n"
        "- Use vivid real-world analogies for every concept (e.g., 'Think of a smart contract like a vending machine...').\n"
        "- Keep sentences short and paragraphs small.\n"
        "- When you must mention a technical term, always follow it with a simple explanation in parentheses.\n"
        "- Focus on WHAT the risk means for the user's money, not HOW the code works.\n"
        "- Avoid code references, function names, or Solidity syntax entirely.\n"
    ),
    "intermediate": (
        "EXPLANATION LEVEL: INTERMEDIATE\n"
        "- Write for crypto investors and DeFi users who understand wallets, tokens, and basic blockchain concepts.\n"
        "- Explain technical concepts with moderate detail — enough to understand the risk, not the full exploit.\n"
        "- Use analogies sparingly and only for complex vulnerability patterns.\n"
        "- You may reference function-level concepts (e.g., 'the transfer function') but avoid raw code.\n"
        "- Balance clarity with precision. Investors need to know whether to trust this contract.\n"
        "- Include practical impact statements (e.g., 'This could allow someone to drain the liquidity pool').\n"
    ),
    "expert": (
        "EXPLANATION LEVEL: EXPERT\n"
        "- Write for smart contract developers, security auditors, and protocol engineers.\n"
        "- Use precise blockchain terminology without simplification.\n"
        "- Include specific vulnerability classifications (e.g., SWC-107, CWE-841).\n"
        "- Reference Solidity patterns, EVM opcodes, and protocol-level details where relevant.\n"
        "- Discuss attack vectors with technical precision: entry points, preconditions, and exploit chains.\n"
        "- Include gas considerations, storage layout implications, and upgrade proxy patterns if applicable.\n"
        "- Provide mitigation recommendations with specific code patterns (e.g., 'Use ReentrancyGuard from OpenZeppelin').\n"
        "- Do NOT over-simplify. The reader knows what delegatecall, selfdestruct, and calldata encoding are.\n"
    )
}


async def translate_report_sections(
    executive_summary: str,
    attack_scenarios: str,
    recommendations: str,
    language: str,
    explanation_level: str = "intermediate"
) -> Dict[str, str]:
    """
    Translates/rewrites the security findings in a premium, natural style for native speakers
    using OpenRouter and Gemini-2.5-flash.
    Ensures technical blockchain terms (e.g. Reentrancy) remain in English but are explained.
    Adjusts explanation depth based on the explanation_level parameter.
    """
    fallback_result = {
        "executive_summary": executive_summary,
        "attack_scenarios": attack_scenarios,
        "recommendations": recommendations
    }

    if not settings.OPENROUTER_API_KEY:
        logger.warning("No OpenRouter API key found. Falling back to original English report.")
        return fallback_result

    # Resolve level prompt (default to intermediate if invalid)
    level_key = explanation_level.lower().strip() if explanation_level else "intermediate"
    level_instruction = LEVEL_PROMPTS.get(level_key, LEVEL_PROMPTS["intermediate"])

    # Determine if translation is needed or just level adjustment
    is_english = language.lower() in ("en", "english", "")
    
    if is_english:
        language_instruction = (
            "The output language is English. Do NOT translate. "
            "Instead, REWRITE the analysis adapting the explanation depth and tone according to the level instructions below."
        )
    else:
        language_instruction = (
            f"Translate and rewrite the analysis into {language}.\n"
            "Do NOT perform a literal, word-for-word translation. Rewrite naturally so native speakers can easily understand.\n"
            "Globally recognized blockchain terminology (such as 'Smart Contract', 'Wallet', 'Gas', 'Mint', 'Burn', 'Stake', "
            "'Validator', 'Node', 'Liquidity', 'Bridge', 'DEX', 'Oracle', 'ERC-20', 'ERC-721', 'Hash', 'Nonce', 'Signature', "
            "'Reentrancy', 'Flash Loan', 'Integer Overflow', 'Access Control', 'Delegatecall', 'Selfdestruct') MUST remain in English. "
            "Do NOT translate these terms into localized words. Instead, keep them in English and explain them in the surrounding localized text context "
            "if needed (e.g. for Hindi: 'Smart Contract एक ऐसा प्रोग्राम है जो Blockchain पर अपने आप नियमों का पालन करता है।')."
        )

    # Format the prompt
    system_prompt = (
        "You are an expert smart contract security analyst and technical communicator.\n\n"
        f"{language_instruction}\n\n"
        f"{level_instruction}\n"
        "CRITICAL FORMAT INSTRUCTIONS:\n"
        "1. Preserve all core meaning, security findings, risk levels, and educational explanations.\n"
        "2. Your response MUST be divided into exactly three markdown headings: "
        "'# EXECUTIVE SUMMARY', '# ATTACK SCENARIOS', and '# RECOMMENDATIONS'. "
        "Do not include any greeting or text outside these headings.\n"
        "3. You MUST output exactly these headers in English, with the adapted content directly underneath them."
    )

    user_prompt = (
        f"Please rewrite the following three sections of the smart contract analysis report.\n\n"
        f"### ORIGINAL EXECUTIVE SUMMARY:\n{executive_summary}\n\n"
        f"### ORIGINAL ATTACK SCENARIOS:\n{attack_scenarios}\n\n"
        f"### ORIGINAL RECOMMENDATIONS:\n{recommendations}\n"
    )

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
            "temperature": 0.2,
            "max_tokens": 3000
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
                
                parsed = parse_translated_sections(content)
                
                # Make sure we got some content back
                if parsed["executive_summary"] or parsed["attack_scenarios"] or parsed["recommendations"]:
                    # Fallback values if one of the sections is empty
                    return {
                        "executive_summary": parsed["executive_summary"] or executive_summary,
                        "attack_scenarios": parsed["attack_scenarios"] or attack_scenarios,
                        "recommendations": parsed["recommendations"] or recommendations
                    }
            else:
                logger.error(f"OpenRouter returned status {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"OpenRouter report translation failed: {e}")

    return fallback_result

def parse_translated_sections(text: str) -> Dict[str, str]:
    result = {"executive_summary": "", "attack_scenarios": "", "recommendations": ""}
    
    # Try regex matching first (case-insensitive, matching English headers)
    exec_match = re.search(r"#\s*EXECUTIVE\s+SUMMARY(.*?)(?=#\s*ATTACK\s*SCENARIOS|#\s*RECOMMENDATIONS|$)", text, re.DOTALL | re.IGNORECASE)
    attack_match = re.search(r"#\s*ATTACK\s+SCENARIOS(.*?)(?=#\s*RECOMMENDATIONS|#\s*EXECUTIVE\s*SUMMARY|$)", text, re.DOTALL | re.IGNORECASE)
    recs_match = re.search(r"#\s*RECOMMENDATIONS(.*?)(?=#\s*EXECUTIVE\s*SUMMARY|#\s*ATTACK\s*SCENARIOS|$)", text, re.DOTALL | re.IGNORECASE)
    
    if exec_match:
        result["executive_summary"] = exec_match.group(1).strip()
    if attack_match:
        result["attack_scenarios"] = attack_match.group(1).strip()
    if recs_match:
        result["recommendations"] = recs_match.group(1).strip()
        
    # If any section is empty, try splitting sequentially
    if not (result["executive_summary"] and result["attack_scenarios"] and result["recommendations"]):
        parts = re.split(r'#+\s*', text)
        cleaned_parts = [p.strip() for p in parts if p.strip()]
        if len(cleaned_parts) >= 3:
            for idx, key in enumerate(["executive_summary", "attack_scenarios", "recommendations"]):
                lines = cleaned_parts[idx].split('\n')
                # If first line is short (header), drop it
                if len(lines[0]) < 50:
                    result[key] = '\n'.join(lines[1:]).strip()
                else:
                    result[key] = cleaned_parts[idx]
                    
    return result


async def translate_cards(
    cards: list,
    language: str,
    explanation_level: str = "intermediate"
) -> list:
    """
    Translates and rewrites a list of cards dynamically using OpenRouter and Gemini-2.5-flash.
    Returns the updated card list with string values naturally translated/rewritten.
    Enforces that technical terms remain in English and description level adapts to the level.
    """
    import json
    
    fallback_result = cards

    if not settings.OPENROUTER_API_KEY:
        logger.warning("No OpenRouter API key found. Falling back to original cards.")
        return fallback_result

    # Resolve level prompt
    level_key = explanation_level.lower().strip() if explanation_level else "intermediate"
    level_instruction = LEVEL_PROMPTS.get(level_key, LEVEL_PROMPTS["intermediate"])

    # Determine translation vs rewriting instructions
    is_english = language.lower() in ("en", "english", "")
    
    if is_english:
        language_instruction = (
            "The output language is English. Do NOT translate. "
            "Instead, REWRITE the explanation texts in the JSON according to the explanation level instructions below."
        )
    else:
        language_instruction = (
            f"Translate and rewrite the explanation texts in the JSON into {language}.\n"
            "Do NOT perform a literal, word-for-word translation. Rewrite naturally so native speakers can easily understand.\n"
            "Globally recognized blockchain terminology (such as 'Smart Contract', 'Wallet', 'Gas', 'Mint', 'Burn', 'Stake', "
            "'Validator', 'Node', 'Liquidity', 'Bridge', 'DEX', 'Oracle', 'ERC-20', 'ERC-721', 'Hash', 'Nonce', 'Signature', "
            "'Reentrancy', 'Flash Loan', 'Integer Overflow', 'Access Control', 'Delegatecall', 'Selfdestruct') MUST remain in English. "
            "Do NOT translate these terms into localized words. Instead, keep them in English and explain them in the surrounding localized text context "
            "if needed (e.g. for Hindi: 'Smart Contract एक ऐसा प्रोग्राम है जो Blockchain पर अपने आप नियमों का पालन करता है।')."
        )

    system_prompt = (
        "You are an expert smart contract security analyst and premium technical translator.\n\n"
        f"{language_instruction}\n\n"
        f"{level_instruction}\n"
        "CRITICAL FORMAT INSTRUCTIONS:\n"
        "1. You will be provided with a JSON list of card objects. Each card has 'id', 'title', 'text', and optionally 'sub_items' containing fields to translate.\n"
        "2. Do NOT change key names (like 'id', 'title', 'text', 'desc', 'label', 'term', 'definition', 'why', 'whyItMatters', 'scenario').\n"
        "3. Rewrite/translate all string values (like card texts, definitions, descriptions, key explanations, scenarios).\n"
        "4. Preserve numbers, icons, status codes, colors, and percentages exactly as they are.\n"
        "5. You MUST respond with ONLY a valid JSON list of objects matching the input JSON structure. Do not output markdown wrappers, greetings, or explanations."
    )

    user_prompt = (
        f"Translate/rewrite the string values in the following JSON array:\n\n"
        f"{json.dumps(cards, ensure_ascii=False)}"
    )

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
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "max_tokens": 4000
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                # Parse JSON result safely
                cleaned_content = content.strip()
                if cleaned_content.startswith("```json"):
                    cleaned_content = cleaned_content[7:]
                if cleaned_content.endswith("```"):
                    cleaned_content = cleaned_content[:-3]
                cleaned_content = cleaned_content.strip()
                
                translated_data = json.loads(cleaned_content)
                if isinstance(translated_data, list):
                    return translated_data
                elif isinstance(translated_data, dict) and "cards" in translated_data:
                    return translated_data["cards"]
                elif isinstance(translated_data, dict) and isinstance(list(translated_data.values())[0], list):
                    # Handle if the LLM wrapped it under some arbitrary key
                    return list(translated_data.values())[0]
                else:
                    logger.warning(f"Unexpected JSON format from OpenRouter translation: {translated_data}")
            else:
                logger.error(f"OpenRouter cards translation returned status {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"OpenRouter cards translation failed: {e}")

    return fallback_result


async def translate_full_report(
    report_data: dict,
    language: str,
    explanation_level: str = "intermediate"
) -> dict:
    """
    Recursively translates all string values in the report data JSON structure
    using OpenRouter and Gemini-2.5-flash.
    Enforces rules for preserving technical terms, Solidity variables, addresses,
    and formats.
    """
    import json
    
    fallback_result = report_data

    if not settings.OPENROUTER_API_KEY:
        logger.warning("No OpenRouter API key found. Returning fallback report data.")
        return fallback_result

    # Resolve level prompt
    level_key = explanation_level.lower().strip() if explanation_level else "intermediate"
    level_instruction = LEVEL_PROMPTS.get(level_key, LEVEL_PROMPTS["intermediate"])

    # Determine translation vs rewriting instructions
    is_english = language.lower() in ("en", "english", "")
    
    if is_english:
        language_instruction = (
            "The output language is English. Do NOT translate. "
            "Instead, REWRITE the explanation texts in the JSON according to the explanation level instructions below."
        )
    else:
        language_instruction = (
            f"Translate and rewrite all string values in the JSON into {language}.\n"
            "Do NOT perform a literal, word-for-word translation. Rewrite naturally so native speakers can easily understand.\n"
            "Globally recognized blockchain terminology (such as 'Smart Contract', 'Wallet', 'Gas', 'Mint', 'Burn', 'Stake', "
            "'Validator', 'Node', 'Liquidity', 'Bridge', 'DEX', 'Oracle', 'ERC-20', 'ERC-721', 'Hash', 'Nonce', 'Signature', "
            "'Reentrancy', 'Flash Loan', 'Integer Overflow', 'Access Control', 'Delegatecall', 'Selfdestruct') MUST remain in English.\n"
            "Do NOT translate these technical terms into localized words."
        )

    system_prompt = (
        "You are an expert smart contract security analyst and premium technical translator.\n\n"
        f"{language_instruction}\n\n"
        f"{level_instruction}\n"
        "CRITICAL FORMAT INSTRUCTIONS:\n"
        "1. You will be provided with a complex JSON object containing report summaries, findings, and lists of cards.\n"
        "2. Do NOT change key names, numeric keys, IDs, scores, numbers, or boolean values.\n"
        "3. NEVER translate Solidity code snippets, contract addresses, transaction hashes, wallet addresses, block numbers, chain names, function names, event names, variable names, ABI, or bytecode.\n"
        "4. Rewrite/translate all string values (explanations, descriptions, glossary definitions, verdicts, scenarios, text fields) naturally.\n"
        "5. Preserve markdown formatting, bullet points, tables, headings, bold/italic syntax, icons, and spacing exactly.\n"
        "6. You MUST respond with ONLY a valid JSON object matching the exact structure of the input JSON. Do not output markdown code wrappers, greetings, or explanations."
    )

    user_prompt = (
        f"Translate/rewrite the string values in the following JSON object:\n\n"
        f"{json.dumps(report_data, ensure_ascii=False)}"
    )

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
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "max_tokens": 4000
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                # Parse JSON result safely
                cleaned_content = content.strip()
                if cleaned_content.startswith("```json"):
                    cleaned_content = cleaned_content[7:]
                if cleaned_content.endswith("```"):
                    cleaned_content = cleaned_content[:-3]
                cleaned_content = cleaned_content.strip()
                
                translated_data = json.loads(cleaned_content)
                if isinstance(translated_data, dict):
                    return translated_data
                else:
                    logger.warning(f"Unexpected JSON format from OpenRouter translation: {translated_data}")
            else:
                logger.error(f"OpenRouter full translation returned status {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"OpenRouter full translation failed: {e}")

    return fallback_result

