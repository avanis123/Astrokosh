import fitz         # PyMuPDF
import pdfplumber
import camelot
import os
from typing import List, Dict, Any


# ---------------------------------------------------------
# 1. TEXT EXTRACTION (Page-wise)
# ---------------------------------------------------------
def extract_text(pdf_path: str) -> List[str]:
    """
    Extract text with OCR fallback for scanned PDFs.
    First tries PyMuPDF (fast), then falls back to OCR if needed.
    """
    import pdfplumber
    
    pages = []
    
    # Step 1: Try PyMuPDF extraction
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text = page.get_text("text")
                text = text.strip() if text else ""
                pages.append(text)
    except Exception as e:
        print(f"❌ PyMuPDF extraction failed: {e}")
        pages = []
    
    # Step 2: Check if extraction was successful
    if not pages:
        print("⚠️  PyMuPDF returned no pages, checking for scanned PDF...")
        non_empty_pages = sum(1 for p in pages if len(p.strip()) > 20)
    else:
        non_empty_pages = sum(1 for p in pages if len(p.strip()) > 20)
    
    # Step 3: If <40% of pages have meaningful text, try OCR
    total_pages = len(pages)
    if total_pages == 0 or non_empty_pages < max(1, total_pages * 0.4):
        print(f"⚠️  Only {non_empty_pages}/{total_pages} pages have text (scanned PDF detected)")
        print("🔄 Attempting OCR extraction...")
        
        try:
            ocr_pages = extract_text_ocr(pdf_path)
            if ocr_pages and sum(1 for p in ocr_pages if len(p.strip()) > 20) > non_empty_pages:
                print(f"✅ OCR successful: {len(ocr_pages)} pages extracted")
                return ocr_pages
        except Exception as e:
            print(f"❌ OCR failed: {e}")
    
    # Step 4: Return best effort
    if not pages:
        print("❌ Could not extract text from PDF")
        return []
    
    print(f"✅ Extracted {total_pages} pages ({non_empty_pages} with content)")
    return pages


# ---------------------------------------------------------
# 2. METADATA EXTRACTION
# ---------------------------------------------------------
def extract_metadata(pdf_path: str) -> Dict[str, Any]:
    """
    Extract metadata such as title, author, creation date, etc.
    """
    with fitz.open(pdf_path) as doc:
        meta = doc.metadata or {}

    return {
        "title": meta.get("title"),
        "author": meta.get("author"),
        "subject": meta.get("subject"),
        "keywords": meta.get("keywords"),
        "creation_date": meta.get("creationDate"),
        "modification_date": meta.get("modDate"),
        "producer": meta.get("producer"),
        "encrypted": meta.get("encrypted", False),
    }


# ---------------------------------------------------------
# 3. TABLE EXTRACTION (Camelot)
# ---------------------------------------------------------
def extract_tables(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Extract tables using Camelot (works well for digital PDFs).
    Returns list of tables with their data as lists of rows.
    """
    extracted_tables = []

    try:
        tables = camelot.read_pdf(pdf_path, pages="all", flavor="lattice")
    except Exception:
        # fallback to Stream mode (less accurate but works on more PDFs)
        try:
            tables = camelot.read_pdf(pdf_path, pages="all", flavor="stream")
        except Exception:
            return []

    for t in tables:
        extracted_tables.append({
            "page": t.page,
            "rows": t.data,
            "shape": t.shape,
        })

    return extracted_tables


# ---------------------------------------------------------
# 4. OPTIONAL OCR FALLBACK (for scanned PDFs)
# ---------------------------------------------------------
def is_scanned(pdf_path: str) -> bool:
    """
    Checks if PDF pages have little/no digital text.
    If so, likely a scanned document → needs OCR.
    """
    with pdfplumber.open(pdf_path) as pdf:
        sample_pages = pdf.pages[:3]  # check first 3 pages

        for page in sample_pages:
            text = page.extract_text()
            if text and len(text.strip()) > 10:
                return False  # digital text exists

    return True  # likely scanned


# (Optional) OCR extraction
def extract_text_ocr(pdf_path: str) -> List[str]:
    """
    Fallback OCR using Tesseract for scanned PDFs.
    Only used if absolutely required.
    """
    try:
        import pytesseract
        from pdf2image import convert_from_path
    except ImportError:
        print("⚠ OCR not available (install pytesseract + pdf2image)")
        return []

    images = convert_from_path(pdf_path)
    pages = []

    for img in images:
        text = pytesseract.image_to_string(img)
        pages.append(text)

    return pages
