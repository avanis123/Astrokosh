from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.observations import router as obs_router
from routes.search import router as search_router
from routes.query import router as query_router

app = FastAPI(
    title="AstroKosh Backend",
    description="API for space mission knowledge extraction",
    version="1.0"
)

# ✅ Add CORS middleware HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(obs_router, prefix="/observations", tags=["Observations"])
app.include_router(search_router, prefix="/search", tags=["Search"])
app.include_router(query_router, prefix="/query", tags=["Q&A"])


@app.get("/test-db")
async def test_db():
    from database import db
    collections = await db.list_collection_names()
    return {"collections": collections}