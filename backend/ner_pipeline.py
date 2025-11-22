from ner_rules import extract_dates, extract_coordinates
from ner_ml import extract_spacy_entities
from mission_phase_extractor import extract_mission_phases
from measurement_extractor import extract_measurements


def extract_entities_from_pages(pages):
    all_dates = set()
    all_coords = set()
    all_spacy = []
    all_phases = set()
    all_measurements = set()


    for page in pages:
        text = page

        # Rule-based
        for d in extract_dates(text):
            all_dates.add(d[0] if isinstance(d, tuple) else d)

        for c in extract_coordinates(text):
            all_coords.add(c)

        for p in extract_mission_phases(text):
            all_phases.add(p)
        
        for m in extract_measurements(text):
            all_measurements.add(m)

        # ML-based
        spacy_output = extract_spacy_entities(text)
        all_spacy.extend(spacy_output)

    return {
        "dates": list(all_dates),
        "coordinates": list(all_coords),
        "mission_phases": list(all_phases),
         "measurements": list(all_measurements),
        "spacy_entities": all_spacy
    }
