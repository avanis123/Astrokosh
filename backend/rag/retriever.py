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
    """Retrieve chunks with adaptive similarity threshold.
    
    Lower threshold for specific detail queries (phases, timelines, etc.)
    Higher threshold for general overview queries
    """
    
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
    
    # ✅ ADAPTIVE THRESHOLD: Lower for specific queries (phases, timeline, details)
    # Questions about phases need lower threshold because they're specific topics
    query_lower = query.lower()
    is_specific_detail = any(word in query_lower for word in ["phase", "timeline", "stage", "sequence", "step", "details"])
    
    # Use 0.18 for specific detail queries, 0.20 for general
    MIN_SIMILARITY = 0.18 if is_specific_detail else 0.20
    
    chunks = []
    filtered_out = []
    
    for text, meta, dist in zip(docs, metas, distances):
        similarity = 1 - dist
        
        chunk_info = {
            "text": text,
            "pdf_name": meta.get("pdf_name"),
            "page_number": meta.get("page_number"),
            "mission": meta.get("mission"),
            "similarity": similarity
        }
        
        if similarity < MIN_SIMILARITY:
            filtered_out.append({
                "similarity": similarity,
                "page": meta.get("page_number"),
                "pdf": meta.get("pdf_name")
            })
            continue
        
        chunks.append(chunk_info)
    
    # ✅ NEW: Log filtering activity
    total_retrieved = len(docs)
    filtered_count = len(filtered_out)
    
    if filtered_out:
        min_filtered_sim = min(c["similarity"] for c in filtered_out)
        print(f"ℹ️  Retriever: {total_retrieved} results → {len(chunks)} chunks (threshold: {MIN_SIMILARITY:.2f})")
        print(f"   Filtered: {filtered_count} below threshold")
        
        # Show details of filtered chunks
        if filtered_count > 0 and filtered_count <= 3:
            print(f"   Filtered chunks:")
            for i, fc in enumerate(filtered_out[:3], 1):
                print(f"     {i}. Similarity {fc['similarity']:.3f} - Page {fc['page']} (just below {MIN_SIMILARITY:.2f}!)")
        else:
            print(f"   Min filtered similarity: {min_filtered_sim:.3f}")
        
        if len(chunks) < 3 and filtered_out:
            print(f"   ⚠️  WARNING: Low chunk count ({len(chunks)})! Relevant chunks filtered out!")
            print(f"   ℹ️  Tip: Try lowering MIN_SIMILARITY further or increase top_k")
    else:
        print(f"ℹ️  Retriever: {total_retrieved} results → {len(chunks)} chunks (all passed threshold)")
    
    return chunks, {
        "total_retrieved": total_retrieved,
        "chunks_returned": len(chunks),
        "filtered_out": filtered_count,
        "min_passed_similarity": min((c["similarity"] for c in chunks), default=None),
        "min_filtered_similarity": min((c["similarity"] for c in filtered_out), default=None),
        "threshold": MIN_SIMILARITY
    }


def debug_chroma_count():
    return collection.count()
