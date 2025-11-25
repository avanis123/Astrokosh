def create_observations(pages, instruments, entities, pdf_name):
    observations = []

    for page_number, text in enumerate(pages, start=1):
        if not text:
            continue

        # Instruments on this page
        page_instruments = [
            inst for inst in instruments if inst.lower() in text.lower()
        ]

        # Other extracted entities
        page_meas = entities.get("measurements", [])
        page_dates = entities.get("dates", [])
        page_phases = entities.get("mission_phases", [])
        page_coords = entities.get("coordinates", [])

        # If nothing useful → skip page
        if not (page_instruments or page_meas or page_dates or page_phases):
            continue

        # Build observation combinations
        for inst in page_instruments:
            for meas in page_meas or [None]:
                for date in page_dates or [None]:
                    for phase in page_phases or ["Unknown Phase"]:
                        observations.append({
                            "instrument": inst,
                            "measurement": meas,
                            "date": date,
                            "phase": phase,
                            "coordinates": page_coords[0] if page_coords else None,
                            "pdf_name": pdf_name,
                            "page_number": page_number
                        })

    return observations
