import re

CAPTION_REGEX = re.compile(
    r"""
    (                           # start group
      Fig(?:ure)?               # Fig or Figure
      \.?                       # optional dot after Fig/Figure
      \s*                       # optional space
      \d+(?:\.\d+)*             # figure number (2, 2.6, 2.6.1)
      \s*[:\-\.]?\s*            # optional separator (: - .)
      .+                        # caption text
    )
    """,
    re.IGNORECASE | re.VERBOSE
)

def extract_caption_blocks(page):
    caption_blocks = []

    blocks = page.get_text("blocks")
    for block in blocks:
        # Safely unpack only what we need
        x0, y0, x1, y1 = block[0], block[1], block[2], block[3]
        text = block[4].strip()

        if not text:
            continue

        if len(text) < 200 and CAPTION_REGEX.search(text):
            caption_blocks.append({
                "text": text,
                "bbox": (x0, y0, x1, y1)
            })

    return caption_blocks
