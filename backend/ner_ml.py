import spacy
from transformers import AutoTokenizer, AutoModel

# Load spaCy small model
nlp = spacy.load("en_core_web_sm")

# Load SciBERT for scientific embeddings
tokenizer = AutoTokenizer.from_pretrained("allenai/scibert_scivocab_uncased")
model = AutoModel.from_pretrained("allenai/scibert_scivocab_uncased")


def extract_spacy_entities(text):
    doc = nlp(text)
    ents = []
    for ent in doc.ents:
        ents.append({"text": ent.text, "label": ent.label_})
    return ents
