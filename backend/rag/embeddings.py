from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """
    Load the MiniLM model once and reuse it.
    """
    return SentenceTransformer(MODEL_NAME)

def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    # Convert to Python lists for Chroma
    return model.encode(texts, convert_to_numpy=False).tolist()

def embed_text(text: str) -> List[float]:
    return embed_texts([text])[0]
