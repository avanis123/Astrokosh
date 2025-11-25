from fastapi import APIRouter, HTTPException
from database import db
import re

router = APIRouter()

# -------------------------------------------------
# 1. Global Keyword Search
# -------------------------------------------------
@router.get("/")
async def search_global(q: str):
    regex = re.compile(q, re.IGNORECASE)

    results = await db.documents.find({
        "$or": [
            {"file_name": regex},
            {"mission": regex},
            {"instruments": regex},
            {"entities.spacy_entities.text": regex},
            {"entities.measurements": regex},
            {"metadata.author": regex},
            {"metadata.keywords": regex},
        ]
    }).to_list(50)

    # Convert ObjectId to string
    for r in results:
        r["_id"] = str(r["_id"])

    return {"query": q, "results": results}


# -------------------------------------------------
# 2. Mission Search
# -------------------------------------------------
@router.get("/mission")
async def search_mission(name: str):
    regex = re.compile(name, re.IGNORECASE)

    results = await db.documents.find({"mission": regex}).to_list(20)

    for r in results:
        r["_id"] = str(r["_id"])

    return results


# -------------------------------------------------
# 3. Instrument Search
# -------------------------------------------------
@router.get("/instrument")
async def search_instrument(name: str):
    regex = re.compile(name, re.IGNORECASE)

    results = await db.documents.find({
        "instruments": regex
    }).to_list(20)

    for r in results:
        r["_id"] = str(r["_id"])

    return results


# -------------------------------------------------
# 4. Page-Level Text Search
# -------------------------------------------------
@router.get("/pages")
async def search_pages(mission: str, q: str):
    doc = await db.documents.find_one({"mission": mission})

    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")

    pages = doc.get("pages", [])
    found_pages = []

    for page in pages:
        if q.lower() in page["text"].lower():
            found_pages.append({
                "page_number": page["page_number"],
                "text": page["text"][:500] + " ..."
            })

    return {
        "mission": mission,
        "query": q,
        "matches": found_pages
    }
