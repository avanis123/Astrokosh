import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil

from ingestion.process_pdf import process_pdf


app = FastAPI()

# Correct upload path
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "incoming_pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...), mission: str = None):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save the PDF
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Run the pipeline and capture summary
    summary = process_pdf(file_path, mission_name=mission)

    return {
        "status": "success",
        "filename": file.filename,
        "mission": mission or file.filename,
        "chunks": summary["chunks"],
        "text_length": summary["text_length"]
    }

