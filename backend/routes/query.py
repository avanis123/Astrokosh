# backend/routes/query.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from rag.retriever import retrieve_chunks
from rag.summariser import extractive_summary


router = APIRouter(prefix="/query", tags=["Query"])


# --------------------------
# Request/Response Models
# --------------------------
class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5
    top_sentences: Optional[int] = 4


class RetrievedChunk(BaseModel):
    text: str
    pdf_name: Optional[str]
    page_number: Optional[int]
    mission: Optional[str]
    similarity: Optional[float]


class QueryResponse(BaseModel):
    answer: str
    citations: List[Dict[str, Any]]
    chunks: List[RetrievedChunk]


# --------------------------
# POST /query
# --------------------------
@router.post("/", response_model=QueryResponse)
async def rag_query(body: QueryRequest):

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1) Retrieve top-k chunks
    chunks = retrieve_chunks(question, top_k=body.top_k)
    if not chunks:
        return QueryResponse(answer="No matching documents found.", citations=[], chunks=[])

    # 2) Summarize extractively
    answer_text, selected_sentences = extractive_summary(
        question,
        chunks,
        top_n_sentences=body.top_sentences
    )

    # 3) Build citation list (unique)
    citations = []
    seen = set()

    for s in selected_sentences:
        key = f"{s['pdf_name']}|{s['page_number']}"
        if key not in seen:
            seen.add(key)
            citations.append({
                "pdf_name": s["pdf_name"],
                "page_number": s["page_number"]
            })

    # 4) Build response
    return QueryResponse(
        answer=answer_text,
        citations=citations,
        chunks=[RetrievedChunk(**c) for c in chunks]
    )
