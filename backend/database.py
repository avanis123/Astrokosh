import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise Exception("❌ MONGODB_URL is missing in .env!")

# Connect to Atlas
client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=30000)

# Explicit database name (REQUIRED)
db = client["astrokosh"]
