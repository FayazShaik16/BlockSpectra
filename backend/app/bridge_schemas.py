from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class BridgeAnalysisRequest(BaseModel):
    bridge_protocol: str = Field(..., description="Bridge protocol: layerzero, wormhole, across, stargate, hop, native")
    source_chain: str = Field(..., description="Source blockchain: ethereum, polygon, arbitrum, optimism, bsc, avalanche, solana, etc.")
    destination_chain: str = Field(..., description="Destination blockchain")
    sender_address: str = Field(..., description="Sender wallet address initiating the bridge transfer")
    amount_usd: float = Field(..., description="Dollar value of the bridge transfer")
    token: Optional[str] = Field(None, description="Token symbol or contract address being bridged")
    tx_hash: Optional[str] = Field(None, description="Transaction hash of the bridge initiation")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional supporting metadata (block number, gas, etc.)")

class BridgeFlow(BaseModel):
    id: str = Field(..., description="Unique flow identifier")
    source_chain: str = Field(..., description="Origin chain of the flow")
    destination_chain: str = Field(..., description="Destination chain of the flow")
    protocol: str = Field(..., description="Bridge protocol used")
    sender: str = Field(..., description="Sender address")
    receiver: str = Field(..., description="Receiver address on destination chain")
    amount_usd: float = Field(..., description="Dollar value of the transfer")
    token: str = Field(..., description="Token symbol")
    status: str = Field(..., description="Flow status: COMPLETED, PENDING, FAILED, SUSPICIOUS")
    timestamp: str = Field(..., description="ISO timestamp of the transfer")

class CrossChainPathWaypoint(BaseModel):
    chain: str = Field(..., description="Chain name at this waypoint")
    address: str = Field(..., description="Contract or wallet address")
    protocol: str = Field(..., description="Protocol used at this hop (bridge name or DEX)")
    action: str = Field(..., description="Action taken: BRIDGE, SWAP, TRANSFER, DEPOSIT, WITHDRAW")

class CrossChainPath(BaseModel):
    id: str = Field(..., description="Unique path identifier")
    description: str = Field(..., description="Human-readable path description")
    waypoints: List[CrossChainPathWaypoint] = Field(default=[], description="Ordered list of waypoints in the cross-chain path")
    total_hops: int = Field(..., description="Number of hops in the path")
    risk_level: str = Field(..., description="Path risk level: LOW, MEDIUM, HIGH, CRITICAL")

class BridgeAnomaly(BaseModel):
    id: str = Field(..., description="Unique anomaly identifier")
    type: str = Field(..., description="Anomaly type: LARGE_TRANSFER, RAPID_BRIDGING, CIRCULAR_FLOW, SPLIT_TRANSFER, UNKNOWN_RECEIVER, PROTOCOL_MISMATCH")
    severity: str = Field(..., description="Anomaly severity: LOW, MEDIUM, HIGH, CRITICAL")
    title: str = Field(..., description="Short anomaly title")
    description: str = Field(..., description="Detailed anomaly explanation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence from 0.0 to 1.0")

class BridgeExploit(BaseModel):
    id: str = Field(..., description="Unique exploit reference identifier")
    name: str = Field(..., description="Exploit name or CVE identifier")
    affected_bridge: str = Field(..., description="Bridge protocol affected")
    date: str = Field(..., description="Date of the exploit (ISO or YYYY-MM-DD)")
    impact_usd: float = Field(..., description="Dollar value of funds lost")
    description: str = Field(..., description="Summary of the exploit mechanism")
    relevance: str = Field(..., description="How this exploit relates to the current analysis: DIRECT, PATTERN_MATCH, PROTOCOL_HISTORY, INFORMATIONAL")

class MoneyFlowNode(BaseModel):
    id: str = Field(..., description="Unique node identifier for ReactFlow")
    label: str = Field(..., description="Display label for the node")
    chain: str = Field(..., description="Blockchain this node belongs to")
    node_type: str = Field(..., description="Node type: WALLET, BRIDGE_CONTRACT, DEX, MIXER, UNKNOWN")
    risk_level: str = Field(default="LOW", description="Node risk level: LOW, MEDIUM, HIGH, CRITICAL")

class MoneyFlowEdge(BaseModel):
    id: str = Field(..., description="Unique edge identifier for ReactFlow")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    amount_usd: float = Field(..., description="Dollar value flowing through this edge")
    protocol: str = Field(..., description="Protocol used for this transfer")
    label: str = Field(default="", description="Edge label for display")

class BridgeAnalysisResponse(BaseModel):
    success: bool
    bridge_protocol: str = Field(..., description="Analyzed bridge protocol")
    source_chain: str = Field(..., description="Source chain analyzed")
    destination_chain: str = Field(..., description="Destination chain analyzed")
    bridge_risk_score: float = Field(..., ge=0.0, le=100.0, description="Calculated bridge risk score from 0.0 (safe) to 100.0 (critical)")
    risk_level: str = Field(..., description="Risk level: LOW, MEDIUM, HIGH, CRITICAL")
    summary: str = Field(..., description="Human-readable analysis summary")
    flows: List[BridgeFlow] = Field(default=[], description="Detected bridge transfer flows")
    cross_chain_paths: List[CrossChainPath] = Field(default=[], description="Reconstructed cross-chain transfer paths")
    anomalies: List[BridgeAnomaly] = Field(default=[], description="Detected anomalous patterns")
    known_exploits: List[BridgeExploit] = Field(default=[], description="Relevant known bridge exploit references")
    money_flow_nodes: List[MoneyFlowNode] = Field(default=[], description="Nodes for money flow diagram visualization")
    money_flow_edges: List[MoneyFlowEdge] = Field(default=[], description="Edges for money flow diagram visualization")
    attack_paths: List[str] = Field(default=[], description="Potential attack vector descriptions")
    recommended_actions: List[str] = Field(default=[], description="Recommended mitigation actions")
