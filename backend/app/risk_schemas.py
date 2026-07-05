from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ContractFindingInput(BaseModel):
    vulnerability: str = Field(..., description="Name of vulnerability or static analyzer finding")
    severity: str = Field(..., description="Vulnerability severity: LOW, MEDIUM, HIGH, CRITICAL")
    description: str = Field(..., description="Description of the vulnerability finding")

class WalletIntelInput(BaseModel):
    wallet_score: int = Field(..., ge=0, le=100, description="Raw wallet reputation score from 0 (malicious) to 100 (clean)")
    behavior_flags: List[str] = Field(default=[], description="List of reputation flags: high_mixer_interaction, proxy_creator, etc.")

class ThreatIntelInput(BaseModel):
    severity: str = Field(..., description="Threat severity level: LOW, MEDIUM, HIGH, CRITICAL")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Threat intel feed confidence score from 0.0 to 1.0")
    threat_actor: Optional[str] = Field(None, description="Correlated threat actor name if known")
    campaign: Optional[str] = Field(None, description="Name of ongoing hack campaign if known")

class TransactionAnomalyInput(BaseModel):
    slippage: Optional[float] = Field(None, description="Transaction slippage rate percentage")
    anomaly_score: float = Field(..., ge=0.0, le=1.0, description="Calculated machine-learning anomaly deviation score")
    description: Optional[str] = Field(None, description="Description of the anomalous metric")

class BridgeActivityInput(BaseModel):
    volume_usd: float = Field(..., description="Dollar volume of bridge transfer")
    target_chain: str = Field(..., description="Name of target blockchain")
    frequency_24h: int = Field(..., description="Number of bridge transfers by this sender in the last 24 hours")

class EventAnalysisInput(BaseModel):
    upgrade_events_count: int = Field(..., description="Count of upgrade proxy calls seen in block telemetry")
    ownership_changes_count: int = Field(..., description="Count of ownership or key rotation changes")
    suspicious_events_count: int = Field(..., description="Count of other suspicious events or warnings")

class RiskAnalysisRequest(BaseModel):
    contract_findings: Optional[List[ContractFindingInput]] = Field(None, description="Array of smart contract auditor outputs")
    wallet_intelligence: Optional[WalletIntelInput] = Field(None, description="Reputation and behavioral flags details")
    threat_intelligence: Optional[ThreatIntelInput] = Field(None, description="Threat actors and feed correlation details")
    transaction_anomalies: Optional[List[TransactionAnomalyInput]] = Field(None, description="Execution parameters anomaly metrics")
    bridge_activity: Optional[BridgeActivityInput] = Field(None, description="Sender's cross-chain bridge telemetry")
    event_analysis: Optional[EventAnalysisInput] = Field(None, description="Deconstructed blockchain events activity counters")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional block/transaction context metadata")

class Subscores(BaseModel):
    contract_risk: float = Field(..., description="Calculated smart contract vulnerability risk from 0.0 to 100.0")
    wallet_risk: float = Field(..., description="Calculated wallet risk from 0.0 to 100.0")
    threat_risk: float = Field(..., description="Calculated threat database risk from 0.0 to 100.0")
    anomaly_risk: float = Field(..., description="Calculated execution anomaly risk from 0.0 to 100.0")
    bridge_risk: float = Field(..., description="Calculated cross-chain bridge risk from 0.0 to 100.0")
    event_risk: float = Field(..., description="Calculated timeline event risk from 0.0 to 100.0")

class RiskAnalysisResponse(BaseModel):
    success: bool
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Aggregated centralized risk score from 0.0 (clean) to 100.0 (highest threat)")
    severity: str = Field(..., description="Aggregated threat level: Low, Medium, High, Critical")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence level of inputs from 0.0 to 1.0")
    subscores: Subscores = Field(..., description="Individually calculated category risk subscores")
    reasoning: str = Field(..., description="Calculated correlation rationale explaining threat vectors")
    recommended_actions: List[str] = Field(default=[], description="Priority mitigation actions to defend against the threat")
