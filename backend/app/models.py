from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from datetime import datetime
from app.database import Base

class ContractAnalysis(Base):
    __tablename__ = "contract_analyses"

    id = Column(String, primary_key=True, index=True)
    chain = Column(String, index=True, nullable=False)
    address = Column(String, index=True, nullable=False)
    status = Column(String, default="PENDING", nullable=False) # PENDING, PROCESSING, COMPLETED, FAILED
    
    # Source metadata
    contract_name = Column(String, nullable=True)
    source_code = Column(Text, nullable=True)
    
    # Audit Metrics
    risk_score = Column(Integer, default=0)
    severity = Column(String, default="INFO") # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence_score = Column(Integer, default=0)
    
    # Compiled summaries and findings
    executive_summary = Column(Text, nullable=True)
    attack_scenarios = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    findings = Column(JSON, default=list) # List of vulnerabilities detected by Heuristics
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(String, primary_key=True, index=True)
    report_type = Column(String, index=True, nullable=False) # contract, wallet, transaction, threat
    chain = Column(String, index=True, nullable=False)
    target = Column(String, index=True, nullable=False)
    status = Column(String, default="PENDING", nullable=False) # PENDING, PROCESSING, COMPLETED, FAILED
    
    risk_score = Column(Integer, default=0)
    confidence_score = Column(Integer, default=0)
    severity = Column(String, default="INFO") # CRITICAL, HIGH, MEDIUM, LOW, INFO
    statistics = Column(JSON, default=dict) # Dict of key statistics
    
    executive_summary = Column(Text, nullable=True)
    markdown_content = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContractTranslation(Base):
    __tablename__ = "contract_translations"

    id = Column(String, primary_key=True, index=True)  # format: "{analysis_id}_{language}_{level}"
    analysis_id = Column(String, index=True, nullable=False)
    language = Column(String, index=True, nullable=False)
    explanation_level = Column(String, index=True, nullable=False, default="intermediate")  # beginner, intermediate, expert
    
    executive_summary = Column(Text, nullable=True)
    attack_scenarios = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    card_texts = Column(JSON, nullable=True)  # Translated card {title, text} pairs
    full_report_json = Column(JSON, nullable=True)  # Cached complete translated report JSON
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


