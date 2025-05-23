import bcrypt
import datetime
from flask import jsonify
from extensions import mongo
from bson import ObjectId


def create_user(full_name, email, password, role="user"):
    existing_user = mongo.db.users.find_one({"email": email})
    if existing_user:
        return {"success": False, "message": "Email already registered"}

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = {
        "full_name": full_name,
        "email": email,
        "password": hashed_pw,
        "role": role,
        "created_at": datetime.datetime.utcnow(),
    }
    mongo.db.users.insert_one(user)
    return {"success": True, "message": "User created successfully"}


def find_user_by_email(email):
    return mongo.db.users.find_one({"email": email})


def get_all_users():
    return list(mongo.db.users.find({}, {"password": 0}))


def delete_user_by_id(user_id):

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None

    email = user.get("email")

    # Delete user
    user_delete_result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})

    # Delete all projects where owner/creator email or id is this user
    mongo.db.projects.delete_many({"owner_email": email})

    # Delete all tasks assigned to this user
    mongo.db.tasks.delete_many({"assignee": email})

    return user_delete_result


def update_user_by_id(user_id, update_fields):
    # Fetch current user email before update
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None

    old_email = user.get("email")
    new_email = update_fields.get("email")

    result = mongo.db.users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": update_fields}
    )

    # If email changed, update all tasks with old email to new email
    if new_email and new_email != old_email:
        mongo.db.tasks.update_many(
            {"assignee": old_email}, {"$set": {"assignee": new_email}}
        )
        # Also update all projects with old ownerEmail to new email
        mongo.db.projects.update_many(
            {"owner_email": old_email}, {"$set": {"owner_email": new_email}}
        )

    return result
