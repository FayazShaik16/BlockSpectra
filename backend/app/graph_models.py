from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.database import Base

class GraphAnalysis(Base):
    __tablename__ = "graph_analyses"

    id = Column(String, primary_key=True, index=True)
    chain = Column(String, index=True, nullable=False)
    address = Column(String, index=True, nullable=False)
    status = Column(String, default="PENDING", nullable=False)  # PENDING, PROCESSING, COMPLETED, FAILED

    # Graph elements
    nodes = Column(JSON, default=list)  # List of nodes: [{id, label, type, risk_score, properties}]
    edges = Column(JSON, default=list)  # List of edges: [{source, target, type, value_usd, label, chain}]

    # Computed NetworkX and AI insights reports
    report = Column(JSON, default=dict)  # {suspicious_clusters: [], attack_paths: [], central_entities: [], money_flow: [], bridge_movements: []}

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
