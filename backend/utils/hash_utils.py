import hashlib

def compute_pdf_hash(file_path):
    """
    Returns SHA-256 hash of a PDF file.
    Used for duplicate detection.
    """
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()
