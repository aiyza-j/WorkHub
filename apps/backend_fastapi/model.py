from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId
import datetime
from enum import Enum
from beanie import Document


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return str(v)


class Role(str, Enum):
    user = 'user'
    admin = 'admin'


class User(Document):
    full_name: str
    email: EmailStr
    password: str
    role: Role = Role.user
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    class Settings:
        name = "users"

    class Config:
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "full_name": "John Doe",
                "email": "john@example.com",
                "role": "user"
            }
        }


# Input models

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[Role] = Role.user


class UserUpdate(BaseModel):
    full_name: Optional[str]
    email: Optional[EmailStr]
    password: Optional[str]  
    role: Optional[Role]
