from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text, Boolean
from datetime import datetime
from app.database import Base

class TransactionSimulation(Base):
    __tablename__ = "transaction_simulations"

    id = Column(String, primary_key=True, index=True)
    chain = Column(String, index=True, nullable=False)
    backend = Column(String, nullable=False) # tenderly, foundry, anvil, custom
    tx_type = Column(String, nullable=False) # transfer, swap, approval, contract_call
    
    sender = Column(String, nullable=False)
    receiver = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    token_address = Column(String, nullable=True)
    contract_address = Column(String, nullable=True)
    data = Column(Text, nullable=True)
    value = Column(Float, default=0.0)
    gas_limit = Column(Integer, default=1000000)
    
    status = Column(String, default="PENDING", nullable=False) # PENDING, PROCESSING, COMPLETED, FAILED
    simulation_success = Column(Boolean, default=True)
    error_message = Column(String, nullable=True)
    
    gas_used = Column(Integer, default=0)
    gas_cost_usd = Column(Float, default=0.0)
    
    # Detailed simulation arrays/objects
    execution_trace = Column(JSON, default=list)
    state_changes = Column(JSON, default=list)
    asset_changes = Column(JSON, default=list)
    events = Column(JSON, default=list)
    risk_analysis = Column(JSON, default=list)
    
    explanation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
