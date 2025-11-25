INSTRUMENT_LIST = [
    "XSM", "IIRS", "SAR", "SUIT", "VELC", "SXT",
    "UVIT", "LAXPC", "CZT", "HEL1OS", "SWIS", "MAG"
]

def find_instruments(text_blocks):
    found = set()
    for page in text_blocks:
        for inst in INSTRUMENT_LIST:
            if inst.lower() in page.lower():
                found.add(inst)
    return list(found)
