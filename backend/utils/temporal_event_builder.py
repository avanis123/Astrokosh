# utils/temporal_event_builder.py

from utils.ner_rules import extract_dates
from utils.mission_phase_extractor import extract_mission_phases
from utils.measurement_extractor import extract_measurements
from utils.ner_ml import extract_spacy_entities


def build_temporal_events(pages, mission_name="Unknown Mission"):
    temporal_events = []
    last_known_date = None   # 🔑 KEY ADDITION

    for page_index, page_text in enumerate(pages):
        dates = extract_dates(page_text)
        phases = extract_mission_phases(page_text)
        if phases:
            print("PHASES FOUND:", phases)

        measurements = extract_measurements(page_text)
        spacy_entities = extract_spacy_entities(page_text)

        # ---- Extract instruments ----
        instruments = []
        for ent in spacy_entities:
            if isinstance(ent, tuple) and len(ent) == 2:
                text, label = ent
                if label in ["INSTRUMENT", "ORG", "PRODUCT"]:
                    instruments.append(text)

        # ---- Normalize & update last known date ----
        date_values = [
            d[0] if isinstance(d, tuple) else d
            for d in dates
        ]

        if date_values:
            last_known_date = date_values[0]  # take first date on page

        event_date = last_known_date or "unknown"

        # ---- Create events EVEN IF PAGE HAS NO DATE ----
        for phase in phases:
            temporal_events.append({
                "mission": mission_name,
                "date": event_date,
                "event_type": "Mission Phase",
                "label": phase,
                "confidence": "high" if date_values else "medium",
                "entities": {
                    "instruments": instruments,
                    "measurements": [],
                    "coordinates": []
                },
                "source_page": page_index + 1,
                "source_text": page_text[:300]
            })

        for m in measurements:
            temporal_events.append({
                "mission": mission_name,
                "date": event_date,
                "event_type": "Measurement",
                "label": m,
                "confidence": "high" if date_values else "medium",
                "entities": {
                    "instruments": instruments,
                    "measurements": [m],
                    "coordinates": []
                },
                "source_page": page_index + 1,
                "source_text": page_text[:300]
            })

    return temporal_events
