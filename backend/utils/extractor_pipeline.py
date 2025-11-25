import os
import json
from extractor import extract_text, extract_metadata, extract_tables, clean_text
from ner_pipeline import extract_entities_from_pages
from mission_detector import detect_mission
from instrument_detector import find_instruments
from observation_linker import create_observations


def stringify_keys(obj):
    if isinstance(obj, dict):
        return {str(k): stringify_keys(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [stringify_keys(v) for v in obj]
    else:
        return obj


def process_pdf_pipeline(pdf_path):
    filename = os.path.basename(pdf_path)

    # 1. Extract basic data
    raw_text = extract_text(pdf_path)
    metadata = extract_metadata(pdf_path)
    tables = extract_tables(pdf_path)
    cleaned_text = clean_text(raw_text)

    # 2. Extract entities
    entities = extract_entities_from_pages(cleaned_text)

    # 3. Detect mission & instruments
    mission = detect_mission(" ".join(cleaned_text[:5]))
    instruments = find_instruments(cleaned_text)

    # 4. Create observations
    observations = create_observations(
        cleaned_text, instruments, entities, filename
    )

    # 5. Return full data in unified structure
    document_data = {
    "file_name": filename,
    "mission": mission,
    "instruments": instruments,
    "metadata": metadata,
    "entities": entities,
    "tables": stringify_keys(tables),   
    "pages_count": len(cleaned_text)
}

    return {
        "document": document_data,
        "observations": observations
    }
