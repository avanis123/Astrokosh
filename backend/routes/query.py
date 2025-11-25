from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def test_query():
    return {"message": "Query endpoint working"}
