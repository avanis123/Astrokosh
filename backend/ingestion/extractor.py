import fitz  # PyMuPDF

def extract_text(pdf_path: str) -> str:
    """Extract raw text from a PDF file."""
    text_chunks = []
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text_chunks.append(page.get_text("text"))
    except Exception as e:
        print("Error while extracting:", e)

    return "\n\n".join(text_chunks)
