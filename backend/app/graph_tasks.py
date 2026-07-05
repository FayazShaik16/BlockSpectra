import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.graph_models import GraphAnalysis
from app.graph_analyzer import GraphAnalyzer

logger = logging.getLogger(__name__)

async def run_graph_build_task(analysis_id: str):
    """
    Background task for Cross-Chain Attack Graph pipeline.
    1. Fetch seed details.
    2. Generate neighborhood topology (multi-chain nodes/edges).
    3. Run NetworkX path, community, and centrality analyses.
    4. Save to DB.
    """
    logger.info(f"Starting graph build task: {analysis_id}")

    async with AsyncSessionLocal() as session:
        db_analysis = await session.get(GraphAnalysis, analysis_id)
        if not db_analysis:
            logger.error(f"Graph analysis record not found: {analysis_id}")
            return

        db_analysis.status = "PROCESSING"
        await session.commit()

        try:
            # Simulate a slight delay to mock data fetching
            await asyncio.sleep(2.0)

            chain = db_analysis.chain.lower()
            addr = db_analysis.address
            addr_short = f"{addr[:6]}...{addr[-4:]}" if len(addr) > 10 else addr

            # Construct simulated cross-chain graph topology
            # Renders Wallets, Contracts, Tokens, Bridges, Protocols, Exchanges, Chains
            nodes = [
                # Seed node
                {"id": "seed_node", "label": f"Seed: {addr_short}", "type": "Wallet", "chain": chain, "properties": {"address": addr}},
                
                # Ethereum nodes
                {"id": "eth_usdc", "label": "USDC Token (Ethereum)", "type": "Token", "chain": "ethereum", "properties": {"decimals": 6, "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}},
                {"id": "uniswap_router", "label": "Uniswap V3 Router", "type": "Protocol", "chain": "ethereum", "properties": {"interactions": 49021}},
                {"id": "tornado_cash", "label": "Tornado.Cash: Mixer", "type": "Wallet", "chain": "ethereum", "properties": {"reputation": "Suspicious", "mixer": True}},
                {"id": "across_bridge", "label": "Across: Bridge Portal", "type": "Bridge", "chain": "ethereum", "properties": {"supported_chains": ["Ethereum", "Arbitrum", "Base", "Optimism"]}},
                
                # Arbitrum nodes
                {"id": "across_dest", "label": "Across: L2 Release (Arbitrum)", "type": "Bridge", "chain": "arbitrum", "properties": {"gas_optimized": True}},
                {"id": "target_swapper", "label": "Target: 0x8f7d...9c2e", "type": "Wallet", "chain": "arbitrum", "properties": {"tx_count": 87}},
                {"id": "arbitrum_usdc", "label": "USDC Token (Arbitrum)", "type": "Token", "chain": "arbitrum", "properties": {"address": "0xaf88d065e77c8cc2239327c5edd1344135c11d61"}},
                {"id": "gmx_vault", "label": "GMX: Liquidity Vault", "type": "Protocol", "chain": "arbitrum", "properties": {"tvl_usd": 482000000}},
                
                # BNB nodes
                {"id": "binance_deposit", "label": "Binance: Hot Wallet", "type": "Exchange", "chain": "bnb", "properties": {"address": "0x28c6c06298d514db089934071355e5743bf21d60"}},
                {"id": "target_bnb_wallet", "label": "BNB Wallet: 0x5e1a...2d3c", "type": "Wallet", "chain": "bnb", "properties": {"balance_bnb": 182.4}},
                
                # Chains (Global context anchors)
                {"id": "chain_ethereum", "label": "Ethereum Mainnet", "type": "Chain", "chain": "ethereum", "properties": {"block_time": "12s"}},
                {"id": "chain_arbitrum", "label": "Arbitrum One L2", "type": "Chain", "chain": "arbitrum", "properties": {"rollup_type": "Optimistic"}},
                {"id": "chain_bnb", "label": "BNB Smart Chain", "type": "Chain", "chain": "bnb", "properties": {"consensus": "PoSA"}},
            ]

            edges = [
                # Ethereum interactions
                {"source": "seed_node", "target": "eth_usdc", "type": "Approval", "value_usd": 0.0, "label": "Approve USDC", "chain": "ethereum"},
                {"source": "seed_node", "target": "uniswap_router", "type": "Interaction", "value_usd": 25000.0, "label": "Swap USDC", "chain": "ethereum"},
                {"source": "seed_node", "target": "tornado_cash", "type": "Transfer", "value_usd": 85000.0, "label": "Transfer 30 ETH", "chain": "ethereum"},
                {"source": "seed_node", "target": "across_bridge", "type": "Bridge", "value_usd": 120000.0, "label": "Bridge 120k USDC", "chain": "ethereum"},
                
                # Cross-chain bridge link
                {"source": "across_bridge", "target": "across_dest", "type": "Bridge", "value_usd": 120000.0, "label": "Across Relayer Settlement", "chain": "arbitrum"},
                
                # Arbitrum interactions
                {"source": "across_dest", "target": "target_swapper", "type": "Transfer", "value_usd": 119850.0, "label": "Release 119.8k USDC", "chain": "arbitrum"},
                {"source": "target_swapper", "target": "arbitrum_usdc", "type": "Approval", "value_usd": 0.0, "label": "Approve USDC", "chain": "arbitrum"},
                {"source": "target_swapper", "target": "gmx_vault", "type": "Interaction", "value_usd": 50000.0, "label": "Deposit GLP", "chain": "arbitrum"},
                {"source": "target_swapper", "target": "target_bnb_wallet", "type": "Bridge", "value_usd": 65000.0, "label": "Bridge BNB via Stargate", "chain": "bnb"},
                
                # BNB interactions
                {"source": "target_bnb_wallet", "target": "binance_deposit", "type": "Transfer", "value_usd": 64800.0, "label": "Deposit Binance", "chain": "bnb"},
                
                # Chain references
                {"source": "seed_node", "target": "chain_ethereum", "type": "Interaction", "value_usd": 0.0, "label": "Gas Fee Paid", "chain": "ethereum"},
                {"source": "target_swapper", "target": "chain_arbitrum", "type": "Interaction", "value_usd": 0.0, "label": "L2 Rollup Fee", "chain": "arbitrum"},
                {"source": "target_bnb_wallet", "target": "chain_bnb", "type": "Interaction", "value_usd": 0.0, "label": "Gas Fee Paid", "chain": "bnb"},
            ]

            # Adjust starting node values depending on user-specified search seed
            # (Replace placeholders if user search matches another chain/address)
            nodes[0]["label"] = f"Seed ({db_analysis.chain.upper()}): {addr_short}"
            nodes[0]["chain"] = chain

            # If seed node chain is not ethereum, link it dynamically
            if chain != "ethereum":
                edges.append({"source": "seed_node", "target": "across_bridge", "type": "Bridge", "value_usd": 10000.0, "label": "Bridge out", "chain": chain})

            # Run NetworkX Graph Analytics
            analysis_results = GraphAnalyzer.analyze(nodes, edges, "seed_node")

            db_analysis.nodes = analysis_results["nodes"]
            db_analysis.edges = analysis_results["edges"]
            db_analysis.report = analysis_results["report"]
            db_analysis.status = "COMPLETED"

            logger.info(f"Graph build task completed successfully: {analysis_id}")

        except Exception as e:
            logger.error(f"Error executing graph analysis task: {e}")
            db_analysis.status = "FAILED"
            db_analysis.report = {"error": f"Error performing graph analysis: {str(e)}"}

        finally:
            await session.commit()
