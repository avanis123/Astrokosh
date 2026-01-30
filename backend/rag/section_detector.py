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