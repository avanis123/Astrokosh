def match_caption_to_image(image_bbox, caption_blocks):
    """
    image_bbox: (x0, y0, x1, y1)
    caption_blocks: list of {text, bbox}
    """
    img_x0, img_y0, img_x1, img_y1 = image_bbox

    best_caption = None
    min_distance = float("inf")

    for cap in caption_blocks:
        cap_x0, cap_y0, cap_x1, cap_y1 = cap["bbox"]

        # Only consider captions BELOW the image
        if cap_y0 < img_y1:
            continue

        vertical_distance = cap_y0 - img_y1

        if vertical_distance < min_distance:
            min_distance = vertical_distance
            best_caption = cap["text"]

    return best_caption
