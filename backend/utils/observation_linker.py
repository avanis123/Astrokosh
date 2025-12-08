def create_observations(pages, instruments, entities, pdf_name, pdf_hash):
    """
    Create structured observations linking instruments, measurements,
    dates, phases, and coordinates for each page of the PDF.
    
    'entities' is expected to be a dict of lists indexed per-page:
        entities = {
            "measurements_per_page": [...],
            "dates_per_page": [...],
            "mission_phases_per_page": [...],
            "coordinates_per_page": [...]
        }
    """

    observations = []

    # Extract per-page entity lists
    meas_pages = entities.get("measurements_per_page", [])
    date_pages = entities.get("dates_per_page", [])
    phase_pages = entities.get("mission_phases_per_page", [])
    coord_pages = entities.get("coordinates_per_page", [])

    total_pages = len(pages)

    # Ensure entity lists have same length as pages
    def safe_get(lst, idx):
        return lst[idx] if idx < len(lst) else []

    for page_number, text in enumerate(pages, start=1):
        if not text:
            continue

        page_idx = page_number - 1   # 0-based index

        # Detect instruments present on this page
        page_instruments = [
            inst for inst in instruments if inst.lower() in text.lower()
        ]

        # Extract entities for this page
        page_meas = safe_get(meas_pages, page_idx)
        page_dates = safe_get(date_pages, page_idx)
        page_phases = safe_get(phase_pages, page_idx)
        page_coords = safe_get(coord_pages, page_idx)

        # Skip if nothing important exists on this page
        if not (page_instruments or page_meas or page_dates or page_phases):
            continue

        # Build observation combinations EXACTLY like your original logic
        for inst in page_instruments:
            for meas in (page_meas or [None]):
                for date in (page_dates or [None]):
                    for phase in (page_phases or ["Unknown Phase"]):
                        observations.append({
                            "pdf_name": pdf_name,
                            "pdf_hash": pdf_hash,        # NEW
                            "page_number": page_number,
                            "instrument": inst,
                            "measurement": meas,
                            "date": date,
                            "phase": phase,
                            "coordinates": page_coords[0] if page_coords else None
                        })

    return observations
