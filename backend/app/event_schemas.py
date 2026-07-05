from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class EventAnalysisRequest(BaseModel):
    chain: str = Field(..., description="Blockchain: ethereum, solana, sui, aptos")
    logs: Optional[List[Dict[str, Any]]] = Field(None, description="List of raw event logs / message objects")
    tx_hash: Optional[str] = Field(None, description="Optional transaction hash to fetch logs dynamically")
    address: Optional[str] = Field(None, description="Optional contract address to fetch logs dynamically")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional block / transaction metadata")

class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    event_type: str  # TRANSFER, APPROVAL, MINT, BURN, OWNERSHIP, UPGRADE, BRIDGE, SWAP, LIQUIDATION, UNKNOWN
    title: str
    description: str
    severity: str  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    contract: Optional[str] = None

class AssetFlow(BaseModel):
    asset: str
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    amount: str
    dollar_value: Optional[float] = None

class VisualEventCard(BaseModel):
    type: str
    title: str
    sub_text: str
    accent_color: str  # emerald, blue, purple, yellow, red, orange, gray
    icon_name: str

class SuspiciousActivity(BaseModel):
    type: str
    severity: str  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    description: str

class EventAnalysisResponse(BaseModel):
    success: bool
    chain: str
    timeline: List[TimelineEvent] = []
    asset_movement: List[AssetFlow] = []
    visual_cards: List[VisualEventCard] = []
    suspicious_activities: List[SuspiciousActivity] = []
