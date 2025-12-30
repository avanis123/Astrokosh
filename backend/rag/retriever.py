# backend/rag/retriever.py
import os
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

CHROMA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "chroma")
)

chroma_client = chromadb.PersistentClient(
    path=CHROMA_PATH,
    settings=Settings(anonymized_telemetry=False)
)

collection = chroma_client.get_or_create_collection(
    name="astrokosh_rag",
    metadata={"hnsw:space": "cosine"}
)

embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def retrieve_chunks(query: str, top_k: int = 5, section: str = None, mission: str | None = None):
    query_embedding = embedding_model.encode([query]).tolist()[0]

    where = {}

    if section:
        where["section"] = section

    if mission:
        where["mission"] = mission

    if where:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where
        )
    else:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )


    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    MIN_SIMILARITY = 0.25   # 🔧 tweak if needed

    chunks = []
    for text, meta, dist in zip(docs, metas, distances):
        similarity = 1 - dist

        # ❌ skip weak matches
        if similarity < MIN_SIMILARITY:
            continue

        chunks.append({
            "text": text,
            "pdf_name": meta.get("pdf_name"),
            "page_number": meta.get("page_number"),
            "mission": meta.get("mission"),
            "similarity": similarity
        })

    return chunks


def debug_chroma_count():
    return collection.count()
