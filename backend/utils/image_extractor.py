import os
import fitz
import hashlib
from utils.caption_extractor import extract_caption_blocks
from utils.caption_matcher import match_caption_to_image


def extract_images_from_pdf(pdf_path, output_dir, mission):
    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    extracted_images = []
    seen_hashes = set()

    for page_index, page in enumerate(doc):
        images = page.get_images(full=True)
        caption_blocks = extract_caption_blocks(page)

        for img_index, img in enumerate(images):
            xref = img[0]

            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            width = base_image["width"]
            height = base_image["height"]

            # 🔹 Filter 1: size threshold
            if width < 150 or height < 150:
                continue

            # 🔹 Filter 2: deduplicate
            img_hash = hashlib.md5(image_bytes).hexdigest()
            if img_hash in seen_hashes:
                continue
            seen_hashes.add(img_hash)

            # 🔹 Get bounding box for THIS image
            image_rects = page.get_image_rects(xref)
            image_bbox = image_rects[0] if image_rects else None

            # 🔹 Spatial caption matching
            caption = None
            if image_bbox:
                caption = match_caption_to_image(image_bbox, caption_blocks)

            image_name = f"{mission}_page_{page_index+1}_img_{img_index+1}.{image_ext}"
            image_path = os.path.join(output_dir, image_name)

            with open(image_path, "wb") as f:
                f.write(image_bytes)

            extracted_images.append({
                "mission": mission,
                "page": page_index + 1,
                "image_path": image_path,
                "image_name": image_name,
                "source_pdf": os.path.basename(pdf_path),
                "width": width,
                "height": height,
                "caption": caption,
            })

    doc.close()
    return extracted_images
