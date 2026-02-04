import fitz  # PyMuPDF
import io
import os
from pathlib import Path
from typing import List, Dict
import hashlib
from PIL import Image, ImageDraw

class PDFSearchHighlighter:
    def __init__(self, output_dir="search_highlights"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def search_pdf(self, pdf_path: str, search_term: str) -> List[Dict]:
        """
        Search for term in PDF and return highlighted page images.
        """
        results = []
        doc = fitz.open(pdf_path)
        
        # Generate unique hash for this search
        search_hash = hashlib.md5(f"{pdf_path}_{search_term}".encode()).hexdigest()[:12]
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Search for text instances
            text_instances = page.search_for(search_term)
            
            if text_instances:
                # Generate highlighted image
                image_filename = f"{search_hash}_page{page_num}.png"
                image_path = self.output_dir / image_filename
                
                # Only generate if not already cached
                if not image_path.exists():
                    # Render page to pixmap first
                    mat = fitz.Matrix(2, 2)  # 2x zoom
                    pix = page.get_pixmap(matrix=mat, alpha=False)
                    
                    # Convert pixmap to PIL Image
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    
                    # Draw rectangles on PIL image
                    draw = ImageDraw.Draw(img, 'RGBA')
                    
                    for inst in text_instances:
                        # Scale coordinates for 2x matrix
                        x0, y0, x1, y1 = inst.x0 * 2, inst.y0 * 2, inst.x1 * 2, inst.y1 * 2
                        
                        # Draw semi-transparent yellow rectangle
                        draw.rectangle(
                            [x0, y0, x1, y1],
                            outline=(255, 255, 0, 255),  # Yellow border
                            fill=(255, 255, 0, 100),     # Semi-transparent yellow fill
                            width=3
                        )
                    
                    # Save the highlighted image
                    img.save(str(image_path))
                
                # Extract context (surrounding text)
                page_text = page.get_text()
                context = self._extract_context(page_text, search_term)
                
                results.append({
                    "page_num": page_num + 1,
                    "match_count": len(text_instances),
                    "image_path": f"/static/search_highlights/{image_filename}",
                    "context": context,
                    "pdf_name": os.path.basename(pdf_path)
                })
        
        doc.close()
        return results
    
    def _extract_context(self, full_text: str, search_term: str, 
                        chars_before=100, chars_after=100) -> str:
        """Extract text around the first occurrence of search term."""
        lower_text = full_text.lower()
        lower_term = search_term.lower()
        
        pos = lower_text.find(lower_term)
        if pos == -1:
            return ""
        
        start = max(0, pos - chars_before)
        end = min(len(full_text), pos + len(search_term) + chars_after)
        
        context = full_text[start:end]
        if start > 0:
            context = "..." + context
        if end < len(full_text):
            context = context + "..."
        
        return context.strip()
    
    def search_multiple_pdfs(self, pdf_paths: List[str], 
                            search_term: str) -> Dict[str, List[Dict]]:
        """Search across multiple PDFs and organize results by mission."""
        all_results = {}
        
        for pdf_path in pdf_paths:
            if os.path.exists(pdf_path):
                results = self.search_pdf(pdf_path, search_term)
                if results:
                    mission_name = self._extract_mission_name(pdf_path)
                    all_results[mission_name] = results
        
        return all_results
    
    def _extract_mission_name(self, pdf_path: str) -> str:
        """Extract mission name from file path."""
        filename = os.path.basename(pdf_path)
        mission = filename.replace('.pdf', '').replace('_handbook', '').replace('_', ' ')
        return mission