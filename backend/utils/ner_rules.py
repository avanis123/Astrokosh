import re

def extract_dates(text):
    """Extract dates from text using multiple patterns"""
    dates = set()
    
    # Pattern 1: Full dates (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',                    # MM/DD/YYYY or DD-MM-YYYY
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',                      # YYYY-MM-DD
        r'\b(?:0?[1-9]|[12]\d|3[01])\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}\b',  # 5 August 2023
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}\b',  # August 2023 or Aug 2023
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+(?:19|20)\d{2}\b',  # January 1, 2024
    ]
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if isinstance(matches, list):
            for match in matches:
                if isinstance(match, tuple):
                    dates.add(match[0] if match[0] else match)
                else:
                    dates.add(match)
    
    # Pattern: Just years (2024, 2025, etc.)
    year_pattern = r'\b(?:19|20)\d{2}\b'
    years = re.findall(year_pattern, text)
    dates.update(years)
    
    return list(dates)


def extract_coordinates(text):
    """Extract geographic coordinates from text"""
    coordinates = set()
    
    # Pattern 1: Decimal degrees with direction (23.1291°S, 82.9789°E or 23.1291 S, 82.9789 E)
    decimal_pattern = r'(\d{1,3}\.?\d*)\s*°?\s*([NS])\s*,?\s*(\d{1,3}\.?\d*)\s*°?\s*([EW])'
    matches = re.findall(decimal_pattern, text, re.IGNORECASE)
    for match in matches:
        coord_str = f"{match[0]}°{match[1]}, {match[2]}°{match[3]}"
        coordinates.add(coord_str)
    
    # Pattern 2: Degrees, Minutes, Seconds (23°22'30"N, 82°57'45"E)
    dms_pattern = r'(\d{1,3})°\s*(\d{1,2})[\'′]?\s*(?:(\d{1,2})[\"″]?)?\s*([NSEW])'
    dms_matches = re.findall(dms_pattern, text, re.IGNORECASE)
    for match in dms_matches:
        if match[2]:
            coord_str = f"{match[0]}°{match[1]}'{match[2]}\"({match[3]})"
        else:
            coord_str = f"{match[0]}°{match[1]}'({match[3]})"
        coordinates.add(coord_str)
    
    # Pattern 3: Degrees only (23°N, 82°E)
    deg_only_pattern = r'(\d{1,3})°\s*([NSEW])'
    deg_matches = re.findall(deg_only_pattern, text, re.IGNORECASE)
    for match in deg_matches:
        coordinates.add(f"{match[0]}°{match[1]}")
    
    # Pattern 4: Altitude/Latitude keywords
    altitude_pattern = r'\b(?:altitude|elevation|height)[\s:]+(-?\d+(?:\.\d+)?)\s*(?:km|km|meters?|feet?)\b'
    altitude_matches = re.findall(altitude_pattern, text, re.IGNORECASE)
    for match in altitude_matches:
        coordinates.add(f"Altitude: {match}")
    
    return list(coordinates)


def extract_mission_phases(text):
    """Extract mission phases"""
    phases = set()
    
    phase_keywords = [
        'launch', 'ascent', 'injection', 'cruise', 'coast',
        'insertion', 'orbit', 'orbital', 'deployment', 'commissioning',
        'operation', 'science', 'data collection', 'operational',
        'descent', 'landing', 'separation', 'transfer',
        'tli', 'trans-lunar', 'lunar orbit', 'earth orbit',
        'halo orbit', 'sun-earth', 'l1', 'leo', 'gto',
        'pre-launch', 'post-launch', 'in-orbit', 'post-separation'
    ]
    
    for keyword in phase_keywords:
        if re.search(rf'\b{keyword}\b', text, re.IGNORECASE):
            phases.add(keyword.lower())
    
    return list(phases)


def extract_measurements(text):
    """Extract scientific measurements"""
    measurements = set()
    
    # Pattern: Number + Unit (more comprehensive)
    measurement_patterns = [
        r'\d+(?:\.\d+)?\s*(?:nm|μm|angstrom|Å)',               # Wavelength
        r'\d+(?:\.\d+)?\s*(?:km|m|cm|mm)\b',                    # Distance
        r'\d+(?:\.\d+)?\s*(?:°C|°F|K)\b',                       # Temperature
        r'\d+(?:\.\d+)?\s*(?:nT|mT|T|Gauss)\b',                 # Magnetic field
        r'\d+(?:\.\d+)?\s*(?:keV|MeV|eV|GeV)\b',                # Energy
        r'\d+(?:\.\d+)?\s*(?:kg|g|mg)\b',                       # Mass
        r'\d+(?:\.\d+)?\s*(?:AU|ua)\b',                         # Astronomical units
        r'\d+(?:\.\d+)?\s*(?:km/s|m/s|km/h)\b',                 # Velocity
        r'\d+(?:\.\d+)?\s*(?:W|kW|MW)\b',                       # Power
        r'\d+(?:\.\d+)?\s*(?:V|kV|mV)\b',                       # Voltage
        r'\d+(?:\.\d+)?\s*(?:Hz|kHz|MHz|GHz)\b',                # Frequency
        r'\d+(?:\.\d+)?\s*(?:s|ms|μs|ns)\b',                    # Time
        r'(?:360|3[0-5][0-9]|[1-2][0-9]{2}|[1-9]?[0-9])\s*nm', # Wavelength in nm
        r'(?:[1-9][0-9]{2})-(?:[1-9][0-9]{2})\s*nm',            # Wavelength range
    ]
    
    for pattern in measurement_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        measurements.update(matches)
    
    return list(measurements)