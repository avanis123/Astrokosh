from utils.temporal_event_builder import build_temporal_events

# Simulate extracted PDF pages (use real text if possible)
pages = [
    "The mission entered the Launch Phase on 22 July 2019. "
    "The spacecraft reached an altitude of 100 km.",

    "On 20 August 2019, the Orbital Phase began. "
    "The OHRC instrument started imaging operations."
]

events = build_temporal_events(pages, mission_name="Test Mission")

print(f"Total events created: {len(events)}\n")

for e in events:
    print("----- EVENT -----")
    print("Date:", e["date"])
    print("Type:", e["event_type"])
    print("Label:", e["label"])
    print("Page:", e["source_page"])
