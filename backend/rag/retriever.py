# backend/rag/retriever.py

import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import chromadb

# ----------------------------
# Chroma setup (NEW API)
# ----------------------------
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma")
os.makedirs(CHROMA_DIR, exist_ok=True)

# Try the new PersistentClient API
try:
    chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
except Exception:
    # Fallback for older versions
    chroma_client = chromadb.Client()

# Get or create vector collection
try:
    collection = chroma_client.get_or_create_collection(name="astrokosh_rag")
except Exception:
    collection = chroma_client.create_collection(name="astrokosh_rag")

# ----------------------------
# Embedding model
# ----------------------------
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embed_model = SentenceTransformer(EMBED_MODEL_NAME)


# ----------------------------
# Retrieval function
# ----------------------------
def retrieve_chunks(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Returns top-k vector search chunks with metadata + similarity score.
    """
    if not query:
        return []

    # Query embedding
    q_emb = embed_model.encode([query], convert_to_numpy=True).tolist()[0]

    results = collection.query(
        query_embeddings=[q_emb],
        n_results=top_k
    )

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0] if results.get("distances") else []

    chunks = []
    for doc, meta, dist in zip(docs, metas, dists):
        similarity = 1.0 - dist  # Convert distance → similarity (approx)
        chunks.append({
            "text": doc,
            "pdf_name": meta.get("pdf_name"),
            "page_number": meta.get("page_number"),
            "mission": meta.get("mission"),
            "doc_id": meta.get("doc_id"),
            "similarity": similarity
        })

    return chunks
