# Implementation Guide: Fixing RAG Issues

## Quick Start: Apply These Fixes Now

### Fix 1: Add Debugging & Logging to Retriever (5 min) ✅

**File**: `backend/rag/retriever.py`

Replace the retrieval function to log filtering:

```python
def retrieve_chunks(query: str, top_k: int = 5, section: str = None, mission: str | None = None):
    """Retrieve chunks with detailed logging."""
    
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
    
    MIN_SIMILARITY = 0.25
    
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
        print(f"ℹ️  Retriever: {total_retrieved} results → {len(chunks)} chunks")
        print(f"   Filtered: {filtered_count} below threshold (min similarity: {min_filtered_sim:.3f})")
        if len(chunks) < 2 and filtered_out:
            print(f"   ⚠️  WARNING: Low chunk count! Consider lowering MIN_SIMILARITY threshold")
    
    return chunks, {
        "total_retrieved": total_retrieved,
        "chunks_returned": len(chunks),
        "filtered_out": filtered_count,
        "min_passed_similarity": min((c["similarity"] for c in chunks), default=None),
        "min_filtered_similarity": min((c["similarity"] for c in filtered_out), default=None)
    }


def debug_chroma_count():
    return collection.count()
```

**Update query.py to use debug info**:

```python
# In routes/query.py, around line 110:
chunks, retrieval_debug = retrieve_chunks(
    query=question,
    top_k=top_k
)

if chunks:
    print(f"📊 Retrieval stats: {retrieval_debug}")
    if retrieval_debug['filtered_out'] > 0:
        print(f"   Consider: top_k adjustment or MIN_SIMILARITY tuning")
```

---

### Fix 2: Improve Missing Answer Detection (10 min) ✅

**File**: `backend/routes/query.py`

Add confidence scoring:

```python
@router.post("/", response_model=QueryResponse)
async def rag_light_query(body: QueryRequest):
    # ... existing code ...
    
    chunks, retrieval_debug = retrieve_chunks(query=question, top_k=top_k)
    
    # ✅ NEW: Handle low-confidence scenarios
    confidence_flags = {
        "low_chunks": len(chunks) < 3,
        "filtered_chunks": retrieval_debug.get("filtered_out", 0) > 0,
        "low_similarity": retrieval_debug.get("min_passed_similarity", 1.0) < 0.30,
    }
    
    if not chunks:
        answer = "This information is not present in the uploaded mission documents."
        confidence = 0.0
    elif any(confidence_flags.values()):
        # Low confidence - try MongoDB first
        mongo_answer, mongo_confidence = await answer_from_mongo(intent, question)
        
        if mongo_answer and mongo_confidence > 0.7:
            answer = mongo_answer
            confidence = mongo_confidence
            print(f"✅ Using MongoDB answer (confidence: {confidence:.2f})")
        else:
            # Still use chunks but mark as uncertain
            answer = generate_answer(
                question=question,
                context_chunks=chunks,
                structured_context=mongo_answer,
                question_type=question_type,
                conversation_history=conversation_history
            )
            confidence = 0.5  # Medium confidence due to low chunks
            answer = f"⚠️ LOW CONFIDENCE: {answer}\n[Based on {len(chunks)} partial matches]"
    else:
        answer = generate_answer(
            question=question,
            context_chunks=chunks,
            structured_context=mongo_answer,
            question_type=question_type,
            conversation_history=conversation_history
        )
        confidence = min(0.95, 0.6 + (len(chunks) * 0.1))  # Higher with more chunks
    
    # ... rest of function ...
```

---

### Fix 3: Fix Text Extraction Fallback (15 min) ✅

**File**: `backend/extractor.py`

Update extraction to use OCR fallback:

```python
def extract_text(pdf_path: str) -> List[str]:
    """
    Extract text with OCR fallback for scanned PDFs.
    First tries PyMuPDF (fast), then falls back to OCR if needed.
    """
    import pdfplumber
    
    pages = []
    
    # Step 1: Try PyMuPDF extraction
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text = page.get_text("text")
                text = text.strip() if text else ""
                pages.append(text)
    except Exception as e:
        print(f"❌ PyMuPDF extraction failed: {e}")
        pages = []
    
    # Step 2: Check if extraction was successful
    if not pages:
        print("⚠️  PyMuPDF returned no pages, checking for scanned PDF...")
        non_empty_pages = sum(1 for p in pages if len(p.strip()) > 20)
    else:
        non_empty_pages = sum(1 for p in pages if len(p.strip()) > 20)
    
    # Step 3: If <40% of pages have meaningful text, try OCR
    total_pages = len(pages)
    if total_pages == 0 or non_empty_pages < max(1, total_pages * 0.4):
        print(f"⚠️  Only {non_empty_pages}/{total_pages} pages have text (scanned PDF detected)")
        print("🔄 Attempting OCR extraction...")
        
        try:
            ocr_pages = extract_text_ocr(pdf_path)
            if ocr_pages and sum(1 for p in ocr_pages if len(p.strip()) > 20) > non_empty_pages:
                print(f"✅ OCR successful: {len(ocr_pages)} pages extracted")
                return ocr_pages
        except Exception as e:
            print(f"❌ OCR failed: {e}")
    
    # Step 4: Return best effort
    if not pages:
        print("❌ Could not extract text from PDF")
        return []
    
    print(f"✅ Extracted {total_pages} pages ({non_empty_pages} with content)")
    return pages
```

---

### Fix 4: Add Adaptive Chunk Size Testing (Optional, for later)

**Create**: `backend/test_chunking.py`

```python
"""Test optimal chunk sizes on your mission PDFs."""

from rag.chunking import chunk_text
from rag.retriever import retrieve_chunks
from rag.embeddings import embedding_model
import json

TEST_QUERIES = [
    "What are the instruments on Chandrayaan-2?",
    "What are the scientific objectives?",
    "What did Aditya-L1 discover?",
    "Compare the payloads of two missions",
]

def test_chunk_configurations():
    """Test different chunk sizes and measure retrieval quality."""
    
    configs = [
        {"chunk_size": 600, "overlap": 150},
        {"chunk_size": 800, "overlap": 200},
        {"chunk_size": 1000, "overlap": 250},
        {"chunk_size": 1200, "overlap": 300},
    ]
    
    results = []
    
    for config in configs:
        # Index with this config
        print(f"\n📊 Testing: chunk_size={config['chunk_size']}, overlap={config['overlap']}")
        
        # Test retrieval quality
        quality_scores = []
        for query in TEST_QUERIES:
            chunks, debug = retrieve_chunks(query, top_k=5)
            quality_scores.append({
                "query": query,
                "chunks": len(chunks),
                "avg_similarity": sum(c["similarity"] for c in chunks) / len(chunks) if chunks else 0
            })
        
        avg_chunks = sum(c["chunks"] for c in quality_scores) / len(quality_scores)
        avg_similarity = sum(c["avg_similarity"] for c in quality_scores) / len(quality_scores)
        
        results.append({
            "config": config,
            "avg_chunks": avg_chunks,
            "avg_similarity": avg_similarity,
            "details": quality_scores
        })
        
        print(f"  Avg chunks: {avg_chunks:.1f}, Avg similarity: {avg_similarity:.3f}")
    
    # Save results
    with open("chunking_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\n✅ Results saved to chunking_test_results.json")
    return results

if __name__ == "__main__":
    test_chunk_configurations()
```

---

### Fix 5: Better Section Detection (10 min) ✅

**File**: `backend/rag/section_detector.py`

Improved version with NLP:

```python
import re
import spacy
from typing import Tuple

# Try to load spaCy model, fallback to simple version
try:
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except:
    SPACY_AVAILABLE = False
    print("⚠️  spaCy model not found. Using keyword matching only.")

SECTION_KEYWORDS = {
    "OBJECTIVES": {
        "keywords": ["mission objectives", "aims of the mission", "designed to", "aim to", "goals"],
        "weight": 1.0
    },
    "PAYLOADS": {
        "keywords": ["payload", "instrument", "spectrometer", "camera", "sensor", "detector"],
        "weight": 1.0
    },
    "SCIENCE_RESULTS": {
        "keywords": ["science results", "observations reveal", "results show", "data indicates", "findings"],
        "weight": 1.0
    },
    "MISSION_OVERVIEW": {
        "keywords": ["introduction", "overview", "mission profile", "background", "context"],
        "weight": 0.8
    },
}

def detect_section_from_text(text: str) -> str:
    """
    Detect section with improved accuracy using keyword matching + NLP.
    Returns: Section name or "UNKNOWN"
    """
    if not text or len(text.strip()) < 20:
        return "UNKNOWN"
    
    text_lower = text.lower()
    text_clean = re.sub(r'\s+', ' ', text_lower).strip()
    
    # Step 1: Keyword matching with scoring
    section_scores = {}
    
    for section, info in SECTION_KEYWORDS.items():
        score = 0
        keywords = info.get("keywords", [])
        weight = info.get("weight", 1.0)
        
        for keyword in keywords:
            if keyword in text_clean:
                # Higher score for longer, more specific keywords
                score += len(keyword.split()) * weight
        
        section_scores[section] = score
    
    # Step 2: If no keyword match, try NLP (if available)
    best_section = max(section_scores, key=section_scores.get) if section_scores else "UNKNOWN"
    best_score = section_scores.get(best_section, 0)
    
    if best_score == 0 and SPACY_AVAILABLE:
        # NLP fallback for ambiguous sections
        doc = nlp(text[:500])  # Process first 500 chars for speed
        
        # Look for noun phrases and named entities
        nouns = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]
        
        if any(n in text_lower for n in ["instrument", "payload", "camera", "spectrometer"]):
            best_section = "PAYLOADS"
        elif any(n in text_lower for n in ["objective", "goal", "aim"]):
            best_section = "OBJECTIVES"
        elif any(n in text_lower for n in ["result", "discovery", "finding"]):
            best_section = "SCIENCE_RESULTS"
    
    if best_score == 0 and best_section == "UNKNOWN":
        print(f"ℹ️  Section not detected, defaulting to UNKNOWN")
    
    return best_section


def detect_section_from_text_with_confidence(text: str) -> Tuple[str, float]:
    """
    Detect section and return confidence score (0.0-1.0).
    """
    text_lower = text.lower()
    section_scores = {}
    
    for section, info in SECTION_KEYWORDS.items():
        score = 0
        keywords = info.get("keywords", [])
        weight = info.get("weight", 1.0)
        
        for keyword in keywords:
            if keyword in text_lower:
                score += len(keyword.split()) * weight
        
        section_scores[section] = score
    
    max_score = max(section_scores.values()) if section_scores else 0
    total_keywords = sum(len(info["keywords"]) for info in SECTION_KEYWORDS.values())
    
    best_section = max(section_scores, key=section_scores.get) if section_scores else "UNKNOWN"
    confidence = min(1.0, max_score / (total_keywords * 0.5)) if max_score > 0 else 0.0
    
    return best_section, confidence
```

---

## Monitoring Checklist

After applying fixes, verify with these checks:

### ✅ Check 1: Chunk Retrieval Logging
```bash
# After Fix 1, test a query and check logs for:
# ℹ️  Retriever: 10 results → 8 chunks
#    Filtered: 2 below threshold (min similarity: 0.18)
```

### ✅ Check 2: Low Confidence Detection
```bash
# After Fix 2, test queries and expect:
# Query with <3 chunks → "⚠️ LOW CONFIDENCE:" prefix
# Query with DB fallback → "✅ Using MongoDB answer"
```

### ✅ Check 3: Scanned PDF Handling
```bash
# After Fix 3, test with scanned PDF:
# ⚠️  Only 0/5 pages have text (scanned PDF detected)
# 🔄 Attempting OCR extraction...
# ✅ Extracted 5 pages (5 with content)
```

---

## Deployment Steps

1. **Backup current code** (git commit)
2. **Apply Fix 1** (retriever.py logging)
3. **Test retrieval** on 3-5 PDFs, check logs
4. **Apply Fix 2** (confidence detection)
5. **Test edge cases** (low chunks, missing data)
6. **Apply Fix 3** (extraction fallback)
7. **Test with scanned PDFs**
8. **Optional**: Apply Fix 4 & 5 after stabilizing

---

## Rollback Plan

Each fix is isolated. If issues arise:

```bash
# Revert specific fix:
git checkout HEAD -- backend/rag/retriever.py  # Fix 1
git checkout HEAD -- backend/routes/query.py    # Fix 2
# etc.
```

---

Would you like me to:
1. **Apply these fixes directly** to your codebase?
2. **Create test cases** to validate each fix?
3. **Add more detailed logging** to track data quality?
4. **Implement the chunking test** to find optimal sizes?
