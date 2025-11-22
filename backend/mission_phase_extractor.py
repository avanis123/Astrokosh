import re

MISSION_PHASE_PATTERNS = [
    # Launch
    r"Launch Phase",
    r"Lift[- ]?off",
    r"Separation Event",

    # Earth-bound phases
    r"Earth[- ]?Bound Phase",
    r"Earth[- ]?bound Orbit",
    r"EBO[- ]?\d+",
    r"EBD[- ]?\d+",
    r"Earth[- ]?bound Maneuver",

    # Orbit raising
    r"Orbit[- ]?Raising Phase",
    r"Orbit[- ]?raising Maneuver",
    r"OBR[- ]?\d+",

    # TLI / Injection
    r"Trans[- ]?Lunar Injection",
    r"Trans[- ]?Lunar[- ]?Insertion",
    r"TLI[- ]?\d*",
    r"TLI Maneuver",
    r"TLI Burn",
    r"TLI Operation",

    # Lunar Orbit Insertion
    r"Lunar Orbit Insertion",
    r"LOI[- ]?\d*",
    r"LOI Maneuver",
    r"LOI Burn",

    # Lunar Bound Phase
    r"Lunar[- ]?Bound Phase",
    r"Lunar[- ]?Transfer Phase",

    # Science / payload
    r"Science Phase",
    r"Science Operations Phase",
    r"Payload Commissioning Phase",
    r"Commissioning Phase",

    # Cruise / Sun acquisition
    r"Cruise Phase",
    r"Sun Acquisition",
    r"Detumble Phase",
]

def extract_mission_phases(text):
    phases = []
    for pattern in MISSION_PHASE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        phases.extend(matches)
    return list(set([p.strip() for p in phases]))
