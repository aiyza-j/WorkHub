from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):

    mongodb_uri: str = Field(..., alias="MONGODB_URI")
    mongodb_db: str = Field("workhub_db", env="MONGODB_DB")
    secret_key: str = Field(..., env="SECRET_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
