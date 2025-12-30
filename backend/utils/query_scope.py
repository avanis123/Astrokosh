def is_multi_mission_question(question: str) -> bool:
    q = question.lower()

    # Explicit multi-mission cues
    if any(k in q for k in [
        "compare",
        "difference between",
        "which missions",
        "list missions",
        "across missions",
        "among missions",
        "multiple missions",
    ]):
        return True

    # Implicit plural mission cues
    if "missions" in q:
        return True

    # Pattern: Mission A and Mission B
    if " and " in q:
        return True

    return False
