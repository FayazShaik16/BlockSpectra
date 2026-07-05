import asyncio
import logging
import httpx
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.simulation_models import TransactionSimulation
from app.simulation_engine import SimulationEngine
from app.config import settings

logger = logging.getLogger(__name__)

async def run_transaction_simulation_task(simulation_id: str):
    """
    Background simulation pipeline:
    1. Fetch simulation record from database.
    2. Execute simulation using the engine.
    3. Generate explanation (either AI or local template).
    4. Save completed record to DB.
    """
    logger.info(f"Starting background transaction simulation for task: {simulation_id}")

    async with AsyncSessionLocal() as session:
        db_simulation = await session.get(TransactionSimulation, simulation_id)
        if not db_simulation:
            logger.error(f"Simulation record not found: {simulation_id}")
            return

        db_simulation.status = "PROCESSING"
        await session.commit()

        try:
            # 1. Run simulation engine
            res = await SimulationEngine.simulate(
                chain=db_simulation.chain,
                backend=db_simulation.backend,
                tx_type=db_simulation.tx_type,
                sender=db_simulation.sender,
                receiver=db_simulation.receiver,
                amount=db_simulation.amount,
                token_address=db_simulation.token_address,
                contract_address=db_simulation.contract_address,
                data=db_simulation.data,
                value=db_simulation.value,
                gas_limit=db_simulation.gas_limit
            )

            # Update simulation fields
            db_simulation.simulation_success = res["simulation_success"]
            db_simulation.error_message = res["error_message"]
            db_simulation.gas_used = res["gas_used"]
            db_simulation.gas_cost_usd = res["gas_cost_usd"]
            db_simulation.execution_trace = res["execution_trace"]
            db_simulation.state_changes = res["state_changes"]
            db_simulation.asset_changes = res["asset_changes"]
            db_simulation.events = res["events"]
            db_simulation.risk_analysis = res["risk_analysis"]

            # 2. Compile Explanation
            explanation = await generate_simulation_explanation(
                db_simulation.tx_type,
                db_simulation.chain,
                db_simulation.sender,
                db_simulation.receiver or "",
                db_simulation.amount or 0.0,
                db_simulation.value or 0.0,
                res["simulation_success"],
                res["error_message"],
                res["asset_changes"],
                res["risk_analysis"]
            )
            db_simulation.explanation = explanation
            db_simulation.status = "COMPLETED"
            logger.info(f"Transaction simulation completed successfully: {simulation_id}")

        except Exception as e:
            logger.error(f"Error executing transaction simulation task: {e}")
            db_simulation.status = "FAILED"
            db_simulation.error_message = f"Simulation pipeline crash: {str(e)}"
            db_simulation.explanation = f"# Simulation Failure\nAn unexpected error occurred during processing:\n`{str(e)}`"

        finally:
            await session.commit()


async def generate_simulation_explanation(
    tx_type: str,
    chain: str,
    sender: str,
    receiver: str,
    amount: float,
    value: float,
    success: bool,
    error_message: Optional[str],
    asset_changes: list,
    risk_analysis: list
) -> str:
    """
    Compile transaction explanation using OpenRouter if available, otherwise local heuristic markdown templates.
    """
    if not settings.OPENROUTER_API_KEY:
        return generate_local_explanation(tx_type, chain, sender, receiver, amount, value, success, error_message, asset_changes, risk_analysis)

    # Compile a prompt for the LLM
    risk_text = "\n".join([f"- [{r['severity']}] {r['type']}: {r['description']}" for r in risk_analysis])
    asset_text = "\n".join([f"- {a['token']} Transfer from {a['from']} to {a['to']} Amount: {a['amount']}" for a in asset_changes])
    
    system_prompt = (
        "You are an expert blockchain transaction debugger and risk analyst. "
        "Your task is to write a human-readable explanation of a simulated blockchain transaction in standard markdown. "
        "Make sure to highlight what happened, net balance modifications, and any security/phishing risks detected."
    )
    user_prompt = (
        f"Chain: {chain}\n"
        f"Transaction Type: {tx_type}\n"
        f"Sender: {sender}\n"
        f"Receiver/Contract: {receiver}\n"
        f"Amount: {amount}\n"
        f"Value (Native): {value}\n"
        f"Execution Success: {success}\n"
        f"Revert Reason: {error_message or 'N/A'}\n\n"
        f"Asset Balance Changes:\n{asset_text or 'None'}\n\n"
        f"Detected Security Risks:\n{risk_text or 'None'}\n"
    )

    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://blockspectra.io",
            "X-Title": "BlockSpectra Simulation Engine"
        }
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"OpenRouter transaction explanation failed: {e}")

    return generate_local_explanation(tx_type, chain, sender, receiver, amount, value, success, error_message, asset_changes, risk_analysis)


def generate_local_explanation(
    tx_type: str,
    chain: str,
    sender: str,
    receiver: str,
    amount: float,
    value: float,
    success: bool,
    error_message: Optional[str],
    asset_changes: list,
    risk_analysis: list
) -> str:
    lines = []
    lines.append(f"# TRANSACTION SUMMARY")
    status_str = "SUCCESSFUL" if success else "FAILED"
    lines.append(f"This transaction is simulated to run on the **{chain.upper()}** blockchain and is expected to result in **{status_str}** execution.")
    
    if not success:
        lines.append(f"\n## Failure Diagnostics")
        lines.append(f"> [!CAUTION]")
        lines.append(f"> **Error Message**: `{error_message}`")
        lines.append(f"> The simulator aborted processing early to protect assets from reverting state blocks.")

    lines.append(f"\n## Operation Breakdown")
    if tx_type == "transfer":
        lines.append(f"- Initiated a direct asset transfer from `{sender}` to `{receiver}`.")
        if amount > 0:
            lines.append(f"- Transfer amount: **{amount}** tokens.")
    elif tx_type == "swap":
        lines.append(f"- Executed swap swaps across liquidity pools to trade input tokens for output tokens.")
        lines.append(f"- Verified pool liquidity depth, trading slippage margins, and path indices.")
    elif tx_type == "approval":
        lines.append(f"- Approved permissions for spender address `{receiver}` to withdraw/trade tokens.")
        lines.append(f"- Approved Allowance: **{amount if amount > 0 else 'UNLIMITED'}** tokens.")
    else:
        lines.append(f"- Triggered custom contract execution on address `{receiver}`.")
        if value > 0:
            lines.append(f"- Native token execution value: **{value}** native assets.")

    if success and asset_changes:
        lines.append(f"\n## Net Balance Changes")
        for asset in asset_changes:
            from_lbl = "You (Sender)" if asset["from"].lower() == sender.lower() else asset["from"][:8] + "..."
            to_lbl = "Receiver" if asset["to"].lower() == receiver.lower() else asset["to"][:8] + "..."
            lines.append(f"- **{asset['token']}**: `{from_lbl}` transferred **{asset['amount']}** to `{to_lbl}` (Estimated value: **${asset['dollar_value']:.2f} USD**).")
            
    if risk_analysis:
        lines.append(f"\n## Risk & Safety Analysis")
        for risk in risk_analysis:
            alert_type = "WARNING" if risk["severity"] == "HIGH" else "CAUTION" if risk["severity"] == "CRITICAL" else "NOTE"
            lines.append(f"> [!{alert_type}]")
            lines.append(f"> **{risk['type'].upper()}** ({risk['severity']} Severity)")
            lines.append(f"> {risk['description']}")
            lines.append("")
            
    return "\n".join(lines)
