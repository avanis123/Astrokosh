import re

def clean_text_block(text):
    if not text:
        return ""
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    # Remove weird unicode chars
    text = text.replace("\u00a0", " ")

    # Remove bullet symbols (•, , ●, ◦)
    text = re.sub(r'[•●◦]', '', text)

    return text.strip()


def clean_pages(page_list):
    cleaned = []
    for page in page_list:
        cleaned.append(clean_text_block(page))
    return cleaned
