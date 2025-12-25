from fastapi import APIRouter, HTTPException
from database import db
from datetime import datetime

router = APIRouter()

# GET all missions (already exists, keep it)
@router.get("")
async def get_all_missions():
    try:
        missions = await db.documents.find({}).to_list(None)
        if not missions:
            return []
        for mission in missions:
            mission["_id"] = str(mission["_id"])
        return missions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# NEW: Get mission summary with all data
@router.get("/{mission}")
async def get_mission_summary(mission: str):
    doc = await db.documents.find_one({"mission": mission})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    doc["_id"] = str(doc["_id"])
    return doc


# NEW: Get entities summary
@router.get("/{mission}/entities/summary")
async def get_entities_summary(mission: str):
    doc = await db.documents.find_one(
        {"mission": mission},
        {"entities": 1}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    entities = doc.get("entities", {})
    return {
        "measurements": entities.get("measurements", []),
        "dates": entities.get("dates", []),
        "mission_phases": entities.get("mission_phases", []),
        "coordinates": entities.get("coordinates", []),
    }


# NEW: Get specific page content
@router.get("/{mission}/page/{page_number}")
async def get_page_content(mission: str, page_number: int):
    doc = await db.documents.find_one(
        {"mission": mission},
        {"pages": 1}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    pages = doc.get("pages", [])
    if page_number < 1 or page_number > len(pages):
        raise HTTPException(status_code=404, detail="Page not found")
    
    return {"page_number": page_number, "content": pages[page_number - 1]}


# GET instruments (already exists, keep it)
@router.get("/{mission}/instruments")
async def get_instruments(mission: str):
    doc = await db.documents.find_one({"mission": mission}, {"instruments": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    return doc.get("instruments", [])


# NEW: Get instrument details
@router.get("/{mission}/instruments/{instrument_name}/details")
async def get_instrument_details(mission: str, instrument_name: str):
    doc = await db.documents.find_one({"mission": mission})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    pages = doc.get("pages", [])
    entities = doc.get("entities", {})
    
    # Find pages mentioning this instrument
    pages_mentioned = []
    for idx, page in enumerate(pages):
        if instrument_name.lower() in page.lower():
            pages_mentioned.append(idx + 1)
    
    # Get measurements
    measurements = entities.get("measurements_per_page", [])
    if isinstance(measurements, list) and measurements and isinstance(measurements[0], list):
        measurements = list(set([m for sublist in measurements for m in sublist if m]))
    
    return {
        "instrument_name": instrument_name,
        "pages_mentioned": pages_mentioned,
        "measurements": measurements[:20],  # Top 20
    }


# GET phases (already exists, update it)
@router.get("/{mission}/phases")
async def get_mission_phases(mission: str):
    doc = await db.documents.find_one({"mission": mission}, {"entities": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    entities = doc.get("entities", {})
    
    # Try the new key first
    phases = entities.get("mission_phases", [])
    
    # Fallback to old key if it exists
    if not phases:
        phases = entities.get("mission_phases_per_page", [])
    
    # Ensure it's a flat list
    if isinstance(phases, list) and phases and isinstance(phases[0], list):
        phases = list(set([p for sublist in phases for p in sublist if p]))
    
    return phases

@router.get("/debug/{mission}")
async def debug_mission(mission: str):
    """Debug endpoint to see all data for a mission"""
    doc = await db.documents.find_one({"mission": mission})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    doc["_id"] = str(doc["_id"])
    
    return {
        "mission": doc.get("mission"),
        "entities_keys": list(doc.get("entities", {}).keys()),
        "full_entities": doc.get("entities", {}),
        "all_document_keys": list(doc.keys())
    }


# GET tables (already exists, keep it)
@router.get("/{mission}/tables")
async def get_tables(mission: str):
    doc = await db.documents.find_one({"mission": mission}, {"tables": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    tables = doc.get("tables", [])
    if isinstance(tables, dict):
        tables = [tables]
    
    return tables
