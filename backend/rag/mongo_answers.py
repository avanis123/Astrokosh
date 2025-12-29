# backend/mongo_answers.py
from database import db
from utils.mission_detector import detect_mission


async def answer_from_mongo(intent: str, question: str):
    """
    Handles factual questions using MongoDB.
    Returns (answer: str, found: bool)
    """

    # 1️⃣ Detect mission from question
    mission = detect_mission(question)

    if mission != "Unknown":
        doc = await db.documents.find_one({"mission": mission})
    else:
        # 🔥 Fallback: most recent document
        doc = await db.documents.find_one(sort=[("_id", -1)])

    if not doc:
        return None, False

    mission_name = doc.get("mission", "the mission")

    # 2️⃣ PAYLOAD / INSTRUMENTS
    if intent == "PAYLOAD":
        instruments = doc.get("instruments", [])
        if instruments:
            answer = f"The instruments used in {mission_name} include:\n"
            answer += "\n".join(f"- {i}" for i in instruments)
            return answer, True

    # 3️⃣ MISSION PHASES
    if intent == "MISSION_PHASES":
        phases = doc.get("entities", {}).get("mission_phases", [])
        if phases:
            answer = f"The mission phases of {mission_name} include:\n"
            answer += "\n".join(f"- {p}" for p in phases)
            return answer, True

    # ❌ Not found → allow RAG to handle
    return None, False
