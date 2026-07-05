from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text
from datetime import datetime
from app.database import Base

class WalletAnalysis(Base):
    __tablename__ = "wallet_analyses"

    id = Column(String, primary_key=True, index=True)
    chain = Column(String, index=True, nullable=False)
    address = Column(String, index=True, nullable=False)
    status = Column(String, default="PENDING", nullable=False)  # PENDING, PROCESSING, COMPLETED, FAILED

    # Resolved identity
    wallet_label = Column(String, nullable=True)

    # Scores
    wallet_score = Column(Integer, default=50)  # 0-100, lower = safer
    risk_level = Column(String, default="UNKNOWN")  # CRITICAL, HIGH, MEDIUM, LOW, SAFE

    # Portfolio
    total_balance_usd = Column(Float, default=0.0)
    token_holdings = Column(JSON, default=list)   # [{symbol, name, balance, value_usd}]
    nft_holdings = Column(JSON, default=list)      # [{collection, token_id, count}]

    # Transaction intelligence
    transaction_summary = Column(JSON, default=dict)  # {tx_count, first_tx, last_tx, volume_usd, ...}
    approvals = Column(JSON, default=list)             # [{spender, token, allowance, risk}]
    counterparties = Column(JSON, default=list)        # [{address, label, tx_count, volume}]

    # Behavioral flags
    behavior_flags = Column(JSON, default=list)  # ["whale", "dormant", "wash_trader", "suspicious"]

    # AI-generated summaries
    behavior_profile = Column(Text, nullable=True)
    interaction_summary = Column(Text, nullable=True)
    risk_assessment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
