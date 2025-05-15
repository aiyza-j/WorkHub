import bcrypt
import datetime
from flask import jsonify
from extensions import mongo

def create_user(full_name, email, password, role='user'):
    existing_user = mongo.db.users.find_one({"email": email})
    if existing_user:
        return {"success": False, "message": "Email already registered"}

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = {
        "full_name": full_name,
        "email": email,
        "password": hashed_pw,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }
    mongo.db.users.insert_one(user)
    return {"success": True, "message": "User created successfully"}

def find_user_by_email(email):
    return mongo.db.users.find_one({"email": email})

def get_all_users():
    return list(mongo.db.users.find({}, {"password": 0}))

def delete_user_by_email(email):
    return mongo.db.users.delete_one({"email": email})

def update_user_by_email(email, update_fields):
    return mongo.db.users.update_one({"email": email}, {"$set": update_fields})
