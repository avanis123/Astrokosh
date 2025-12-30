# utils/temporal_event_builder.py

from utils.ner_rules import extract_dates
from utils.mission_phase_extractor import extract_mission_phases
from utils.measurement_extractor import extract_measurements
from utils.ner_ml import extract_spacy_entities


def build_temporal_events(pages, mission_name="Unknown Mission"):
    temporal_events = []

    for page_index, page_text in enumerate(pages):
        dates = extract_dates(page_text)
        phases = extract_mission_phases(page_text)
        measurements = extract_measurements(page_text)
        spacy_entities = extract_spacy_entities(page_text)

        # Extract instruments from spaCy output
        instruments = []

        for ent in spacy_entities:
            # ent is likely: (text, label)
            if isinstance(ent, tuple) and len(ent) == 2:
                text, label = ent
                if label in ["INSTRUMENT", "ORG", "PRODUCT"]:
                    instruments.append(text)


        for d in dates:
            date_value = d[0] if isinstance(d, tuple) else d

            # Mission Phase events
            for phase in phases:
                temporal_events.append({
                    "mission": mission_name,
                    "date": date_value,
                    "event_type": "Mission Phase",
                    "label": phase,
                    "entities": {
                        "instruments": instruments,
                        "measurements": [],
                        "coordinates": []
                    },
                    "source_page": page_index + 1,
                    "source_text": page_text[:300]
                })

            # Measurement events
            for m in measurements:
                temporal_events.append({
                    "mission": mission_name,
                    "date": date_value,
                    "event_type": "Measurement",
                    "label": m,
                    "entities": {
                        "instruments": instruments,
                        "measurements": [m],
                        "coordinates": []
                    },
                    "source_page": page_index + 1,
                    "source_text": page_text[:300]
                })

    return temporal_events
