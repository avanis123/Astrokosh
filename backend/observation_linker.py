def create_observations(pages, instruments, entities, pdf_name):
    observations = []

    page_count = len(pages)

    for i in range(page_count):
        text = pages[i]

        page_instruments = [inst for inst in instruments if inst.lower() in text.lower()]
        page_meas = entities.get("measurements", [])
        page_dates = entities.get("dates", [])
        page_phases = entities.get("mission_phases", [])
        page_coords = entities.get("coordinates", [])

        # Only create observations if there's useful info on the page
        if page_instruments or page_meas or page_dates or page_phases:

            # For each instrument mentioned, create entries
            for inst in page_instruments:

                # measurement may be multiple, same for dates & phases
                for meas in page_meas:
                    for date in page_dates:
                        for phase in page_phases or ["Unknown Phase"]:
                            observations.append({
                                "instrument": inst,
                                "measurement": meas,
                                "date": date,
                                "phase": phase,
                                "coordinates": page_coords[0] if page_coords else None,
                                "pdf_name": pdf_name,
                                "page_number": i + 1
                            })

    return observations
