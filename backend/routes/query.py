from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from rag.retriever import retrieve_chunks
from rag.llm import generate_answer

router = APIRouter(prefix="/query", tags=["query"])


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
async def query(body: QueryRequest):

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    intent = detect_intent(question)
    section = INTENT_TO_SECTION.get(intent)

    # 🔍 Retrieve relevant chunks
    chunks = retrieve_chunks(
        question,
        top_k=body.top_k or 5,
        section=section
    )

    if not chunks:
        return QueryResponse(
            answer="Information not found in the provided documents.",
            chunks=[]
        )

    # 🧠 LLM synthesis (FINAL STEP)
    answer = generate_answer(
        question=question,
        context_chunks=chunks
    )

    return QueryResponse(
        answer=answer,
        chunks=[RetrievedChunk(**c) for c in chunks]
    )
