import datetime
from extensions import mongo

def create_task(title, description, project_id, assignee_email):
    task = {
        "title": title,
        "description": description,
        "project_id": project_id,
        "assignee": assignee_email,
        "status": "open",
        "created_at": datetime.datetime.utcnow()
    }
    mongo.db.tasks.insert_one(task)

def get_tasks_by_project(mongo, project_id):
    return list(mongo.db.tasks.find({"project_id": project_id}))

def update_task_status(task_id, status):
    from bson import ObjectId
    return mongo.db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": status}})

def delete_task(task_id):
    from bson import ObjectId
    return mongo.db.tasks.delete_one({"_id": ObjectId(task_id)})
