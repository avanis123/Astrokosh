import re

SECTION_KEYWORDS = {
    "OBJECTIVES": [
        "mission objectives",
        "objectives are",
        "aims of the mission",
        "the mission is designed to",
        "the mission aims to",
    ],
    "PAYLOADS": [
        "payload",
        "instrument",
        "spectrometer",
        "camera",
        "orbiter payload",
    ],
    "SCIENCE_RESULTS": [
        "science results",
        "major science results",
        "observations reveal",
        "results show",
        "data indicates",
    ],
    "MISSION_OVERVIEW": [
        "introduction",
        "overview",
        "mission profile",
        "this mission",
    ],
}

def detect_section_from_text(text: str) -> str:
    t = text.lower()

    for section, keywords in SECTION_KEYWORDS.items():
        for kw in keywords:
            if kw in t:
                return section

    return "UNKNOWN"
