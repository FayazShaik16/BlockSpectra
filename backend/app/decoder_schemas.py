from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DecodeRequest(BaseModel):
    type: str = Field(..., description="Protocol type: ethereum, solana, sui, aptos, bitcoin")
    payload: str = Field(..., description="Raw transaction hex, base58, base64 or assembly script")
    abi: Optional[Any] = Field(None, description="Optional ABI for Ethereum decoding (string or list/dict)")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata (e.g. program ID, accounts, inputs/outputs)")

class DecodedParameter(BaseModel):
    name: str
    type: str
    value: Any

class DecodedEvent(BaseModel):
    name: str
    contract: Optional[str] = None
    parameters: List[DecodedParameter] = []

class DecodedOutput(BaseModel):
    name: Optional[str] = None
    type: str
    value: Any

class DecodedData(BaseModel):
    method_name: str
    parameters: List[DecodedParameter] = []
    events: List[DecodedEvent] = []
    outputs: List[DecodedOutput] = []

class AssetMovement(BaseModel):
    asset: str
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    amount: str
    direction: str  # in, out, transfer

class RiskDetail(BaseModel):
    severity: str  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    description: str

class AnalysisResult(BaseModel):
    explanation: str
    asset_movement: List[AssetMovement] = []
    implications: str
    risks: List[RiskDetail] = []

class DecodeResponse(BaseModel):
    success: bool
    type: str
    decoded: DecodedData
    analysis: AnalysisResult
