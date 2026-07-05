from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ReportGenerateRequest(BaseModel):
    report_type: str = Field(..., example="contract") # contract, wallet, transaction, threat
    chain: str = Field(..., example="ethereum")
    target: str = Field(..., example="0x71C7656EC7ab88b098defB751B7401B5f6d8976F")

class ReportResponse(BaseModel):
    id: str
    report_type: str
    chain: str
    target: str
    status: str
    risk_score: int
    confidence_score: int
    severity: str
    statistics: Dict[str, Any]
    executive_summary: Optional[str] = None
    markdown_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReportHistoryResponse(BaseModel):
    reports: List[ReportResponse]

class RegenerateSectionRequest(BaseModel):
    report_id: str
    section: str # e.g. executive_summary, recommendations, attack_scenarios
