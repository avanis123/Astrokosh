from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
from utils.pdf_search_highlighter import PDFSearchHighlighter

load_dotenv()


MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL not found in .env")

client = MongoClient(MONGODB_URL)


db = client["astrokosh"]          # use your DB name
documents_collection = db["documents"]  # use your collection name


router = APIRouter()
highlighter = PDFSearchHighlighter()

# Path to uploaded PDFs folder
UPLOADED_PDFS_DIR = Path("uploaded_pdfs")

def normalize_mission_name(name: str) -> str:
    """Normalize mission name for comparison (remove spaces, hyphens, underscores, lowercase)"""
    return name.lower().replace('-', '').replace('_', '').replace(' ', '')

def get_pdf_mission_map():
    docs = list(documents_collection.find({}, {"file_name": 1, "mission": 1}))
    print("DEBUG Mongo docs:", docs)
    return {doc["file_name"]: doc["mission"] for doc in docs}


@router.get("/search/highlight")
async def search_with_highlights(
    query: str = Query(..., min_length=2, description="Search term"),
    mission: Optional[str] = Query(None, description="Filter by specific mission")
) -> Dict:
    """
    Search for text across PDFs and return highlighted page images.
    
    Example: GET /search/highlight?query=orbit
    Example: GET /search/highlight?query=instrument&mission=Chandrayaan-2
    """
    
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter required")
    
    # Get all PDF files
    pdf_files = list(UPLOADED_PDFS_DIR.glob("*.pdf"))
    
    if not pdf_files:
        return {
            "query": query,
            "total_results": 0,
            "missions": {}
        }
    
    # Filter by mission if specified (with flexible matching)
    mission_map = get_pdf_mission_map()

    if mission:
        pdf_files = [
            pdf for pdf in pdf_files
            if mission_map.get(pdf.name) == mission
        ]

        print(f"Filtering for mission (DB): {mission}")
        print(f"Found PDFs: {[pdf.name for pdf in pdf_files]}")

    
    # Convert to string paths
    pdf_paths = [str(pdf) for pdf in pdf_files]
    
    # Perform search
    results = highlighter.search_multiple_pdfs(pdf_paths, query)
    
    # Calculate total matches
    total_pages = sum(len(pages) for pages in results.values())
    
    return {
        "query": query,
        "total_results": total_pages,
        "missions": results
    }


@router.get("/missions/list")
async def list_available_missions() -> List[Dict[str, str]]:
    """Return list of all available missions with both display name and filename."""
    mission_map = get_pdf_mission_map()
    unique_missions = sorted(set(mission_map.values()))
    missions = []
    
    for mission in unique_missions:
        missions.append({
            "display_name": mission,  # For dropdown display
            "value": mission,            # Actual mission name without .pdf
        })
    
    return sorted(missions, key=lambda x: x['display_name'])

@router.get("/debug/pdfs")
async def debug_pdfs():
    """Debug endpoint to see all PDF files"""
    pdf_files = list(UPLOADED_PDFS_DIR.glob("*.pdf"))
    return {
        "pdf_dir": str(UPLOADED_PDFS_DIR.absolute()),
        "pdfs": [
            {
                "name": pdf.name,
                "stem": pdf.stem,
                "normalized": normalize_mission_name(pdf.stem)
            }
            for pdf in pdf_files
        ]
    }