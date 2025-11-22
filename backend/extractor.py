import pdfplumber
import fitz  # PyMuPDF
import camelot
import os
import json
from ner_pipeline import extract_entities_from_pages

DATA_RAW = "../data_raw/"
DATA_PROCESSED = "../data_processed/"

def extract_text(pdf_path):
    text_pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text_pages.append(page.extract_text())
    return text_pages

def extract_metadata(pdf_path):
    doc = fitz.open(pdf_path)
    return doc.metadata

def extract_tables(pdf_path):
    try:
        tables = camelot.read_pdf(pdf_path, pages="all", suppress_stdout=True)
        return [table.df.to_dict() for table in tables]
    except Exception as e:
        print("Camelot error:", e)
        return []

def clean_text(text_list):
    cleaned = []
    for page in text_list:
        if page:
            cleaned.append(" ".join(page.split()))
    return cleaned

def process_pdf(pdf_file):
    pdf_path = DATA_RAW + pdf_file

    print(f"Processing: {pdf_file}")

    from utils_text import clean_pages
    from mission_detector import detect_mission
    from instrument_detector import find_instruments

    raw_text = extract_text(pdf_path)
    metadata = extract_metadata(pdf_path)
    tables = extract_tables(pdf_path)
    cleaned_text = clean_pages(raw_text)
    entities = extract_entities_from_pages(cleaned_text)

    mission = detect_mission(" ".join(cleaned_text[:5]))  # scan first 5 pages
    instruments = find_instruments(cleaned_text)


    output = {
        "file_name": pdf_file,
        "mission": mission,
        "instruments": instruments,
        "entities": entities,
        "metadata": metadata,
        "pages": cleaned_text,
        "tables": tables
    }

    with open(DATA_PROCESSED + pdf_file.replace(".pdf", ".json"), "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Saved: {pdf_file.replace('.pdf', '.json')}")


if __name__ == "__main__":
    for file in os.listdir(DATA_RAW):
        if file.endswith(".pdf"):
            process_pdf(file)
