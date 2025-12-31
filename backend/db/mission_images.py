from database import db


async def insert_mission_images(images: list):
    if not images:
        return
    await db.mission_images.insert_many(images)


async def get_mission_images(mission: str):
    return await db.mission_images.find(
        {"mission": mission},
        {"_id": 0}
    ).to_list(length=None)
