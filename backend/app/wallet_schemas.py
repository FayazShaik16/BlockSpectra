from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class WalletAnalysisRequest(BaseModel):
    chain: str = Field(..., example="ethereum")
    address: str = Field(..., example="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")

class WalletReportResponse(BaseModel):
    id: str
    chain: str
    address: str
    status: str
    wallet_label: Optional[str] = None
    wallet_score: int
    risk_level: str
    total_balance_usd: float
    token_holdings: List[Dict[str, Any]]
    nft_holdings: List[Dict[str, Any]]
    transaction_summary: Dict[str, Any]
    approvals: List[Dict[str, Any]]
    counterparties: List[Dict[str, Any]]
    behavior_flags: List[str]
    behavior_profile: Optional[str] = None
    interaction_summary: Optional[str] = None
    risk_assessment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WalletHistoryListResponse(BaseModel):
    analyses: List[WalletReportResponse]
