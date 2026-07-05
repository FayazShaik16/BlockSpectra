from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional

class GraphBuildRequest(BaseModel):
    chain: str
    address: str

class GraphReportResponse(BaseModel):
    id: str
    chain: str
    address: str
    status: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    report: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GraphHistoryListResponse(BaseModel):
    analyses: List[GraphReportResponse]
