import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.wallet_models import WalletAnalysis
from app.data_providers.wallet_provider import fetch_wallet_data
from app.wallet_analyzer import WalletAnalyzer
from app.wallet_ai_generator import generate_wallet_ai_report

logger = logging.getLogger(__name__)


async def run_wallet_analysis_task(analysis_id: str):
    """
    Background task for wallet analysis pipeline.
    1. Fetch wallet data from chain
    2. Run behavioral heuristics
    3. Generate AI report
    4. Update DB record
    """
    logger.info(f"Starting wallet analysis task: {analysis_id}")

    async with AsyncSessionLocal() as session:
        db_analysis = await session.get(WalletAnalysis, analysis_id)
        if not db_analysis:
            logger.error(f"Wallet analysis record not found: {analysis_id}")
            return

        db_analysis.status = "PROCESSING"
        await session.commit()

        try:
            # 1. Fetch wallet data
            wallet_data = await fetch_wallet_data(db_analysis.chain, db_analysis.address)

            # Populate portfolio fields
            db_analysis.total_balance_usd = wallet_data.get("balance_usd", 0)
            db_analysis.token_holdings = wallet_data.get("tokens", [])
            db_analysis.nft_holdings = wallet_data.get("nfts", [])
            db_analysis.approvals = wallet_data.get("approvals", [])
            db_analysis.counterparties = wallet_data.get("counterparties", [])

            # Build transaction summary
            db_analysis.transaction_summary = {
                "tx_count": wallet_data.get("tx_count", 0),
                "first_tx": wallet_data.get("first_tx_date"),
                "last_tx": wallet_data.get("last_tx_date"),
                "volume_usd": wallet_data.get("volume_usd", 0),
                "native_balance": wallet_data.get("balance", 0),
                "native_symbol": wallet_data.get("native_symbol", ""),
            }

            # 2. Run behavioral analysis
            analysis_result = WalletAnalyzer.analyze(wallet_data, db_analysis.chain)
            db_analysis.behavior_flags = analysis_result["behavior_flags"]
            db_analysis.wallet_score = analysis_result["wallet_score"]
            db_analysis.risk_level = analysis_result["risk_level"]

            # Resolve wallet label (simplified)
            db_analysis.wallet_label = _resolve_wallet_label(db_analysis.chain, db_analysis.address)

            # 3. Generate AI report
            ai_report = await generate_wallet_ai_report(
                db_analysis.chain, db_analysis.address,
                wallet_data, analysis_result
            )
            db_analysis.behavior_profile = ai_report.get("behavior_profile")
            db_analysis.interaction_summary = ai_report.get("interaction_summary")
            db_analysis.risk_assessment = ai_report.get("risk_assessment")

            db_analysis.status = "COMPLETED"
            logger.info(f"Wallet analysis completed: {analysis_id}")

        except Exception as e:
            logger.error(f"Error executing wallet analysis: {e}")
            db_analysis.status = "FAILED"
            db_analysis.behavior_profile = f"Error performing wallet analysis: {str(e)}"

        finally:
            await session.commit()


def _resolve_wallet_label(chain: str, address: str) -> str:
    """
    Simple wallet label resolver.
    In production, this would query ENS, Lens, or address label databases.
    """
    # Known address labels (abbreviated demo set)
    known_labels = {
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "vitalik.eth",
        "0xab5801a7d398351b8be11c439e05c5b3259aec9b": "Vitalik Cold Wallet",
        "0x28c6c06298d514db089934071355e5743bf21d60": "Binance Hot Wallet",
        "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance Cold Wallet",
        "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "Binance Treasury",
    }

    label = known_labels.get(address.lower())
    if label:
        return label

    # Truncated address as default label
    return f"{address[:6]}...{address[-4:]}"
