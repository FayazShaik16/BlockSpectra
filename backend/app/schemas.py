from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AnalysisRequest(BaseModel):
    chain: str = Field(..., example="ethereum")
    address: str = Field(..., example="0x71C7656EC7ab88b098defB751B7401B5f6d8976F")

class FindingDetail(BaseModel):
    vulnerability: str
    description: str
    severity: str
    line: Optional[int] = None
    code_snippet: Optional[str] = None

class AnalysisReportResponse(BaseModel):
    id: str
    chain: str
    address: str
    status: str
    contract_name: Optional[str] = None
    risk_score: int
    severity: str
    confidence_score: int
    executive_summary: Optional[str] = None
    attack_scenarios: Optional[str] = None
    recommendations: Optional[str] = None
    findings: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HistoryListResponse(BaseModel):
    analyses: List[AnalysisReportResponse]


class TranslateCardsRequest(BaseModel):
    language: str
    explanation_level: str
    cards: List[Dict[str, Any]]


class TranslateFullRequest(BaseModel):
    language: str
    explanation_level: str
    report_data: Dict[str, Any]


