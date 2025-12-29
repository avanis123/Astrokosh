from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from rag.mongo_answers import answer_from_mongo

from rag.retriever import retrieve_chunks
from rag.llm import generate_answer

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

    # --------------------------------------------------
    # 1️⃣ FACTUAL QUESTIONS → MONGO
    # --------------------------------------------------
    mongo_answer = None
    if intent in FACTUAL_INTENTS:
        mongo_answer, _ = await answer_from_mongo(intent, question)

        return QueryResponse(
            answer=mongo_answer,
            chunks=[]
        )

    # --------------------------------------------------
    # 2️⃣ EXPLANATION QUESTIONS → RAG + LLM
    # --------------------------------------------------
    section = INTENT_TO_SECTION.get(intent)
    chunks = retrieve_chunks(
        query=question,
        top_k=body.top_k or 5,
        section=section
    )
    if not chunks:
        return QueryResponse(
            answer="This information is not present in the uploaded mission documents.",
            chunks=[]
        )

    answer = generate_answer(
        question=question,
        context_chunks=chunks,
        structured_context=mongo_answer
    )

    return QueryResponse(
        answer=answer,
        chunks=[RetrievedChunk(**c) for c in chunks]
    )


@router.get("/debug/chroma-count")
def chroma_count():
    from rag.retriever import debug_chroma_count
    return {"chroma_chunks": debug_chroma_count()}
