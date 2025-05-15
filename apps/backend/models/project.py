import datetime

def create_project(mongo, name, description, owner_email):
    project = {
        "name": name,
        "description": description,
        "owner_email": owner_email,
        "created_at": datetime.datetime.utcnow()
    }
    mongo.db.projects.insert_one(project)

def get_projects_by_owner(mongo, owner_email):
    return list(mongo.db.projects.find({"owner_email": owner_email}))

def get_all_projects(mongo):
    return list(mongo.db.projects.find({}))

def delete_project(mongo, project_id):
    from bson import ObjectId
    return mongo.db.projects.delete_one({"_id": ObjectId(project_id)})
