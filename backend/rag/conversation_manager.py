"""
Manages conversation history for multi-turn chat sessions.
Stores conversations in MongoDB to maintain context across sessions.
"""

from datetime import datetime
from typing import List, Dict, Optional
from database import db


class ConversationManager:
    """Handles storing and retrieving conversation history."""
    
    @staticmethod
    async def initialize_session(session_id: str) -> Dict:
        """Create a new session if it doesn't exist."""
        existing = await db.conversations.find_one({"_id": session_id})
        
        if existing:
            return existing
        
        session = {
            "_id": session_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "messages": []
        }
        
        await db.conversations.insert_one(session)
        return session
    
    @staticmethod
    async def add_message(session_id: str, role: str, content: str, metadata: Dict = None) -> None:
        """Add a message to the conversation history."""
        message = {
            "role": role,  # "user" or "assistant"
            "content": content,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {}
        }
        
        await db.conversations.update_one(
            {"_id": session_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    @staticmethod
    async def get_conversation_history(session_id: str, limit: int = 10) -> List[Dict]:
        """
        Get recent conversation history.
        
        Args:
            session_id: The session ID
            limit: Maximum number of messages to retrieve (most recent)
        
        Returns:
            List of messages with role and content
        """
        session = await db.conversations.find_one({"_id": session_id})
        
        if not session or not session.get("messages"):
            return []
        
        # Get last 'limit' messages
        messages = session["messages"][-limit:]
        
        return [
            {
                "role": msg["role"],
                "content": msg["content"]
            }
            for msg in messages
        ]
    
    @staticmethod
    async def format_for_context(history: List[Dict]) -> str:
        """
        Format conversation history for LLM context.
        
        Returns a formatted string of previous conversation.
        """
        if not history:
            return ""
        
        formatted = "\n\nConversation Context (Previous Messages):\n"
        formatted += "=" * 50 + "\n"
        
        for msg in history:
            role = msg["role"].upper()
            content = msg["content"][:500]  # Truncate long messages
            formatted += f"{role}: {content}\n"
        
        formatted += "=" * 50 + "\n"
        
        return formatted
    
    @staticmethod
    async def clear_session(session_id: str) -> None:
        """Clear conversation history for a session."""
        await db.conversations.delete_one({"_id": session_id})
