# backend/rag/indexer.py
import os
from typing import List, Dict, Any

from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from rag.chunking import chunk_text
from rag.section_detector import detect_section_from_text

load_dotenv()

# ---- Embedding model (MiniLM) ----
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# ---- ChromaDB client (persistent, local) ----
CHROMA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "chroma")
)
os.makedirs(CHROMA_PATH, exist_ok=True)

chroma_client = chromadb.PersistentClient(
    path=CHROMA_PATH,
    settings=Settings(anonymized_telemetry=False)
)

collection = chroma_client.get_or_create_collection(
    name="astrokosh_rag",
    metadata={"hnsw:space": "cosine"}
)

# ---- MongoDB ----
MONGO_URL = os.getenv("MONGODB_URL")
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client["astrokosh"]

async def index_single_document(doc_id: str) -> Dict[str, Any]:

    doc = await db.documents.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        return {"status": "error", "message": "Document not found"}

    pages = doc.get("pages", [])
    mission = doc.get("mission", "Unknown")
    file_name = doc.get("file_name", "Unknown")

    texts: List[str] = []
    ids: List[str] = []
    metadatas: List[Dict[str, Any]] = []


    for page in pages:
        page_text = page.get("text", "")
        page_number = page.get("page_number")

        if not page_text:
            continue

        # ✅ Detect section for the whole page
        section_name = detect_section_from_text(page_text)


        # ✅ Chunk the page text
        chunks = chunk_text(page_text)

        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_p{page_number}_{section_name}_c{i}"

            texts.append(chunk)
            ids.append(chunk_id)
            metadatas.append({
                "doc_id": doc_id,
                "pdf_name": file_name,
                "page_number": page_number,
                "mission": mission,
                "section": section_name,   # ⭐ CRITICAL
            })


    if not texts:
        return {"status": "skipped", "reason": "no text chunks"}

    embeddings = embedding_model.encode(texts).tolist()

    collection.add(
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
        ids=ids,
    )


    return {"status": "indexed", "chunks": len(texts)}

async def index_all_documents() -> dict:
    """
    Rebuilds the entire Chroma index from MongoDB.
    Safe to run multiple times.
    """
    cursor = db.documents.find({})
    count = 0

    async for doc in cursor:
        await index_single_document(str(doc["_id"]))
        count += 1

    return {
        "status": "full_index_done",
        "documents_indexed": count
    }
