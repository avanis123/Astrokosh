"""
Test context expansion function to verify it works correctly
"""

from typing import List, Dict
import re

def _extract_missions_from_history(history: List[Dict]) -> List[str]:
    """Extract mission names mentioned in conversation history."""
    missions = []
    mission_keywords = ["chandrayaan", "aditya", "isro", "insat", "cartosat", "ors", "risat"]
    
    for msg in history:
        content = msg["content"].lower()
        for mission in mission_keywords:
            if mission in content and mission not in missions:
                missions.append(mission)
    
    return missions


def _resolve_pronouns(question: str, history: List[Dict]) -> str:
    """
    Resolve pronouns like 'it', 'its', 'that' to actual entities from history.
    Example: "What are its objectives?" → "What are Chandrayaan-2's objectives?"
    """
    if not history or len(history) < 2:
        return question
    
    question_lower = question.lower()
    
    # Check if question contains pronouns
    pronouns = ["it", "its", "it's", "that", "this mission", "that mission"]
    has_pronoun = any(f" {p} " in f" {question_lower} " or f" {p}?" in question_lower 
                      for p in pronouns)
    
    if not has_pronoun:
        return question
    
    # Extract missions from history
    missions_in_history = _extract_missions_from_history(history)
    
    if not missions_in_history:
        return question
    
    # Get the most recent mission mentioned
    recent_mission = missions_in_history[-1]
    
    # Replace pronouns with mission name
    resolved = question
    resolved = re.sub(r'\bit\b', recent_mission, resolved, flags=re.IGNORECASE)
    resolved = re.sub(r'\bits\b', f"{recent_mission}'s", resolved, flags=re.IGNORECASE)
    resolved = re.sub(r"\bit's\b", f"{recent_mission} is", resolved, flags=re.IGNORECASE)
    resolved = re.sub(r'\bthis mission\b', recent_mission, resolved, flags=re.IGNORECASE)
    resolved = re.sub(r'\bthat mission\b', recent_mission, resolved, flags=re.IGNORECASE)
    
    return resolved


def _expand_query_with_context(question: str, history: List[Dict]) -> str:
    """
    Expand query with conversation context.
    """
    if not history:
        return question
    
    # Step 1: Resolve pronouns
    resolved = _resolve_pronouns(question, history)
    
    # Step 2: Check if question has mission context
    missions_in_question = ["chandrayaan", "aditya", "isro", "insat", "cartosat", "ors", "risat"]
    has_mission = any(m in resolved.lower() for m in missions_in_question)
    
    # If no mission in question, try to extract from history
    if not has_mission:
        recent_missions = _extract_missions_from_history(history)
        if recent_missions:
            mission = recent_missions[-1]
            # Only add context if question is short/vague
            if len(question.split()) <= 7:
                resolved = f"{mission}. {resolved}"
                return resolved
    
    return resolved


# Test cases
test_cases = [
    {
        "name": "Pronoun resolution - 'its'",
        "question": "what are its objectives",
        "history": [
            {"role": "user", "content": "Tell me about Chandrayaan-2"},
            {"role": "assistant", "content": "Chandrayaan-2 is a lunar mission..."}
        ],
        "expected": "what are chandrayaan's objectives"
    },
    {
        "name": "Pronoun resolution - 'it'",
        "question": "what can it observe",
        "history": [
            {"role": "user", "content": "Tell me about Aditya-L1"},
            {"role": "assistant", "content": "Aditya-L1 is a solar mission..."}
        ],
        "expected": "what can aditya observe"
    },
    {
        "name": "Add mission context if missing",
        "question": "what are the objectives",
        "history": [
            {"role": "user", "content": "Tell me about Chandrayaan-2"},
            {"role": "assistant", "content": "Chandrayaan-2 is..."}
        ],
        "expected": "chandrayaan. what are the objectives"
    },
    {
        "name": "No expansion if mission explicit",
        "question": "what are the objectives of Chandrayaan-2",
        "history": [
            {"role": "user", "content": "Tell me about Aditya-L1"},
            {"role": "assistant", "content": "Aditya-L1 is..."}
        ],
        "expected": "what are the objectives of Chandrayaan-2"
    },
]

print("🧪 Testing Context Expansion Function\n")
print("=" * 70)

all_passed = True

for test in test_cases:
    result = _expand_query_with_context(test["question"], test["history"])
    passed = result.lower() == test["expected"].lower()
    all_passed = all_passed and passed
    
    status = "✅ PASS" if passed else "❌ FAIL"
    
    print(f"\n{status}: {test['name']}")
    print(f"  Input:    '{test['question']}'")
    print(f"  Expected: '{test['expected']}'")
    print(f"  Got:      '{result}'")

print("\n" + "=" * 70)
if all_passed:
    print("✅ All tests passed!")
else:
    print("❌ Some tests failed - check implementation")
