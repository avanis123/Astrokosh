from fastapi import APIRouter, UploadFile, File, HTTPException
from database import db
from utils.extractor_pipeline import process_pdf_pipeline
from rag.indexer import index_single_document
from utils.image_extractor import extract_images_from_pdf
from db.mission_images import insert_mission_images
import os


router = APIRouter()

# Always use absolute path
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded_pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # 1️⃣ Save PDF
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # 2️⃣ Extract content
        extracted_data = process_pdf_pipeline(file_path)

        document = extracted_data["document"]
        observations = extracted_data["observations"]

        # ---- Image extraction (NEW FEATURE) ----
        IMAGE_BASE_DIR = os.path.join(BASE_DIR, "extracted_images")
        mission_name = document.get("mission") or "unknown_mission"
        mission_dir = os.path.join(IMAGE_BASE_DIR, mission_name)

        images = extract_images_from_pdf(
            pdf_path=file_path,
            output_dir=mission_dir,
            mission=mission_name
        )

        print(f"Extracted {len(images)} images")
        # ---- Store image metadata in MongoDB ----
        for img in images:
            img["image_path"] = f"/static/images/{mission_name}/{img['image_name']}"

        await insert_mission_images(images)


        pdf_hash = document.get("pdf_hash")

        # 3️⃣ Deduplication
        if pdf_hash:
            existing = await db.documents.find_one({"pdf_hash": pdf_hash})
            if existing:
               return {
                   "status": "Duplicate",
                    "message": "This PDF was already uploaded",
                    "mission": document.get("mission"),
                }

        # 4️⃣ Store document
        result = await db.documents.insert_one(document)
        doc_id = str(result.inserted_id)

        # 5️⃣ Store observations
        if observations:
            await db.observations.insert_many(observations)

        # 6️⃣ Build & store temporal events (for dashboard)
        pages_text = [p["text"] for p in document["pages"]]

        mission_id = document.get("mission") or "unknown_mission"

        # 6️⃣ Index for RAG
        await index_single_document(doc_id)

        return {
            "status": "Success",
            "file_name": document.get("file_name"),
            "mission": document.get("mission"),
            "observations_inserted": len(observations),
            "message": "PDF processed, stored, and indexed successfully",
        }

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reindex")
async def reindex():
    from rag.indexer import index_all_documents
    return await index_all_documents()
