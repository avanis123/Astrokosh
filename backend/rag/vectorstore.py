import os
from typing import Any, Dict, List

import chromadb
from chromadb.config import Settings

from .embeddings import embed_texts

# Store Chroma files under backend/data/chroma
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "chroma")
COLLECTION_NAME = "mission_chunks"

class MiniLMEmbeddingFunction:
    """
    Custom embedding function so Chroma uses OUR MiniLM instead of its default.
    """
    def __call__(self, inputs: List[str]) -> List[List[float]]:
        return embed_texts(inputs)

def get_chroma_client() -> chromadb.PersistentClient:
    os.makedirs(CHROMA_PATH, exist_ok=True)
    client = chromadb.PersistentClient(
        path=CHROMA_PATH,
        settings=Settings(anonymized_telemetry=False)
    )
    return client

def get_collection():
    client = get_chroma_client()
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=MiniLMEmbeddingFunction()
    )
    return collection

def add_documents(
    texts: List[str],
    metadatas: List[Dict[str, Any]],
    ids: List[str]
) -> None:
    if not texts:
        return
    collection = get_collection()
    collection.add(
        documents=texts,
        metadatas=metadatas,
        ids=ids,
    )

def query_documents(
    query: str,
    n_results: int = 5
) -> Dict[str, Any]:
    collection = get_collection()
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
    )
    return results
