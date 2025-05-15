from flask import Blueprint, request, jsonify, current_app
from utils.decorators import token_required
from models.task import create_task, get_tasks_by_project, update_task_status, delete_task

task_bp = Blueprint("tasks", __name__)

@task_bp.route("/", methods=["POST"])
@token_required
def new_task(current_user):
    data = request.json
    mongo = current_app.extensions["pymongo"]
    create_task(mongo, data['title'], data['description'], data['project_id'], data['assignee'])
    return jsonify({"message": "Task created"})

@task_bp.route("/project/<project_id>", methods=["GET"])
@token_required
def get_tasks(current_user, project_id):
    mongo = current_app.extensions["pymongo"]
    tasks = get_tasks_by_project(mongo, project_id)
    return jsonify(tasks)

@task_bp.route("/update-status", methods=["PUT"])
@token_required
def update_status(current_user):
    data = request.json
    mongo = current_app.extensions["pymongo"]
    result = update_task_status(mongo, data['task_id'], data['status'])
    return jsonify({"updated": result.modified_count})

@task_bp.route("/delete", methods=["DELETE"])
@token_required
def delete(current_user):
    task_id = request.json.get("task_id")
    mongo = current_app.extensions["pymongo"]
    result = delete_task(mongo, task_id)
    return jsonify({"deleted": result.deleted_count})
