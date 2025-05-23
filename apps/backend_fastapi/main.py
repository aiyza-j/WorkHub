import uvicorn
from fastapi import FastAPI
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from model import User
from routes.user import router as user_router
from config import settings


app = FastAPI()


@app.on_event("startup")
async def startup():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]
    await init_beanie(database=db, document_models=[User])


app.include_router(user_router, prefix="/users", tags=["users"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
