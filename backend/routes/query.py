from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import re
from rag.mongo_answers import answer_from_mongo
from rag.conversation_manager import ConversationManager

from rag.retriever import retrieve_chunks
from rag.llm import generate_answer
from utils.question_classifier import classify_question
from utils.mission_extractor import extract_missions_from_question
from database import db
from utils.query_scope import is_multi_mission_question


router = APIRouter(prefix="/query", tags=["query"])

FACTUAL_INTENTS = {
    "PAYLOAD",          # instruments
    "MISSION_PHASES",
    "LAUNCH",
    "TABLES",
    "OBSERVATIONS",
}

EXPLANATION_INTENTS = {
    "OBJECTIVES",
    "RESULTS",
    "GENERAL",
}

# ---------- Models ----------

class QueryRequest(BaseModel):
    question: str
    session_id: str
    top_k: Optional[int] = 5


class RetrievedChunk(BaseModel):
    text: str
    pdf_name: Optional[str]
    page_number: Optional[int]
    mission: Optional[str]
    similarity: Optional[float]


class QueryResponse(BaseModel):
    answer: str
    chunks: List[RetrievedChunk]


# ---------- Intent Detection ----------

def detect_intent(question: str) -> str:
    q = question.lower()

    if any(k in q for k in ["objective", "aim", "purpose", "goal"]):
        return "OBJECTIVES"

    if any(k in q for k in ["payload", "instrument", "spectrometer", "camera"]):
        return "PAYLOAD"

    if any(k in q for k in ["result", "finding", "discovery", "science"]):
        return "RESULTS"

    return "GENERAL"


INTENT_TO_SECTION = {
    "OBJECTIVES": "OBJECTIVES",
    "PAYLOAD": "PAYLOADS",
    "RESULTS": "SCIENCE_RESULTS",
}


# ---------- Context Expansion Functions ----------

def _extract_missions_from_history(history: List[Dict]) -> List[str]:
    """Extract mission names mentioned in conversation history."""
    missions = []
    mission_keywords = ["chandrayaan", "aditya", "isro", "insat", "cartosat", "ors", "risat"]
    
    for msg in history:
        content = msg["content"].lower()
        for mission in mission_keywords:
            if mission in content and mission not in missions:
                missions.append(mission)
    
    return missions


def _resolve_pronouns(question: str, history: List[Dict]) -> str:
    """
    Resolve pronouns like 'it', 'its', 'that' to actual entities from history.
    Example: "What are its objectives?" → "What are Chandrayaan-2's objectives?"
    """
    if not history or len(history) < 2:
        return question
    
    question_lower = question.lower()
    
    # Check if question contains pronouns
    pronouns = ["it", "its", "it's", "that", "this mission", "that mission"]
    has_pronoun = any(f" {p} " in f" {question_lower} " or f" {p}?" in question_lower 
                      for p in pronouns)
    
    if not has_pronoun:
        return question
    
    # Extract missions from history
    missions_in_history = _extract_missions_from_history(history)
    
    if not missions_in_history:
        return question
    
    # Get the most recent mission mentioned
    recent_mission = missions_in_history[-1]
    
    # Replace pronouns with mission name
    resolved = question
    resolved = re.sub(r'\bit\b', recent_mission, resolved, flags=re.IGNORECASE)
    resolved = re.sub(r'\bits\b', f"{recent_mission}'s", resolved, flags=re.IGNORECASE)
    resolved = re.sub(r"\bit's\b", f"{recent_mission} is", resolved, flags=re.IGNORECASE)
    resolved = re.sub(r'\bthis mission\b', recent_mission, resolved, flags=re.IGNORECASE)
    resolved = re.sub(r'\bthat mission\b', recent_mission, resolved, flags=re.IGNORECASE)
    
    return resolved


def _expand_query_with_context(question: str, history: List[Dict]) -> str:
    """
    Expand query with conversation context.
    
    This solves the issue where "what are its objectives" loses mission context
    and returns "information not found", while "what are the objectives of Chandrayaan-2?"
    works correctly.
    
    Process:
    1. Resolve pronouns (it → Chandrayaan-2)
    2. Add mission context if missing
    3. Return expanded query for better retrieval
    """
    if not history:
        return question
    
    # Step 1: Resolve pronouns
    resolved = _resolve_pronouns(question, history)
    
    # Step 2: Check if question has mission context
    missions_in_question = ["chandrayaan", "aditya", "isro", "insat", "cartosat", "ors", "risat"]
    has_mission = any(m in resolved.lower() for m in missions_in_question)
    
    # If no mission in question, try to extract from history
    if not has_mission:
        recent_missions = _extract_missions_from_history(history)
        if recent_missions:
            mission = recent_missions[-1]
            # Only add context if question is short/vague
            if len(question.split()) <= 7:
                resolved = f"{mission}. {resolved}"
                return resolved
    
    return resolved


# ---------- Query Endpoint ----------

@router.post("/", response_model=QueryResponse)
async def rag_light_query(body: QueryRequest):

    question = body.question.strip()
    session_id = body.session_id.strip()
    
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")

    # Initialize session and get conversation history
    await ConversationManager.initialize_session(session_id)
    conversation_history = await ConversationManager.get_conversation_history(session_id, limit=6)

    intent = detect_intent(question)
    question_type = classify_question(question)
    multi_mission = is_multi_mission_question(question)

    missions_found = []

    if multi_mission:
        all_missions = await db.documents.distinct("mission")
        missions_found = extract_missions_from_question(
            question,
            all_missions
        )

    # ✅ NEW: Expand query with conversation context
    # This fixes the issue where "what are its objectives" loses mission context
    expanded_question = _expand_query_with_context(question, conversation_history)
    if expanded_question != question:
        print(f"📝 Context expansion: '{question}' → '{expanded_question[:80]}'")

    mongo_answer = None
    if intent in FACTUAL_INTENTS:
        mongo_answer, _ = await answer_from_mongo(intent, expanded_question)

    section = INTENT_TO_SECTION.get(intent)
    top_k=body.top_k or 5
    if question_type in [
        "measurement", "numeric", "entity", "comparison"
    ]:
        top_k = 12
    chunks = []
    retrieval_debug = {}

    if multi_mission and missions_found:
        # Retrieve per mission (balanced context)
        for mission in missions_found:
            mission_chunks, _ = retrieve_chunks(
                query=expanded_question,
                top_k=6,
                mission=mission
            )
            chunks.extend(mission_chunks)
    else:
        # Normal single-mission / global retrieval
        chunks, retrieval_debug = retrieve_chunks(
            query=expanded_question,
            top_k=top_k
        )

    confidence_flags = {
        "low_chunks": len(chunks) < 3,
        "filtered_chunks": retrieval_debug.get("filtered_out", 0) > 0,
        "low_similarity": retrieval_debug.get("min_passed_similarity", 1.0) < 0.30,
    }

    if chunks and retrieval_debug:
        print(f"📊 Retrieval stats: {retrieval_debug}")
        if retrieval_debug.get('filtered_out', 0) > 0:
            print(f"   Consider: top_k adjustment or MIN_SIMILARITY tuning")
    if not chunks:
        answer = "This information is not present in the uploaded mission documents."
        confidence=0.0

    elif any(confidence_flags.values()):
        # Low confidence - try MongoDB first
        mongo_answer, mongo_confidence = await answer_from_mongo(intent, question)
        
        if mongo_answer and mongo_confidence > 0.7:
            answer = mongo_answer
            confidence = mongo_confidence
            print(f"✅ Using MongoDB answer (confidence: {confidence:.2f})")
        else:
            # Still use chunks but mark as uncertain
            answer = generate_answer(
                question=question,
                context_chunks=chunks,
                structured_context=mongo_answer,
                question_type=question_type,
                conversation_history=conversation_history
            )
            confidence = 0.5  # Medium confidence due to low chunks
            answer = f"⚠️ LOW CONFIDENCE: {answer}\n[Based on {len(chunks)} partial matches]"
    else:
        answer = generate_answer(
            question=question,
            context_chunks=chunks,
            structured_context=mongo_answer,
            question_type=question_type,
            conversation_history=conversation_history
        )
        confidence = min(0.95, 0.6 + (len(chunks) * 0.1))

    # Store user question and assistant answer in history
    await ConversationManager.add_message(session_id, "user", question)
    await ConversationManager.add_message(session_id, "assistant", answer)

    return QueryResponse(
        answer=answer,
        chunks=[RetrievedChunk(**c) for c in chunks] if chunks else []
    )
