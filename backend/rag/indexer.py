# backend/rag/indexer.py

import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import chromadb
from bson import ObjectId
from dotenv import load_dotenv
from database import db  # your MongoDB connection

load_dotenv()

# ----------------------------
# Configuration
# ----------------------------
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# ----------------------------
# Embedding model
# ----------------------------
embed_model = SentenceTransformer(EMBED_MODEL_NAME)

# ----------------------------
# Chroma setup (NEW API)
# ----------------------------
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma")
os.makedirs(CHROMA_DIR, exist_ok=True)

try:
    chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
except Exception:
    chroma_client = chromadb.Client()

try:
    collection = chroma_client.get_or_create_collection(name="astrokosh_rag")
except Exception:
    collection = chroma_client.create_collection(name="astrokosh_rag")


# ----------------------------
# Helpers
# ----------------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Simple sliding-window chunking."""
    text = text or ""
    text = text.strip()
    if not text:
        return []

    chunks = []
    start = 0
    L = len(text)

    while start < L:
        end = min(start + chunk_size, L)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end == L:
            break

        start = max(0, end - overlap)

    return chunks


# ----------------------------
# Indexing a single document
# ----------------------------
async def index_single_document(doc_id: str) -> Dict[str, Any]:
    """Index one MongoDB document into Chroma."""
    doc = await db.documents.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        return {"status": "error", "message": "document not found"}

    pages = doc.get("pages", [])
    mission = doc.get("mission", "Unknown")
    file_name = doc.get("file_name", "Unknown")

    texts = []
    ids = []
    meta = []

    for page in pages:
        page_number = page.get("page_number")
        page_text = page.get("text", "")

        chunks = chunk_text(page_text)

        for i, c in enumerate(chunks):
            chunk_id = f"{doc_id}_p{page_number}_c{i}"
            ids.append(chunk_id)
            texts.append(c)
            meta.append({
                "doc_id": str(doc_id),
                "pdf_name": file_name,
                "page_number": page_number,
                "mission": mission
            })

    if not texts:
        return {"status": "no_chunks", "message": "no text extracted"}

    # embeddings → lists
    embeddings = embed_model.encode(texts, convert_to_numpy=True).tolist()

    collection.add(
        ids=ids,
        documents=texts,
        metadatas=meta,
        embeddings=embeddings
    )

    try:
        chroma_client.persist()  # works for PersistentClient
    except:
        pass

    return {"status": "indexed", "chunks": len(texts)}


# ----------------------------
# Index all documents (optional)
# ----------------------------
async def index_all_documents():
    """Bulk index everything in documents collection."""
    count = 0
    async for doc in db.documents.find({}):
        await index_single_document(str(doc["_id"]))
        count += 1
    return {"indexed_documents": count}
