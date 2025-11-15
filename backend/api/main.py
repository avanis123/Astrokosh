from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import os, shutil

from ingestion.process_pdf import process_pdf

app = FastAPI()
UPLOAD_DIR = "../incoming_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload_pdf")
async def upload_pdf(pdf: UploadFile = File(...), mission: str = None):

    file_path = os.path.join(UPLOAD_DIR, pdf.filename)

    # Save uploaded file
    with open(file_path, "wb") as f:
        shutil.copyfileobj(pdf.file, f)

    # Run pipeline
    process_pdf(file_path, mission_name=mission)

    return JSONResponse({"status": "success", "file": pdf.filename})
