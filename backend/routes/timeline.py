from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter()

@router.get("/missions/{mission_id}/timeline")
async def get_mission_timeline(mission_id: str):
    events = await db.timeline_events.find(
        {"mission_id": mission_id},
        {"_id": 0}
    ).sort("date", 1).to_list(length=None)

    if not events:
        raise HTTPException(
            status_code=404,
            detail="No timeline events found for this mission"
        )

    return {
        "mission": mission_id,
        "total_events": len(events),
        "events": events
    }
