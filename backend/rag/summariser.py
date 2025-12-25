# backend/rag/summarizer.py

import re
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
import numpy as np

# Sentence transformer model (same MiniLM model)
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embed_model = SentenceTransformer(EMBED_MODEL_NAME)

SENTENCE_MIN_LEN = 20
MAX_SELECTED_SENTENCES = 5


# ---------------------------------------------------------
# 1. Sentence splitting
# ---------------------------------------------------------
def split_into_sentences(text: str) -> List[str]:
    if not text:
        return []

    # Replace newlines → space
    text = text.replace("\n", " ").strip()

    # Split on punctuation + space
    raw = re.split(r'(?<=[\.\?\!])\s+', text)

    sentences = []
    for r in raw:
        r = r.strip()
        if len(r) < SENTENCE_MIN_LEN:
            continue

        # Optional: further split on semicolon/colon if long
        parts = re.split(r'(?<=;|:)\s+', r)
        for p in parts:
            p = p.strip()
            if len(p) >= SENTENCE_MIN_LEN:
                sentences.append(p)

    return sentences


# ---------------------------------------------------------
# 2. Sentence similarity scorer
# ---------------------------------------------------------
def sentence_similarity(query: str, sentences: List[str]) -> List[float]:
    if not sentences:
        return []

    q_emb = embed_model.encode([query], convert_to_numpy=True)
    s_emb = embed_model.encode(sentences, convert_to_numpy=True)

    # Cosine similarity
    q_norm = q_emb / np.linalg.norm(q_emb, axis=1, keepdims=True)
    s_norm = s_emb / np.linalg.norm(s_emb, axis=1, keepdims=True)

    sims = (s_norm @ q_norm.T).squeeze()

    # Normalize to 0–1 instead of -1–1
    sims = ((sims + 1.0) / 2.0).tolist()

    return sims


# ---------------------------------------------------------
# 3. Main extractive summarization
# ---------------------------------------------------------
def extractive_summary(
    question: str,
    chunks: List[Dict[str, Any]],
    top_n_sentences: int = MAX_SELECTED_SENTENCES
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Returns:
      answer_text (str),
      selected_sentences (list of dicts)
    """

    # --------------------------
    # Step 1: Collect sentences
    # --------------------------
    candidates = []
    for c in chunks:
        sentences = split_into_sentences(c["text"])

        for s in sentences:
            candidates.append({
                "sentence": s,
                "pdf_name": c.get("pdf_name"),
                "page_number": c.get("page_number"),
                "chunk_similarity": c.get("similarity", 0.0),
            })

    if not candidates:
        return ("No relevant sentences found in documents.", [])

    sentences = [c["sentence"] for c in candidates]

    # --------------------------
    # Step 2: Sentence similarity
    # --------------------------
    sent_scores = sentence_similarity(question, sentences)

    # --------------------------
    # Step 3: Combine scores
    # --------------------------
    combined = []
    for i, cand in enumerate(candidates):
        sentence_sim = sent_scores[i]
        chunk_sim = cand["chunk_similarity"]

        # Weighted scoring
        score = (0.7 * sentence_sim) + (0.3 * chunk_sim)

        combined.append((score, cand))

    # Sort
    combined.sort(key=lambda x: x[0], reverse=True)

    # --------------------------
    # Step 4: Select best sentences
    # --------------------------
    selected = []
    used = set()

    for score, cand in combined:
        s = cand["sentence"]
        if s in used:
            continue
        used.add(s)

        selected.append({
            "sentence": s,
            "pdf_name": cand["pdf_name"],
            "page_number": cand["page_number"],
            "score": float(score)
        })
        if len(selected) >= top_n_sentences:
            break

    # --------------------------
    # Step 5: Build answer text
    # --------------------------
    bullet_list = "\n".join([f"• {s['sentence']}" for s in selected])

    final_answer = (
        "Based on the retrieved mission documents, here are the most relevant statements:\n\n"
        f"{bullet_list}\n\n"
        "(These sentences are extracted exactly as they appear in the PDFs.)"
    )

    return final_answer, selected
