from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter()

@router.get("/{mission}")
async def get_mission_summary(mission: str):
    doc = await db.documents.find_one({"mission": mission})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/{mission}/instruments")
async def get_instruments(mission: str):
    doc = await db.documents.find_one({"mission": mission}, {"instruments": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    return doc.get("instruments", [])


@router.get("/{mission}/phases")
async def get_mission_phases(mission: str):
    doc = await db.documents.find_one({"mission": mission}, {"entities.mission_phases": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    return doc.get("entities", {}).get("mission_phases", [])


@router.get("/{mission}/tables")
async def get_tables(mission: str):
    doc = await db.documents.find_one({"mission": mission}, {"tables": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Mission not found")
    return doc.get("tables", [])
