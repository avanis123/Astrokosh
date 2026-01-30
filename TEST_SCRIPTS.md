# Test Scripts - Run These to Diagnose Your System

Save each script as a `.py` file in `backend/` and run with: `python script_name.py`

---

## 1️⃣ Test PDF Extraction Quality

**File**: `backend/test_extraction_quality.py`

```python
"""
Test if PDFs are being extracted correctly.
Identifies scanned PDFs, encoding issues, missing text, etc.
"""

import os
import asyncio
from pathlib import Path
from extractor import extract_text, extract_metadata, is_scanned
from utils.extractor_pipeline import process_pdf_pipeline
from database import db

async def test_extraction():
    """Test extraction on all uploaded PDFs."""
    
    pdf_dir = "uploaded_pdfs"
    if not os.path.exists(pdf_dir):
        print(f"❌ PDF directory not found: {pdf_dir}")
        return
    
    pdfs = list(Path(pdf_dir).glob("*.pdf"))
    if not pdfs:
        print("❌ No PDFs found in uploaded_pdfs/")
        return
    
    print(f"📊 Testing {len(pdfs)} PDFs...")
    print("=" * 60)
    
    results = []
    
    for pdf_path in pdfs[:5]:  # Test first 5
        print(f"\n📄 {pdf_path.name}")
        print("-" * 60)
        
        try:
            # Test 1: Is it scanned?
            scanned = is_scanned(str(pdf_path))
            print(f"  Scanned PDF: {'⚠️ YES' if scanned else '✅ NO'}")
            
            # Test 2: Extract text
            pages = extract_text(str(pdf_path))
            print(f"  Pages extracted: {len(pages)}")
            
            non_empty = sum(1 for p in pages if len(p.strip()) > 20)
            print(f"  Pages with content: {non_empty}/{len(pages)} ({100*non_empty/len(pages):.0f}%)")
            
            # Test 3: Check extraction quality
            if pages:
                avg_len = sum(len(p) for p in pages) / len(pages)
                max_len = max(len(p) for p in pages)
                min_len = min(len(p) for p in pages)
                
                print(f"  Avg chars/page: {avg_len:.0f}")
                print(f"  Range: {min_len}-{max_len} chars")
            
            # Test 4: Check metadata
            metadata = extract_metadata(str(pdf_path))
            if metadata.get("title"):
                print(f"  Title: {metadata['title'][:50]}")
            
            # Test 5: Full pipeline
            print("  Running full pipeline...")
            extracted = process_pdf_pipeline(str(pdf_path))
            
            doc = extracted["document"]
            obs = extracted["observations"]
            
            print(f"  Mission detected: {doc['mission']}")
            print(f"  Instruments found: {len(doc['instruments'])} - {doc['instruments'][:3] if doc['instruments'] else 'None'}")
            print(f"  Observations created: {len(obs)}")
            
            results.append({
                "file": pdf_path.name,
                "status": "✅ OK",
                "pages": len(pages),
                "mission": doc['mission'],
                "scanned": scanned
            })
            
        except Exception as e:
            print(f"  ❌ ERROR: {str(e)[:100]}")
            results.append({
                "file": pdf_path.name,
                "status": "❌ FAILED",
                "error": str(e)
            })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    success = sum(1 for r in results if r["status"] == "✅ OK")
    scanned_count = sum(1 for r in results if r.get("scanned"))
    
    print(f"Successful extractions: {success}/{len(results)}")
    print(f"Scanned PDFs detected: {scanned_count}")
    
    if scanned_count > 0:
        print(f"\n⚠️  {scanned_count} scanned PDFs need OCR!")
        print("   → Implement Fix 3 (Text Extraction) from FIX_IMPLEMENTATION_GUIDE.md")
    
    # Check MongoDB
    print(f"\n📦 MongoDB documents:")
    async with db.client.start_session() as session:
        doc_count = await db.documents.count_documents({})
        mission_count = len(await db.documents.distinct("mission"))
        
        print(f"  Total documents: {doc_count}")
        print(f"  Unique missions: {mission_count}")
        
        missions = await db.documents.distinct("mission")
        for mission in missions:
            count = await db.documents.count_documents({"mission": mission})
            print(f"    - {mission}: {count} documents")


if __name__ == "__main__":
    asyncio.run(test_extraction())
```

**Run**: `python test_extraction_quality.py`

**Expected Output**:
```
📊 Testing 3 PDFs...
============================================================

📄 chandrayaan2.pdf
  Scanned PDF: ✅ NO
  Pages extracted: 48
  Pages with content: 48/48 (100%)
  Mission detected: Chandrayaan-2
  ✅ OK
```

---

## 2️⃣ Test Chunk Retrieval & Filtering

**File**: `backend/test_chunk_retrieval.py`

```python
"""
Test if chunks are being retrieved and filtered correctly.
Identifies if MIN_SIMILARITY is too strict.
"""

from rag.retriever import retrieve_chunks, collection
from sentence_transformers import SentenceTransformer
import json

def test_retrieval():
    """Test retrieval on sample questions."""
    
    test_queries = [
        ("What are the instruments on Chandrayaan-2?", "PAYLOADS"),
        ("What are the mission objectives?", "OBJECTIVES"),
        ("What science results were discovered?", "RESULTS"),
        ("Tell me about Aditya-L1", "GENERAL"),
        ("Compare instruments of two missions", "COMPARISON"),
    ]
    
    print("🔍 Testing Chunk Retrieval")
    print("=" * 80)
    
    # Check if index is populated
    total_chunks = collection.count()
    print(f"\n📊 Chroma Index Status:")
    print(f"  Total chunks indexed: {total_chunks}")
    
    if total_chunks == 0:
        print("  ❌ Index is empty! Run /upload/reindex endpoint first")
        return
    
    print("\n" + "=" * 80)
    
    results = []
    
    for query, query_type in test_queries:
        print(f"\n❓ Query: {query}")
        print(f"   Type: {query_type}")
        print("-" * 80)
        
        # Get raw results before filtering
        embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        query_embedding = embedding_model.encode([query]).tolist()[0]
        
        raw_results = collection.query(
            query_embeddings=[query_embedding],
            n_results=20
        )
        
        docs = raw_results["documents"][0]
        metas = raw_results["metadatas"][0]
        distances = raw_results["distances"][0]
        
        # Analyze similarity distribution
        similarities = [1 - d for d in distances]
        
        print(f"   📈 Similarity Distribution (Top 10):")
        print(f"   {'Rank':<6} {'Similarity':<12} {'Page':<8} {'Section':<15} {'Status':<12}")
        print(f"   {'-'*60}")
        
        passed = 0
        filtered = 0
        MIN_SIMILARITY = 0.25
        
        for i, (sim, meta, doc_text) in enumerate(zip(similarities[:10], metas[:10], docs[:10])):
            status = "✅ PASSED" if sim >= MIN_SIMILARITY else "❌ FILTERED"
            
            if sim >= MIN_SIMILARITY:
                passed += 1
            else:
                filtered += 1
            
            section = meta.get("section", "UNKNOWN")[:15]
            page = meta.get("page_number", "?")
            
            print(f"   {i+1:<6} {sim:<12.3f} {page:<8} {section:<15} {status:<12}")
        
        # Summary
        print(f"\n   Summary:")
        print(f"   Retrieved before filter: {len(similarities)}")
        print(f"   Passed (sim ≥ {MIN_SIMILARITY}): {passed}")
        print(f"   Filtered (sim < {MIN_SIMILARITY}): {filtered}")
        
        if filtered > 0 and passed < 3:
            print(f"   ⚠️  WARNING: Low pass rate! Consider lowering MIN_SIMILARITY")
        
        # Test with actual retriever
        chunks, debug = retrieve_chunks(query, top_k=5)
        print(f"\n   Actual retrieval: {len(chunks)}/{debug['chunks_returned']} chunks")
        
        results.append({
            "query": query,
            "total_retrieved": len(docs),
            "passed_filter": passed,
            "filtered_out": filtered,
            "final_chunks": len(chunks)
        })
    
    # Analysis
    print("\n" + "=" * 80)
    print("📊 ANALYSIS")
    print("=" * 80)
    
    avg_passed = sum(r["passed_filter"] for r in results) / len(results)
    avg_filtered = sum(r["filtered_out"] for r in results) / len(results)
    
    print(f"\nAverage chunks passed: {avg_passed:.1f}")
    print(f"Average chunks filtered: {avg_filtered:.1f}")
    
    if avg_filtered > 5:
        print(f"\n⚠️  Filtering is too aggressive!")
        print(f"   Current MIN_SIMILARITY = 0.25")
        print(f"   Recommend trying MIN_SIMILARITY = 0.20 or 0.15")
        print(f"   → Update: backend/rag/retriever.py line 52")
    
    print(f"\n✅ Saved detailed results to retrieval_test_results.json")
    
    with open("retrieval_test_results.json", "w") as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    test_retrieval()
```

**Run**: `python test_chunk_retrieval.py`

**Expected Output**:
```
🔍 Testing Chunk Retrieval
================================================================================

📊 Chroma Index Status:
  Total chunks indexed: 1240

❓ Query: What are the instruments on Chandrayaan-2?
   Type: PAYLOADS
   📈 Similarity Distribution (Top 10):
   Rank  Similarity   Page     Section         Status    
   1     0.842        12       PAYLOADS        ✅ PASSED
   2     0.721        13       PAYLOADS        ✅ PASSED
   3     0.618        45       SCIENCE_RESULTS ✅ PASSED
   4     0.503        8        MISSION_OVERVIEW✅ PASSED
   5     0.412        22       UNKNOWN         ✅ PASSED
   6     0.318        19       MISSION_OVERVIEW❌ FILTERED
   ...
```

---

## 3️⃣ Test LLM Answer Quality

**File**: `backend/test_llm_answers.py`

```python
"""
Test if LLM is generating correct answers or hallucinating.
"""

import asyncio
from routes.query import rag_light_query, QueryRequest
from rag.conversation_manager import ConversationManager
import json

async def test_llm_answers():
    """Test LLM on sample questions."""
    
    test_cases = [
        {
            "question": "What are the instruments on Chandrayaan-2?",
            "session_id": "test_session_1",
            "expected_keywords": ["camera", "spectrometer", "instrument"]
        },
        {
            "question": "What is Aditya-L1 designed to observe?",
            "session_id": "test_session_2",
            "expected_keywords": ["sun", "solar", "corona"]
        },
        {
            "question": "What are the mission objectives of Chandrayaan-2?",
            "session_id": "test_session_1",
            "expected_keywords": ["lunar", "explore", "moon"]
        }
    ]
    
    print("🧠 Testing LLM Answer Quality")
    print("=" * 80)
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        question = test_case["question"]
        session_id = test_case["session_id"]
        expected_keywords = test_case["expected_keywords"]
        
        print(f"\n{i}. ❓ {question}")
        print("-" * 80)
        
        try:
            # Initialize session
            await ConversationManager.initialize_session(session_id)
            
            # Query
            request = QueryRequest(
                question=question,
                session_id=session_id,
                top_k=5
            )
            
            response = await rag_light_query(request)
            
            answer = response.answer
            chunks = response.chunks
            
            print(f"   📄 Chunks retrieved: {len(chunks)}")
            for j, chunk in enumerate(chunks[:3], 1):
                print(f"      {j}. (Page {chunk.page_number}, Similarity: {chunk.similarity:.3f})")
                print(f"         {chunk.text[:80]}...")
            
            print(f"\n   💬 Answer:")
            print(f"      {answer[:200]}...")
            
            # Check for hallucination
            answer_lower = answer.lower()
            
            found_keywords = [kw for kw in expected_keywords if kw in answer_lower]
            missing_keywords = [kw for kw in expected_keywords if kw not in answer_lower]
            
            confidence = len(found_keywords) / len(expected_keywords) if expected_keywords else 0
            
            print(f"\n   ✅ Expected keywords found: {found_keywords}")
            if missing_keywords:
                print(f"   ❌ Missing keywords: {missing_keywords}")
            
            print(f"   📊 Confidence: {confidence:.0%}")
            
            # Warnings
            if "This information is not present" in answer:
                print(f"   ⚠️  No chunks retrieved - data may be missing from PDFs")
            elif len(chunks) < 3:
                print(f"   ⚠️  Low chunk count - answer may be incomplete")
            elif "⚠️ LOW CONFIDENCE" in answer:
                print(f"   ⚠️  System flagged low confidence")
            
            results.append({
                "question": question,
                "chunks_count": len(chunks),
                "confidence": confidence,
                "keywords_found": found_keywords,
                "keywords_missing": missing_keywords,
                "answer_length": len(answer)
            })
            
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)[:100]}")
            results.append({
                "question": question,
                "error": str(e)
            })
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    
    successful = [r for r in results if "error" not in r]
    
    if successful:
        avg_chunks = sum(r["chunks_count"] for r in successful) / len(successful)
        avg_confidence = sum(r["confidence"] for r in successful) / len(successful)
        
        print(f"\nSuccessful answers: {len(successful)}/{len(test_cases)}")
        print(f"Avg chunks per answer: {avg_chunks:.1f}")
        print(f"Avg confidence: {avg_confidence:.0%}")
        
        if avg_confidence < 0.5:
            print(f"\n⚠️  Low average confidence!")
            print(f"   Possible causes:")
            print(f"   - Extraction not getting all relevant text")
            print(f"   - Similarity threshold too high")
            print(f"   - LLM not understanding chunks properly")
            print(f"\n   → Check: test_extraction_quality.py and test_chunk_retrieval.py")
    
    print(f"\n✅ Results saved to llm_test_results.json")
    
    with open("llm_test_results.json", "w") as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    asyncio.run(test_llm_answers())
```

**Run**: `python test_llm_answers.py`

---

## 4️⃣ Context Maintenance Test

**File**: `backend/test_conversation_context.py`

```python
"""
Test if conversation context is properly maintained across turns.
"""

import asyncio
from routes.query import rag_light_query, QueryRequest
from rag.conversation_manager import ConversationManager
import json

async def test_context_maintenance():
    """Test multi-turn conversation."""
    
    session_id = "context_test_session"
    
    conversation_flow = [
        {
            "question": "Tell me about Chandrayaan-2",
            "context": "Initial query about Chandrayaan-2",
            "expected_keywords": ["chandrayaan"]
        },
        {
            "question": "What instruments does it have?",
            "context": "Follow-up about instruments (should maintain Chandrayaan-2 context)",
            "expected_keywords": ["payload", "camera"]
        },
        {
            "question": "Describe the objectives",
            "context": "Follow-up about objectives (should still know we're talking about Chandrayaan-2)",
            "expected_keywords": ["objective", "mission"]
        }
    ]
    
    print("🔄 Testing Conversation Context Maintenance")
    print("=" * 80)
    
    # Initialize session
    await ConversationManager.initialize_session(session_id)
    
    results = []
    
    for i, turn in enumerate(conversation_flow, 1):
        question = turn["question"]
        context = turn["context"]
        
        print(f"\n{i}. ❓ {question}")
        print(f"   Context: {context}")
        print("-" * 80)
        
        try:
            # Get conversation history BEFORE asking
            history_before = await ConversationManager.get_conversation_history(session_id, limit=6)
            print(f"   History before query: {len(history_before)} messages")
            
            # Make query
            request = QueryRequest(
                question=question,
                session_id=session_id,
                top_k=5
            )
            
            response = await rag_light_query(request)
            
            answer = response.answer
            chunks = response.chunks
            
            # Get conversation history AFTER asking
            history_after = await ConversationManager.get_conversation_history(session_id, limit=6)
            
            print(f"   History after query: {len(history_after)} messages")
            
            # Check if context is maintained
            if len(history_after) > len(history_before):
                print(f"   ✅ History updated (added {len(history_after) - len(history_before)} messages)")
            
            # Check answer
            print(f"   📄 Chunks: {len(chunks)}")
            print(f"   💬 Answer length: {len(answer)} chars")
            
            # Check for context awareness
            if i > 1:
                prev_answer = results[i-2]["answer"]
                
                # Simple check: does answer reference previous context?
                if "chandrayaan" in answer.lower():
                    print(f"   ✅ Answer maintains mission context")
                else:
                    print(f"   ⚠️  Answer may have lost context (no 'Chandrayaan' mention)")
            
            results.append({
                "turn": i,
                "question": question,
                "history_size": len(history_after),
                "chunks_count": len(chunks),
                "answer": answer[:200]
            })
            
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)[:100]}")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    
    final_history = await ConversationManager.get_conversation_history(session_id, limit=20)
    
    print(f"\nFinal conversation history: {len(final_history)} messages")
    for msg in final_history:
        role = msg["role"].upper()
        content = msg["content"][:60]
        print(f"  {role}: {content}...")
    
    print(f"\n✅ Results saved to context_test_results.json")
    
    with open("context_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    # Recommendations
    if len(final_history) == len(conversation_flow) * 2:
        print(f"\n✅ Conversation history is being saved correctly")
    else:
        print(f"\n⚠️  Conversation history incomplete!")


if __name__ == "__main__":
    asyncio.run(test_context_maintenance())
```

**Run**: `python test_conversation_context.py`

---

## How to Run All Tests

```bash
cd backend

# Test 1: Extraction
python test_extraction_quality.py

# Test 2: Retrieval
python test_chunk_retrieval.py

# Test 3: LLM (requires uvicorn running)
python test_llm_answers.py

# Test 4: Context
python test_conversation_context.py
```

---

## Interpreting Results

| Test | ✅ Good | ⚠️ Warning | ❌ Bad |
|------|---------|-----------|--------|
| **Extraction** | All pages extracted, missions detected | Some scanned PDFs | No text extracted |
| **Retrieval** | 5+ chunks, >0.5 avg similarity | <3 chunks, >50% filtered | 0 chunks, all filtered |
| **LLM** | 70%+ keyword match, coherent answers | 50-70% match, some errors | <50% match, hallucinations |
| **Context** | History grows each turn, context maintained | History incomplete, some context loss | History not updating |

---

## Next Steps

1. **Run all 4 tests**: Takes ~10 min total
2. **Check results**: JSON files with detailed data
3. **Fix based on failures**: See RAG_SYSTEM_ANALYSIS.md
4. **Re-test after fixes**: Verify improvements

Would you like me to run these tests directly?
