from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from rag.mongo_answers import answer_from_mongo

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


# ---------- Query Endpoint ----------

@router.post("/", response_model=QueryResponse)
async def rag_light_query(body: QueryRequest):

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

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


    mongo_answer = None
    if intent in FACTUAL_INTENTS:
        mongo_answer, _ = await answer_from_mongo(intent, question)

    # --------------------------------------------------
    # 2️⃣ EXPLANATION QUESTIONS → RAG + LLM
    # --------------------------------------------------
    section = INTENT_TO_SECTION.get(intent)
    top_k=body.top_k or 5
    if question_type in [
        "measurement", "numeric", "entity", "comparison"
    ]:
        top_k = 12
    chunks = []

    if multi_mission and missions_found:
        # Retrieve per mission (balanced context)
        for mission in missions_found:
            mission_chunks = retrieve_chunks(
                query=question,
                top_k=6,
                mission=mission
            )
            chunks.extend(mission_chunks)
    else:
        # Normal single-mission / global retrieval
        chunks = retrieve_chunks(
            query=question,
            top_k=top_k
        )
    if not chunks:
        return QueryResponse(
            answer="This information is not present in the uploaded mission documents.",
            chunks=[]
        )

    answer = generate_answer(
        question=question,
        context_chunks=chunks,
        structured_context=mongo_answer,
        question_type= question_type
    )

    return QueryResponse(
        answer=answer,
        chunks=[RetrievedChunk(**c) for c in chunks]
    )


@router.get("/debug/chroma-count")
def chroma_count():
    from rag.retriever import debug_chroma_count
    return {"chroma_chunks": debug_chroma_count()}
