from typing import List

def chunk_text(
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 200
) -> List[str]:
    """
    Character-based chunker with overlap.
    Adjust chunk_size / overlap after a few experiments on mission docs.
    """
    text = text.strip()
    if not text:
        return []

    chunks: List[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == text_len:
            break
        start = max(0, end - chunk_overlap)

    return chunks
