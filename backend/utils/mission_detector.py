import re

MISSION_PATTERNS = {
    "Chandrayaan-1": r"(Chandrayaan[\s-]?1|Chandrayaan\s?I|CY-1|CH-1)",
    "Chandrayaan-2": r"(Chandrayaan[\s-]?2|CY-2)",
    "Chandrayaan-3": r"(Chandrayaan[\s-]?3|CY-3)",
    "Aditya-L1": r"(Aditya[\s-]?L1|Aditya L1)",
    "AstroSat": r"(Astro\s?Sat|AS1)",
    "NOAA-SWPC": r"(NOAA|Space Weather Prediction Center)"
}


def detect_mission(text):
    # Normalize Unicode dashes → normal hyphen
    text = (
        text.replace("–", "-")
            .replace("—", "-")
            .replace("-", "-")
    )

    for mission, pattern in MISSION_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            return mission

    return "Unknown"

