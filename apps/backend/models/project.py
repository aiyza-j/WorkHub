from extensions import mongo
import datetime
from bson import ObjectId


def create_project(name, description, owner_email):
    project = {
        "name": name,
        "description": description,
        "owner_email": owner_email,
        "created_at": datetime.datetime.utcnow(),
    }
    mongo.db.projects.insert_one(project)


def get_projects_by_owner(owner_email, page=1, limit=10, search=None):
    query = {"owner_email": owner_email}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    cursor = mongo.db.projects.find(query).skip((page - 1) * limit).limit(limit)
    projects = list(cursor)
    return projects


def get_all_projects(page=1, limit=10, search=None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    cursor = mongo.db.projects.find(query).skip((page - 1) * limit).limit(limit)
    projects = list(cursor)
    return projects


def delete_project(project_id, owner_email):
    return mongo.db.projects.delete_one(
        {"_id": ObjectId(project_id), "owner_email": owner_email}
    )


def update_project(project_id, owner_email, updated_fields):
    # Filter out None values just in case
    updated_fields = {k: v for k, v in updated_fields.items() if v is not None}
    if not updated_fields:
        return None  # or raise an error, depending on your style

    return mongo.db.projects.update_one(
        {"_id": ObjectId(project_id), "owner_email": owner_email},
        {"$set": updated_fields},
    )
