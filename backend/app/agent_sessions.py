import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.future import select
from app.database import Base, AsyncSessionLocal
from app.agent_schemas import ChatMessage, SessionHistory, SessionSummary

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(String, primary_key=True, index=True)
    title = Column(String, default="New Investigation")
    messages = Column(JSON, default=list) # List of serialized ChatMessage dicts
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SessionManager:
    @staticmethod
    async def get_or_create_session(session_id: str, title: str = "New Investigation") -> ChatSession:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ChatSession).where(ChatSession.session_id == session_id)
            )
            db_session = result.scalars().first()
            if not db_session:
                db_session = ChatSession(
                    session_id=session_id,
                    title=title,
                    messages=[]
                )
                session.add(db_session)
                await session.commit()
                # Reload to get session bound or fresh attributes
                result = await session.execute(
                    select(ChatSession).where(ChatSession.session_id == session_id)
                )
                db_session = result.scalars().first()
            return db_session

    @staticmethod
    async def add_message(session_id: str, message: ChatMessage):
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ChatSession).where(ChatSession.session_id == session_id)
            )
            db_session = result.scalars().first()
            if db_session:
                # Convert ChatMessage to dict, ensuring datetime is serialized
                msg_dict = message.dict()
                msg_dict["created_at"] = msg_dict["created_at"].isoformat()
                
                # Check if first message is from user to update title
                current_messages = list(db_session.messages or [])
                if message.role == "user" and len(current_messages) == 0:
                    # Set title as first 40 chars of message
                    title = message.content[:40] + ("..." if len(message.content) > 40 else "")
                    db_session.title = title

                current_messages.append(msg_dict)
                db_session.messages = current_messages
                db_session.updated_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    async def get_history(session_id: str) -> Optional[SessionHistory]:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ChatSession).where(ChatSession.session_id == session_id)
            )
            db_session = result.scalars().first()
            if not db_session:
                return None
            
            messages = []
            for msg in (db_session.messages or []):
                created_at_dt = msg.get("created_at")
                if isinstance(created_at_dt, str):
                    created_at_dt = datetime.fromisoformat(created_at_dt)
                else:
                    created_at_dt = datetime.utcnow()
                
                messages.append(ChatMessage(
                    role=msg.get("role"),
                    content=msg.get("content"),
                    tool_calls=msg.get("tool_calls"),
                    tool_results=msg.get("tool_results"),
                    source_cards=msg.get("source_cards"),
                    created_at=created_at_dt
                ))
            
            return SessionHistory(
                session_id=db_session.session_id,
                messages=messages,
                created_at=db_session.created_at,
                updated_at=db_session.updated_at
            )

    @staticmethod
    async def list_sessions() -> List[SessionSummary]:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ChatSession).order_by(ChatSession.updated_at.desc())
            )
            db_sessions = result.scalars().all()
            return [
                SessionSummary(
                    session_id=s.session_id,
                    title=s.title,
                    created_at=s.created_at,
                    updated_at=s.updated_at
                )
                for s in db_sessions
            ]
