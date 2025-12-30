def extract_missions_from_question(
    question: str,
    known_missions: list[str]
) -> list[str]:
    """
    Extract mission names mentioned in a user question.
    Used ONLY for query-time retrieval decisions.
    """
    q = question.lower()
    found = []

    for mission in known_missions:
        if mission.lower() in q:
            found.append(mission)

    return found
