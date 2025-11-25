import spacy
from transformers import AutoModel, AutoTokenizer

# Load spaCy at startup (tiny model, safe)
nlp = spacy.load("en_core_web_sm")

# SciBERT lazy-load variables
_scibert_model = None
_scibert_tokenizer = None

def get_scibert():
    """
    Loads SciBERT only the FIRST time it's called.
    This prevents server from freezing at startup.
    """
    global _scibert_model, _scibert_tokenizer

    if _scibert_model is None:
        print("🔥 Loading SciBERT (this will run ONLY once)...")
        _scibert_tokenizer = AutoTokenizer.from_pretrained("allenai/scibert_scivocab_uncased")
        _scibert_model = AutoModel.from_pretrained("allenai/scibert_scivocab_uncased")

    return _scibert_model, _scibert_tokenizer


def extract_spacy_entities(text):
    """
    Your basic spaCy entity extractor.
    """
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]


def extract_scibert_embeddings(text_list):
    """
    Convert text pages to SciBERT embeddings.
    Called ON DEMAND, not at server startup.
    """
    model, tokenizer = get_scibert()
    inputs = tokenizer(text_list, return_tensors="pt", padding=True, truncation=True)
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy().tolist()
