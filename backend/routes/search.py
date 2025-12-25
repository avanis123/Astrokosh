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


@router.get("/measurements")
async def search_measurements(q: str):
    """Search for measurements across all missions"""
    try:
        missions = await db.documents.find({}).to_list(None)
        results = []
        
        for doc in missions:
            entities = doc.get("entities", {})
            measurements = entities.get("measurements_per_page", [])
            
            if isinstance(measurements, list) and measurements:
                flat_measurements = [m for sublist in measurements for m in (sublist if isinstance(sublist, list) else [sublist])]
                matches = [m for m in flat_measurements if q.lower() in str(m).lower()]
                
                if matches:
                    results.append({
                        "mission": doc.get("mission"),
                        "file_name": doc.get("file_name"),
                        "measurements_found": len(matches),
                        "sample_matches": matches[:3]
                    })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/people")
async def search_people(q: str):
    """Search for people across all missions"""
    try:
        # This depends on your NER extraction
        # Adjust based on your entities structure
        missions = await db.documents.find({}).to_list(None)
        results = []
        
        for doc in missions:
            entities = doc.get("entities", {})
            # Adjust key based on your NER output
            people = entities.get("people_per_page", [])
            
            if isinstance(people, list) and people:
                flat_people = [p for sublist in people for p in (sublist if isinstance(sublist, list) else [sublist])]
                matches = [p for p in flat_people if q.lower() in str(p).lower()]
                
                if matches:
                    results.append({
                        "mission": doc.get("mission"),
                        "file_name": doc.get("file_name"),
                        "people_found": len(matches),
                        "sample_matches": matches[:3]
                    })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/coordinates")
async def search_coordinates(q: str):
    """Search for coordinates across all missions"""
    try:
        missions = await db.documents.find({}).to_list(None)
        results = []
        
        for doc in missions:
            entities = doc.get("entities", {})
            coordinates = entities.get("coordinates_per_page", [])
            
            if isinstance(coordinates, list) and coordinates:
                flat_coords = [c for sublist in coordinates for c in (sublist if isinstance(sublist, list) else [sublist])]
                matches = [c for c in flat_coords if q.lower() in str(c).lower()]
                
                if matches:
                    results.append({
                        "mission": doc.get("mission"),
                        "file_name": doc.get("file_name"),
                        "coordinates_found": len(matches),
                        "sample_matches": matches[:3]
                    })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))