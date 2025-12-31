from fastapi import APIRouter, HTTPException
from db.mission_images import get_mission_images

router = APIRouter()

@router.get("/missions/{mission}/images")
async def fetch_mission_images(mission: str):
    images = await get_mission_images(mission)

    if not images:
        raise HTTPException(
            status_code=404,
            detail="No images found for this mission"
        )

    return {
        "mission": mission,
        "total_images": len(images),
        "images": images
    }
