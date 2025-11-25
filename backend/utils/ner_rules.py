import re

# Extract dates like: 2023-08-05, 5 August 2023, Aug 2020
DATE_PATTERN = r"\b(\d{1,2}\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}|\d{4}-\d{2}-\d{2})\b"

# Extract coordinates like: 70.2°S, 23.8°E or 12.5 N, 45.7 E
COORD_PATTERN = r"\b(\d{1,3}\.?\d*°?\s?[NS],?\s?\d{1,3}\.?\d*°?\s?[EW])\b"


def extract_dates(text):
    return re.findall(DATE_PATTERN, text, flags=re.IGNORECASE)

def extract_coordinates(text):
    matches = re.findall(COORD_PATTERN, text, flags=re.IGNORECASE)
    return [" ".join(m).strip() for m in matches] if matches else []
