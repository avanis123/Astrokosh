from fastapi import APIRouter
from utils.temporal_event_builder import build_temporal_events

router = APIRouter()

@router.get("/missions/{mission_id}/timeline")
def get_mission_timeline(mission_id: str):
    events = build_temporal_events(
        pages = load_pdf_pages(mission_id),
        mission_name=mission_id
    )

    return {
        "mission": mission_id,
        "total_events": len(events),
        "events": events
    }
