from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
_model = None

def get_model():
    """Load model once and reuse."""
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def embed_texts(text_list: list):
    """Embed list of text chunks into vectors."""
    model = get_model()
    embeddings = model.encode(
        text_list,
        convert_to_numpy=True,
        show_progress_bar=True
    )
    return embeddings
