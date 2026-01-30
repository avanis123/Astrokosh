"""
Test script to demonstrate the phase information retrieval fix.

PROBLEM: When asking about Chandrayaan-2 phases, system returns 
         "Information not provided" even though it's in the PDF.

CAUSE: MIN_SIMILARITY threshold too high (0.25) filters out relevant chunks

SOLUTION: Lowered threshold to 0.20 (adaptive: 0.18 for phase questions)
"""

import asyncio
from routes.query import rag_light_query, QueryRequest
from rag.conversation_manager import ConversationManager

async def test_phases_retrieval():
    """Test retrieval of phase information."""
    
    print("=" * 80)
    print("🧪 Testing Phase Information Retrieval")
    print("=" * 80)
    
    session_id = "phases_test_session"
    
    test_cases = [
        {
            "name": "Chandrayaan-2 Phases",
            "question": "What are the different phases of Chandrayaan-2?",
            "mission": "Chandrayaan-2"
        },
        {
            "name": "Aditya-L1 Phases",
            "question": "What are the phases of the Aditya-L1 mission?",
            "mission": "Aditya-L1"
        },
    ]
    
    # Initialize session
    await ConversationManager.initialize_session(session_id)
    
    for test in test_cases:
        print(f"\n{'='*80}")
        print(f"📊 Test: {test['name']}")
        print(f"{'='*80}")
        print(f"❓ Question: {test['question']}")
        print("-" * 80)
        
        try:
            request = QueryRequest(
                question=test["question"],
                session_id=session_id,
                top_k=5
            )
            
            response = await rag_light_query(request)
            
            answer = response.answer
            chunks = response.chunks
            
            print(f"\n📊 Retrieval Results:")
            print(f"   Chunks retrieved: {len(chunks)}")
            
            if chunks:
                print(f"\n   Chunk Details:")
                for i, chunk in enumerate(chunks, 1):
                    print(f"   {i}. Similarity: {chunk.similarity:.3f}")
                    print(f"      Page: {chunk.page_number}")
                    print(f"      Mission: {chunk.mission}")
                    print(f"      Text: {chunk.text[:100]}...")
            else:
                print(f"   ❌ No chunks retrieved!")
            
            print(f"\n💬 Answer:")
            if "not present" in answer.lower() or "not provided" in answer.lower():
                print(f"   ⚠️  {answer[:150]}...")
                print(f"   Status: ❌ PROBLEM - Info filtered out")
            else:
                print(f"   ✅ {answer[:200]}...")
                print(f"   Status: ✅ FIXED - Info retrieved successfully")
                
        except Exception as e:
            print(f"❌ Error: {str(e)[:100]}")
    
    print(f"\n{'='*80}")
    print("📊 Summary:")
    print(f"{'='*80}")
    print("✅ Fixes Applied:")
    print("   1. Lowered MIN_SIMILARITY from 0.25 → 0.20")
    print("   2. Added adaptive threshold: 0.18 for 'phase' questions")
    print("   3. Added detailed logging of filtered chunks")
    print("   4. Enhanced context expansion for follow-up questions")
    print("\nExpected Result:")
    print("   - Phase information now retrieves correctly")
    print("   - More chunks pass the similarity threshold")
    print("   - Detailed logging shows what was filtered")


if __name__ == "__main__":
    asyncio.run(test_phases_retrieval())
