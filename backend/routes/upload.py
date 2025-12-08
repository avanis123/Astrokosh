from fastapi import APIRouter, UploadFile, File, HTTPException
from database import db
from datetime import datetime
from utils.extractor_pipeline import process_pdf_pipeline
import os

router = APIRouter()

# Create temp directory if it doesn't exist
os.makedirs("temp", exist_ok=True)


@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = None
    try:
        # 1. Save file temporarily
        file_path = f"temp/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # 2. Process pipeline (computes hash internally)
        extracted_data = process_pdf_pipeline(file_path)
        
        pdf_hash = extracted_data["document"]["pdf_hash"]
        mission = extracted_data["document"]["mission"]
        filename = extracted_data["document"]["file_name"]

        # 3. Check if hash already exists (deduplication)
        existing = await db.documents.find_one({"pdf_hash": pdf_hash})
        
        if existing:
            # Clean up temp file
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            return {
                "status": "Duplicate",
                "message": "This file was already uploaded",
                "file_name": filename,
                "mission": mission
            }

        # 4. Insert document into MongoDB (use 'documents' collection)
        doc_result = await db.documents.insert_one(extracted_data["document"])

        # 5. Clean up temp file
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        return {
            "status": "Success",
            "file_name": filename,
            "mission": mission,
            "observations_inserted": len(extracted_data["observations"]),
            "message": "PDF processed and stored"
        }

    except Exception as e:
        # Clean up on error
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{pdf_hash}/info")
async def get_upload_info(pdf_hash: str):
    """Get upload info for a specific PDF hash"""
    try:
        doc = await db.documents.find_one({"pdf_hash": pdf_hash})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "mission": doc.get("mission"),
            "file_name": doc.get("file_name"),
            "pages_count": doc.get("pages_count"),
            "instruments_count": len(doc.get("instruments", [])),
            "tables_count": len(doc.get("tables", [])),
            "is_duplicate": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))