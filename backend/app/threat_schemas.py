from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ThreatAnalysisRequest(BaseModel):
    indicator: str = Field(..., description="The indicator of compromise (IOC) to analyze: IP, domain, file hash, wallet, CVE, or raw text report")
    indicator_type: Optional[str] = Field(None, description="Optional indicator category: wallet, ip, domain, file_hash, cve, smart_contract, text")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional block/network supporting metadata")

class ThreatEntity(BaseModel):
    id: str = Field(..., description="Unique entity ID (e.g. ent-1)")
    name: str = Field(..., description="Entity name or moniker")
    type: str = Field(..., description="Entity type: indicator, threat_actor, campaign, exploit, malware, ransomware, cve, etc.")
    description: str = Field(..., description="Short explanation of the entity's relevance")
    source: str = Field(..., description="Source system: OpenCTI, MISP, MITRE ATT&CK, CVE, Exploit Database, etc.")

class ThreatRelationship(BaseModel):
    source_id: str = Field(..., description="Source entity ID")
    target_id: str = Field(..., description="Target entity ID")
    relationship_type: str = Field(..., description="Type of association: attributed-to, uses-exploit, targets, associated-with, dropped-by, etc.")
    description: str = Field(..., description="Brief details about the relationship")

class ThreatAnalysisResponse(BaseModel):
    success: bool
    indicator: str
    severity: str = Field(..., description="Assessed threat severity level: LOW, MEDIUM, HIGH, CRITICAL")
    confidence_score: float = Field(..., description="Calculated intelligence confidence score from 0.0 to 1.0")
    summary: str = Field(..., description="High-level correlation and campaign summary")
    entities: List[ThreatEntity] = Field(default=[], description="List of associated entities in the threat map")
    relationships: List[ThreatRelationship] = Field(default=[], description="List of directional relationships in the threat map")
    recommended_mitigation: str = Field(..., description="Proposed countermeasure or response protocol")
