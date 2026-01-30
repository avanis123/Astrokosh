# RAG Troubleshooting Decision Tree

## 🔍 Question: "Is the system giving me correct answers?"

---

## YES, but sometimes wrong → **Hallucination Issue**

### Root Cause Analysis:
- [ ] LLM generating plausible but false information
- [ ] Not enough chunks retrieved (< 3)
- [ ] Chunks below similarity threshold but still used

### Diagnostic Steps:
```python
# 1. Check chunk quality
chunks = retrieve_chunks(query, top_k=5)
for c in chunks:
    print(f"Similarity: {c['similarity']:.3f}, Text: {c['text'][:100]}")

# 2. Check if these chunks answer the question
# If NO → retrieval problem (see below)
# If YES but LLM ignores → LLM prompt problem
```

### Fixes (Priority):
1. ✅ **Add confidence threshold**: Mark low-confidence answers with ⚠️
2. ✅ **Check MongoDB first**: Use `answer_from_mongo()` for factual questions
3. ✅ **Tighten LLM instructions**: Add "Do not make up information"
4. ✅ **Lower similarity threshold**: If chunks are filtered out

---

## NO correct answers - Getting "information not present" → **Extraction/Indexing Problem**

### Flowchart:

```
Is the PDF actually uploaded and indexed?
├─ YES → Continue below
└─ NO → Upload PDF via /upload endpoint
        Check MongoDB: db.documents.find({"file_name": "yourfile.pdf"})

Can you find relevant chunks manually?
├─ YES → Retrieval confidence score is too high (see below)
└─ NO → PDF was not extracted properly

Is the PDF scanned/image-heavy?
├─ YES → extract_text() needs OCR fallback
│        Implement Fix 3 (Text Extraction)
└─ NO → Continue below

Check Chroma index:
├─ Collection empty? → indexer.py didn't run properly
│                      Run /upload/reindex endpoint
├─ Collection has chunks? → Chunk retrieval filter too strict
│                           Check MIN_SIMILARITY = 0.25
└─ Check metadata: Are pdf_name and mission correctly stored?
```

### Diagnostic Queries:

```python
# 1. Check MongoDB for uploaded PDFs
from database import db
docs = await db.documents.find({"mission": "Chandrayaan-2"}).to_list(10)
print(f"Found {len(docs)} Chandrayaan-2 documents")

# 2. Check Chroma index
from rag.retriever import debug_chroma_count
print(f"Total chunks indexed: {debug_chroma_count()}")

# 3. Check if indexing happened
doc = await db.documents.find_one({"file_name": "yourfile.pdf"})
if doc:
    print(f"Document found with {doc['pages_count']} pages")
    print(f"Instruments: {doc['instruments']}")

# 4. Test retrieval directly
chunks, debug = retrieve_chunks("test query", top_k=20)
print(f"Retrieved {len(chunks)}/{20} chunks")
print(f"Filtered out: {debug['filtered_out']}")
```

---

## Answers are incomplete - Not all information retrieved → **Chunk Coverage Problem**

### Root Causes:
1. **Chunk size too small**: Splits concepts mid-way
2. **Similarity threshold too high**: Drops marginal matches
3. **Top-k too low**: Not getting enough chunks
4. **Section filtering**: Limiting search space unnecessarily

### Quick Diagnostics:

```python
# Test 1: Is top_k high enough?
question = "Describe Chandrayaan-2 objectives, payloads, and results"
chunks_5 = retrieve_chunks(question, top_k=5)
chunks_15 = retrieve_chunks(question, top_k=15)

if len(chunks_15) > len(chunks_5):
    print("✅ Increasing top_k gets more results")
else:
    print("❌ Similarity filter killing chunks at top_k=15")

# Test 2: What gets filtered?
from rag.retriever import collection
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
query_embedding = embedding_model.encode([question]).tolist()[0]

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=20  # Get all before filtering
)

docs = results["documents"][0]
distances = results["distances"][0]
similarities = [1 - d for d in distances]

print("Similarity distribution:")
for i, sim in enumerate(similarities):
    status = "✅ PASSED" if sim >= 0.25 else "❌ FILTERED"
    print(f"  Result {i}: {sim:.3f} {status}")
```

### Fixes (Priority):

1. ✅ **Increase top_k dynamically**: Already done for `question_type in ["measurement", "numeric", "entity", "comparison"]`
   - **Add**: Increase top_k for multi-concept questions automatically
   - **Code**:
     ```python
     concept_count = len([w for w in question.lower().split() 
                          if w in ["objectives", "payloads", "instruments", "results"]])
     top_k = 5 + (concept_count * 3)  # Scale with complexity
     ```

2. ✅ **Lower MIN_SIMILARITY for low-confidence queries**:
   ```python
   MIN_SIMILARITY = 0.25  # Current
   MIN_SIMILARITY = 0.20  # Try if too many filtered
   MIN_SIMILARITY = 0.15  # Last resort (risky)
   ```

3. ✅ **Test chunk sizes**: See FIX_IMPLEMENTATION_GUIDE.md (Fix 4)

4. ✅ **Don't filter by section**: Remove section parameter from retrieval unless explicitly requested

---

## Context not maintained - Follow-up questions confused → **Conversation Context Issue**

### Root Causes:
1. Conversation history retrieved but NOT used for retrieval
2. No co-reference resolution ("it" → "Chandrayaan-2")
3. Previous mission context not expanded in current query

### Example Problem:

```
Turn 1: User: "Tell me about Chandrayaan-2"
        Assistant: [Returns Chandrayaan-2 info] ✅

Turn 2: User: "What instruments does it have?"
        Current behavior: Searches for "What instruments does it have?"
                         (loses "Chandrayaan-2" context)
        Result: May retrieve Aditya-L1 instruments ❌
```

### Diagnostic:

```python
# Check conversation history is being retrieved
history = await ConversationManager.get_conversation_history(session_id, limit=6)
print(f"Retrieved {len(history)} messages")
for msg in history:
    print(f"  {msg['role']}: {msg['content'][:50]}")

# Check if history is passed to LLM
# (It is! See llm.py lines 35-45)
# But NOT used for RETRIEVAL - this is the bug
```

### Fixes (Priority):

1. ✅ **Expand query with context**:
   ```python
   # In routes/query.py, before retrieve_chunks():
   
   expanded_query = question
   
   if len(conversation_history) > 0:
       # Extract last mission mentioned
       last_messages = [m["content"] for m in conversation_history[-3:]]
       last_context = " ".join(last_messages)
       
       # If question is vague, add context
       if len(question.split()) < 5:  # Short question like "What instruments?"
           expanded_query = f"{last_context}. {question}"
           print(f"📝 Expanded query: {expanded_query[:100]}")
   
   chunks = retrieve_chunks(expanded_query, top_k=top_k)
   ```

2. ✅ **Add co-reference resolution**:
   ```python
   import re
   
   def resolve_coreferences(question: str, history: list) -> str:
       """Replace 'it' with actual entity from history."""
       
       if "it" not in question.lower():
           return question
       
       # Find last mentioned mission/entity
       for msg in reversed(history):
           content = msg["content"].lower()
           for mission in ["chandrayaan", "aditya", "isro"]:
               if mission in content:
                   # Replace 'it' with mission
                   resolved = re.sub(r'\bit\b', mission, question, flags=re.IGNORECASE)
                   print(f"✅ Resolved: 'it' → '{mission}'")
                   return resolved
       
       return question
   
   # Use in query.py:
   question = resolve_coreferences(question, conversation_history)
   ```

3. ✅ **Store context in chunks metadata**:
   ```python
   # In retriever results, add conversation context:
   chunks.append({
       "text": text,
       "pdf_name": meta.get("pdf_name"),
       "page_number": meta.get("page_number"),
       "mission": meta.get("mission"),
       "similarity": similarity,
       "conversation_context": conversation_history  # Add this
   })
   ```

---

## Performance issues - Queries are slow → **Index/Retrieval Performance**

### Diagnostic:

```python
import time

# Time retrieval
start = time.time()
chunks = retrieve_chunks(question, top_k=5)
retrieval_time = time.time() - start

# Time LLM
start = time.time()
answer = generate_answer(question, chunks)
llm_time = time.time() - start

print(f"Retrieval: {retrieval_time:.2f}s")
print(f"LLM: {llm_time:.2f}s")

# Acceptable ranges:
# Retrieval: 0.1-0.5s (Chroma should be <100ms)
# LLM: 2-10s (depends on model)
```

### If retrieval is slow (>500ms):

1. **Check Chroma status**:
   ```bash
   # Chroma size
   du -sh backend/chroma/
   # If >500MB, consider cleanup
   ```

2. **Reduce top_k for testing**: `top_k=5` vs `top_k=20`

3. **Check if where filters slow it down**: Mission/section filters?

4. **Consider pagination**: Only retrieve what's needed

---

## Quick Fixes Summary Table

| Problem | Quick Fix | Time | Impact |
|---------|-----------|------|--------|
| Answers sometimes wrong | Add confidence flags | 5 min | High |
| Information not found | Check is_scanned() + OCR | 15 min | High |
| Incomplete answers | Increase top_k dynamically | 10 min | High |
| Context not maintained | Expand query with history | 15 min | Medium |
| Slow queries | Check Chroma size, reduce top_k | 5 min | Medium |
| Section detection wrong | Use NLP instead of keywords | 15 min | Low |

---

## Testing Your Fixes

### Test Case 1: PDF Extraction
```python
pdf_file = "sample_mission.pdf"
extracted = process_pdf_pipeline(pdf_file)

assert extracted["document"]["pages_count"] > 0, "No pages extracted"
assert extracted["document"]["mission"] != "Unknown", "Mission not detected"
assert len(extracted["observations"]) > 0, "No observations created"
```

### Test Case 2: Chunk Retrieval
```python
question = "What are the instruments?"
chunks, debug = retrieve_chunks(question, top_k=5)

assert len(chunks) > 0, "No chunks retrieved"
assert chunks[0]["similarity"] >= 0.25, "Similarity too low"
assert debug["filtered_out"] < 10, "Too many chunks filtered"
```

### Test Case 3: Answer Generation
```python
answer = generate_answer(question, chunks)

assert len(answer) > 20, "Answer too short"
assert "HALLUCINATION" not in answer, "Detected hallucination"
assert any(c["text"][:50] in answer for c in chunks), "Answer doesn't use chunks"
```

---

Would you like me to implement specific fixes from this tree?
