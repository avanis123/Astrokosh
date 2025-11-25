from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
from database import db
from utils.extractor_pipeline import process_pdf_pipeline

router = APIRouter()

UPLOAD_DIR = "uploaded_pdfs/"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    # 1. Save the uploaded PDF
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 2. Run extraction pipeline
    extracted_data = process_pdf_pipeline(file_path)

    # Extract outputs
    document_data = extracted_data["document"]
    observations = extracted_data["observations"]

    # 3. Insert into MongoDB
    await db.documents.insert_one(document_data)

    if observations:
        await db.observations.insert_many(observations)

    return {
        "status": "Success",
        "file_name": file.filename,
        "mission": document_data.get("mission"),
        "observations_inserted": len(observations),
        "message": "PDF processed and stored"
    }
