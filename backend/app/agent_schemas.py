from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class SourceCard(BaseModel):
    tool_name: str = Field(..., description="Name of the tool that generated this card")
    summary: str = Field(..., description="Human-readable summary of findings")
    data: Dict[str, Any] = Field(..., description="Raw data JSON returned by the tool")
    severity: str = Field("INFO", description="Severity level: INFO, LOW, MEDIUM, HIGH, CRITICAL")
    chain: Optional[str] = Field(None, description="Blockchain network associated with this card")

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: user, assistant, system, tool")
    content: str = Field(..., description="Text content of the message")
    tool_calls: Optional[List[Dict[str, Any]]] = Field(None, description="Native OpenAI/OpenRouter style tool calls")
    tool_results: Optional[List[Dict[str, Any]]] = Field(None, description="Results of tool executions")
    source_cards: Optional[List[SourceCard]] = Field(None, description="Interactive UI source cards")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Existing session ID, or null to create a new one")
    message: str = Field(..., description="User message query")
    chain_context: Optional[str] = Field(None, description="Optional chain context: ethereum, solana, sui, aptos, bitcoin, tron")

class ChatResponse(BaseModel):
    session_id: str = Field(..., description="Session ID")
    message: str = Field(..., description="Final text answer")
    source_cards: List[SourceCard] = Field(default=[], description="List of source cards generated during investigation")
    citations: List[str] = Field(default=[], description="Citations and references to tools")
    reasoning_steps: List[str] = Field(default=[], description="List of reasoning/thought steps during tool execution")

class SessionSummary(BaseModel):
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime

class SessionHistory(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
