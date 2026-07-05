from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class SimulationRequest(BaseModel):
    chain: str = Field(..., example="ethereum")
    backend: str = Field(..., example="custom") # tenderly, foundry, anvil, custom
    tx_type: str = Field(..., example="transfer") # transfer, swap, approval, contract_call
    
    sender: str = Field(..., example="0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
    receiver: Optional[str] = Field(None, example="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
    amount: Optional[float] = Field(None, example=1.5)
    token_address: Optional[str] = Field(None, example="0xdAC17F958D2ee523a2206206994597C13D831ec7")
    contract_address: Optional[str] = Field(None, example="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    data: Optional[str] = Field(None, example="0x")
    value: Optional[float] = Field(0.0, example=0.0)
    gas_limit: Optional[int] = Field(1000000, example=1000000)

class SimulationReportResponse(BaseModel):
    id: str
    chain: str
    backend: str
    tx_type: str
    
    sender: str
    receiver: Optional[str] = None
    amount: Optional[float] = None
    token_address: Optional[str] = None
    contract_address: Optional[str] = None
    data: Optional[str] = None
    value: float
    gas_limit: int
    
    status: str
    simulation_success: bool
    error_message: Optional[str] = None
    
    gas_used: int
    gas_cost_usd: float
    
    execution_trace: List[Dict[str, Any]]
    state_changes: List[Dict[str, Any]]
    asset_changes: List[Dict[str, Any]]
    events: List[Dict[str, Any]]
    risk_analysis: List[Dict[str, Any]]
    
    explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SimulationHistoryResponse(BaseModel):
    simulations: List[SimulationReportResponse]
