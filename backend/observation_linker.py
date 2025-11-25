def create_observations(cleaned_text, instruments, entities, filename):
    """
    Very simple version:
    Creates one observation per page + extracted entities.
    You can expand this later.
    """

    observations = []

    for i, page in enumerate(cleaned_text):
        observations.append({
            "file": filename,
            "page": i + 1,
            "text": page,
            "instruments_found": instruments,
            "entities_found": entities
        })

    return observations
