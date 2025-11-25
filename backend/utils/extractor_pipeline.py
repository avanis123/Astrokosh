import os
from typing import Any, Dict, List

# Low-level PDF extraction (root module)
from extractor import extract_text, extract_metadata, extract_tables

# Helper utilities inside backend.utils
from utils.utils_text import clean_pages
from utils.ner_pipeline import extract_entities_from_pages
from utils.mission_detector import detect_mission
from utils.instrument_detector import find_instruments
from utils.observation_linker import create_observations


def stringify_keys(obj: Any) -> Any:
    """
    Recursively convert all dict keys to strings (for MongoDB safety when keys are ints).
    """
    if isinstance(obj, dict):
        return {str(k): stringify_keys(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [stringify_keys(v) for v in obj]
    else:
        return obj


def process_pdf_pipeline(pdf_path: str) -> Dict[str, Any]:
    """
    Unified extraction pipeline for AstroKosh.

    - Works for BOTH:
        * user-uploaded PDFs (via /upload)
        * offline/admin PDFs (batch scripts)
    - Output is ready to be stored in MongoDB and used for RAG indexing.

    Returns:
        {
            "document": { ... },
            "observations": [ ... ]
        }
    """
    filename = os.path.basename(pdf_path)

    # 1. Extract basic data from PDF
    # ------------------------------------------------------------------
    # Expectation: extract_text returns a list of raw page strings.
    raw_pages = extract_text(pdf_path)

    # If some older version returns a single big string, normalize to list
    if not isinstance(raw_pages, list):
        raw_pages = [raw_pages]

    # Clean each page individually
    cleaned_pages: List[str] = clean_pages(raw_pages)

    metadata = extract_metadata(pdf_path)
    tables = extract_tables(pdf_path)

    # 2. Extract entities (dates, coords, phases, measurements, spaCy NER)
    # ------------------------------------------------------------------
    entities = extract_entities_from_pages(cleaned_pages)

    # 3. Detect mission & instruments
    # ------------------------------------------------------------------
    # Use first few pages' text to detect mission name
    first_pages_text = " ".join(cleaned_pages[:5])
    mission = detect_mission(first_pages_text)

    # Detect instruments mentioned anywhere in the document
    instruments = find_instruments(cleaned_pages)

    # 4. Create observation objects (per page)
    # ------------------------------------------------------------------
    observations = create_observations(
        pages=cleaned_pages,
        instruments=instruments,
        entities=entities,
        pdf_name=filename,
    )

    # 5. Build structured pages list for MongoDB & RAG
    # ------------------------------------------------------------------
    pages_struct = [
        {
            "page_number": idx + 1,
            "text": text,
        }
        for idx, text in enumerate(cleaned_pages)
        if text  # skip completely empty pages
    ]

    # 6. Return full data in unified structure
    # ------------------------------------------------------------------
    document_data: Dict[str, Any] = {
        "file_name": filename,
        "mission": mission,
        "instruments": instruments,
        "metadata": metadata,
        "entities": entities,                  # global entities summary
        "tables": stringify_keys(tables),      # ensure Mongo-safe keys
        "pages": pages_struct,                 # page-level text
        "pages_count": len(pages_struct),
    }

    return {
        "document": document_data,
        "observations": observations,
    }
