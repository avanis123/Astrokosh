import re

# --- Helper patterns ---

# Number: 123, 123.45, 1.2e5, 1.2E-5, 5×10^5, 5 x 10^5
NUMBER_BASIC = r"\d+(?:\.\d+)?"
SCI_NOTATION = r"(?:\d+(?:\.\d+)?\s*(?:[eE][+-]?\d+|(?:×|x)\s*10\^?-?\d+))"
NUMBER_OR_SCI = rf"(?:{NUMBER_BASIC}|{SCI_NOTATION})"

# Range: 0.3–7, 0.3-7, 0.3 to 7
RANGE = rf"{NUMBER_OR_SCI}\s*(?:–|-|to)\s*{NUMBER_OR_SCI}"

# ± uncertainty: 2.3 ± 0.2, 2.3+/-0.2
PLUS_MINUS = rf"{NUMBER_OR_SCI}\s*(?:±|\+/-)\s*{NUMBER_OR_SCI}"

# --- Units of interest ---

ENERGY_UNITS = r"(?:eV|keV|MeV|GeV)"
WAVELENGTH_UNITS = r"(?:nm|μm|um|Å|Angstroms?)"
SPEED_UNITS = r"(?:km/s|m/s)"
DIST_UNITS = r"(?:km|m|AU)"
FLUX_UNITS = r"(?:W/?m(?:\^?-?2)|photons?/cm\^?-?2/s|cm\^?-?2/s|nT|Gauss|G)"
DENSITY_UNITS = r"(?:cm\^?-?3|cm-3|cm\^-3|particles/cm\^?-?3)"

# --- Combined patterns: ranges, ±, single values with units ---

PATTERNS = [

    # Energy ranges and values
    rf"\b{RANGE}\s*{ENERGY_UNITS}\b",
    rf"\b{PLUS_MINUS}\s*{ENERGY_UNITS}\b",
    rf"\b{NUMBER_OR_SCI}\s*{ENERGY_UNITS}\b",

    # Wavelength ranges and values
    rf"\b{RANGE}\s*{WAVELENGTH_UNITS}\b",
    rf"\b{PLUS_MINUS}\s*{WAVELENGTH_UNITS}\b",
    rf"\b{NUMBER_OR_SCI}\s*{WAVELENGTH_UNITS}\b",

    # Speeds
    rf"\b{RANGE}\s*{SPEED_UNITS}\b",
    rf"\b{PLUS_MINUS}\s*{SPEED_UNITS}\b",
    rf"\b{NUMBER_OR_SCI}\s*{SPEED_UNITS}\b",

    # Distances
    rf"\b{RANGE}\s*{DIST_UNITS}\b",
    rf"\b{PLUS_MINUS}\s*{DIST_UNITS}\b",
    rf"\b{NUMBER_OR_SCI}\s*{DIST_UNITS}\b",

    # Flux / intensity / magnetic field
    rf"\b{RANGE}\s*{FLUX_UNITS}\b",
    rf"\b{PLUS_MINUS}\s*{FLUX_UNITS}\b",
    rf"\b{NUMBER_OR_SCI}\s*{FLUX_UNITS}\b",

    # Densities
    rf"\b{RANGE}\s*{DENSITY_UNITS}\b",
    rf"\b{PLUS_MINUS}\s*{DENSITY_UNITS}\b",
    rf"\b{NUMBER_OR_SCI}\s*{DENSITY_UNITS}\b",
]

COMPILED_PATTERNS = [re.compile(p) for p in PATTERNS]


def extract_measurements(text: str):
    """
    Extract advanced scientific measurements from text:
    - 0.3–7 keV
    - 2.3 ± 0.2 MeV
    - 200–800 nm
    - 450 km/s
    - 1180 W/m^2
    - 5 × 10^5 photons/cm^2/s
    - 4e-3 W/m2
    """
    results = set()

    if not text:
        return []

    for pattern in COMPILED_PATTERNS:
        for match in pattern.findall(text):
            if isinstance(match, tuple):
                # If regex returned groups, join them
                s = " ".join([m for m in match if m]).strip()
            else:
                s = match.strip()
            if s:
                results.add(s)

    return list(results)
