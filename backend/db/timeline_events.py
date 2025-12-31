from datetime import datetime
from database import db

timeline_collection = db["timeline_events"]

def insert_timeline_events(events, mission_id, document_name):
    docs = []

    for e in events:
        docs.append({
            "mission_id": mission_id,
            "date": e["date"],
            "event_type": e["event_type"],
            "label": e["label"],
            "entities": e.get("entities", {}),
            "source": {
                "document": document_name,
                "page": e.get("source_page")
            },
            "created_at": datetime.utcnow()
        })

    if docs:
        timeline_collection.insert_many(docs)
