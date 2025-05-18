import datetime
from extensions import mongo
import re
from bson import ObjectId

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

def get_tasks_by_project(project_id, search="", status="", page=1, per_page=10):
    query = {"project_id": project_id}

    if status:
        query["status"] = status

    if search:
        regex = re.compile(re.escape(search), re.IGNORECASE)
        query["$or"] = [{"title": regex}, {"description": regex}]

    skip_count = (page - 1) * per_page

    cursor = mongo.db.tasks.find(query).skip(skip_count).limit(per_page)
    tasks = list(cursor)

    # Convert ObjectId to string
    for task in tasks:
        task["_id"] = str(task["_id"])

    total = mongo.db.tasks.count_documents(query)

    return tasks, total

def update_task_status(task_id, status):
    from bson import ObjectId
    return mongo.db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": status}})

def delete_task(task_id):
    from bson import ObjectId
    return mongo.db.tasks.delete_one({"_id": ObjectId(task_id)})

def get_user_tasks(user_email, search="", status="", page=1, per_page=10):
    query = {"assignee": user_email}

    if status:
        query["status"] = status

    if search:
        regex = re.compile(re.escape(search), re.IGNORECASE)
        query["$or"] = [{"title": regex}, {"description": regex}]

    skip_count = (page - 1) * per_page

    cursor = mongo.db.tasks.find(query).skip(skip_count).limit(per_page)
    tasks = list(cursor)

    #mapping to simple numbers
    project_ids = list({task["project_id"] for task in tasks})
    project_id_map = {pid: str(i+1) for i, pid in enumerate(project_ids)}

    for task in tasks:
        task["_id"] = str(task["_id"])
        task["project_id"] = project_id_map.get(task["project_id"], "0")

    total = mongo.db.tasks.count_documents(query)

    return tasks, total

def update_task(task_id, updates):
    allowed_fields = {"title", "description", "assignee", "status"}
    update_fields = {key: value for key, value in updates.items() if key in allowed_fields}

    if not update_fields:
        return None 

    return mongo.db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_fields})