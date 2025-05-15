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
