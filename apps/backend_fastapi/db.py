from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongodb_db]

users_collection = db["users"]
projects_collection = db["projects"]
tasks_collection = db["tasks"]
