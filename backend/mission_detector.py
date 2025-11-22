import re

MISSION_PATTERNS = {
    "Chandrayaan-2": r"(Chandrayaan[\s-]?2|CY-2)",
    "Chandrayaan-3": r"(Chandrayaan[\s-]?3|CY-3)",
    "Aditya-L1": r"(Aditya[\s-]?L1|Aditya L1)",
    "AstroSat": r"(Astro\s?Sat|AS1)",
    "NOAA-SWPC": r"(NOAA|Space Weather Prediction Center)"
}

def detect_mission(text):
    text_lower = text.lower()
    for mission, pattern in MISSION_PATTERNS.items():
        if re.search(pattern, text_lower, re.IGNORECASE):
            return mission
    return "Unknown"
