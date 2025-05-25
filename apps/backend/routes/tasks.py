from flask import Blueprint, request, jsonify, current_app
from utils.decorators import token_required
from models.task import (
    create_task,
    get_tasks_by_project,
    update_task_status,
    delete_task,
    get_user_tasks,
    update_task,
)
from extensions import mongo

task_bp = Blueprint("tasks", __name__)


@task_bp.route("/", methods=["POST"])
@token_required
def new_task(current_user):
    data = request.json

    create_task(
        data["title"], data["description"], data["project_id"], data["assignee"]
    )
    return jsonify({"message": "Task created"}), 201


@task_bp.route("/project/<project_id>", methods=["GET"])
@token_required
def get_tasks(current_user, project_id):
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip().lower()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    tasks, total = get_tasks_by_project(project_id, search, status, page, per_page)

    return jsonify({"tasks": tasks, "total": total, "page": page, "per_page": per_page})


@task_bp.route("/update-status", methods=["PUT"])
@token_required
def update_status(current_user):
    data = request.json

    result = update_task_status(data["task_id"], data["status"])
    return jsonify({"updated": result.modified_count})


@task_bp.route("/delete", methods=["DELETE"])
@token_required
def delete(current_user):
    task_id = request.json.get("task_id")

    result = delete_task(task_id)
    return jsonify({"deleted": result.deleted_count})


@task_bp.route("/user-tasks", methods=["GET"])
@token_required
def get_user_tasks_route(current_user):
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip().lower()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    tasks, total = get_user_tasks(current_user["email"], search, status, page, per_page)

    return jsonify({"tasks": tasks, "total": total, "page": page, "per_page": per_page})


@task_bp.route("/update", methods=["PUT"])
@token_required
def update(current_user):
    data = request.json
    task_id = data.get("task_id")
    updates = data.get("updates", {})

    if not task_id or not updates:
        return jsonify({"error": "Missing task_id or updates"}), 400

    result = update_task(task_id, updates)

    if result is None:
        return jsonify({"error": "No valid fields to update"}), 400

    return jsonify({"updated": result.modified_count})
