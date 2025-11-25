from database import db
from typing import List, Dict, Any
import re

# -----------------------------------------
# 1. Normalize helper
# -----------------------------------------
def normalize(text: str):
    return text.lower().strip()


# -----------------------------------------
# 2. Keyword search inside pages of a PDF
# -----------------------------------------
async def search_keywords_across_missions(query: str) -> List[Dict]:
    q_norm = normalize(query)
    results = []

    cursor = db.documents.find({})
    docs = await cursor.to_list(length=None)

    for doc in docs:
        pages = doc.get("pages", [])
        matched_pages = []

        for i, page in enumerate(pages):
            if q_norm in page.lower():
                matched_pages.append({
                    "page_number": i + 1,
                    "text": page[:600] + "..."  # preview
                })

        if matched_pages:
            results.append({
                "mission": doc.get("mission"),
                "file_name": doc.get("file_name"),
                "matches": matched_pages
            })

    return results


# -----------------------------------------
# 3. Mission overview lookup
# -----------------------------------------
async def get_mission_overview(name: str):
    q = normalize(name)

    cursor = db.documents.find({})
    docs = await cursor.to_list(length=None)

    best_match = None

    for doc in docs:
        mission_name = normalize(doc.get("mission", ""))
        if q in mission_name:
            best_match = doc
            break

    if not best_match:
        return None

    return {
        "mission": best_match["mission"],
        "instruments": best_match["instruments"],
        "phases": best_match["entities"].get("mission_phases", []),
        "summary": best_match["pages"][0][:1000] + "..." if best_match["pages"] else "No text"
    }


# -----------------------------------------
# 4. Retrieve instruments across all missions
# -----------------------------------------
async def find_instrument_globally(name: str):
    q = normalize(name)

    cursor = db.documents.find({})
    docs = await cursor.to_list(length=None)

    results = []

    for doc in docs:
        insts = doc.get("instruments", [])
        for inst in insts:
            if q in inst.lower():
                results.append({
                    "mission": doc["mission"],
                    "instrument": inst
                })

    return results


# -----------------------------------------
# 5. Measurements (units like km, nm, keV, etc.)
# -----------------------------------------
async def find_measurements(query: str):
    q_norm = normalize(query)

    cursor = db.documents.find({})
    docs = await cursor.to_list(length=None)

    results = []

    for doc in docs:
        measurements = doc.get("entities", {}).get("measurements", [])
        
        matched = [m for m in measurements if q_norm in m.lower()]
        if matched:
            results.append({
                "mission": doc["mission"],
                "matches": matched
            })

    return results


# -----------------------------------------
# 6. Concept lookup (global search)
# -----------------------------------------
async def concept_lookup(query: str):
    return await search_keywords_across_missions(query)


# -----------------------------------------
# 7. Observations lookup (tables + text)
# -----------------------------------------
async def get_observations_global(query: str):
    q_norm = normalize(query)

    cursor = db.documents.find({})
    docs = await cursor.to_list(length=None)

    results = []

    for doc in docs:
        pages = doc.get("pages", [])
        tables = doc.get("tables", [])

        page_hits = []
        for i, page in enumerate(pages):
            if q_norm in page.lower():
                page_hits.append({"page": i+1, "text": page[:400] + "..."})

        table_hits = []
