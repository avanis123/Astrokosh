import re

def normalize(text: str):
    return text.lower().strip()


def classify_question(q: str):
    """
    Classifies a user's question into a category.
    Categories drive how retrieval + LLM answering will work.
    """

    qn = normalize(q)

    # -----------------------
    # 1. Mission Overview
    # -----------------------
    if any(x in qn for x in ["tell me about", "overview of", "summary of", "what is the mission", "mission details"]):
        return "mission_overview"

    # -----------------------
    # 2. Mission Instruments
    # -----------------------
    if "instrument" in qn or "payload" in qn or "instruments of" in qn:
        return "mission_instruments"

    # -----------------------
    # 3. Mission Phases
    # -----------------------
    if "phase" in qn or "stages" in qn:
        return "mission_phases"

    # -----------------------
    # 4. Observations for mission/instrument
    # -----------------------
    if any(x in qn for x in ["observation", "observations", "data recorded", "what did it observe"]):
        return "observations"

    # -----------------------
    # 5. Keyword Search in Pages (mission-specific)
    # Example: "Find corona in Aditya-L1"
    # -----------------------
    if "find" in qn or "search" in qn:
        return "keyword_search"

    # -----------------------
    # 6. Concept / Definition type question:
    # "What is CME?", "Explain solar wind"
    # -----------------------
    if any(x in qn for x in ["what is", "explain", "define", "meaning of"]):
        return "concept_lookup"

    # -----------------------
    # 7. Measurement Questions
    # "What is the distance to L1?"
    # "How far is the Sun?"
    # -----------------------
    if any(x in qn for x in ["how much", "how far", "value of", "distance", "km", "nm", "keV", "au"]):
        return "measurement"

    # -----------------------
    # Default fallback
    # -----------------------
    return "general_query"
