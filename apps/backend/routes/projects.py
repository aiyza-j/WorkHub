from flask import Blueprint, request, jsonify
from utils.decorators import token_required
from models.project import (
    create_project,
    get_projects_by_owner,
    get_all_projects,
    delete_project,
    update_project,
)
from extensions import mongo
from bson import ObjectId

project_bp = Blueprint("projects", __name__)


@project_bp.route("/", methods=["POST"])
@token_required
def new_project(current_user):
    data = request.json or {}
    name = data.get("name")
    description = data.get("description")

    if not name or not description:
        return jsonify({"error": "Name and description are required"}), 400

    create_project(name, description, current_user["email"])
    return jsonify({"message": "Project created"})


@project_bp.route("/", methods=["GET"])
@token_required
def get_my_projects(current_user):
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search = request.args.get("search", None)

    projects = get_projects_by_owner(current_user["email"], page, limit, search)
    total_count = mongo.db.projects.count_documents(
        {"owner_email": current_user["email"]}
    )

    for p in projects:
        p["_id"] = str(p["_id"])
        if "created_at" in p:
            p["created_at"] = (
                p["created_at"].isoformat()
                if hasattr(p["created_at"], "isoformat")
                else p["created_at"]
            )

    return jsonify({"projects": projects, "totalCount": total_count})


@project_bp.route("/all", methods=["GET"])
@token_required
def get_all(current_user):
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search = request.args.get("search", None)

    projects = get_all_projects(page, limit, search)
    total_count = mongo.db.projects.count_documents({})

    for p in projects:
        p["_id"] = str(p["_id"])
        if "created_at" in p:
            p["created_at"] = (
                p["created_at"].isoformat()
                if hasattr(p["created_at"], "isoformat")
                else p["created_at"]
            )

    return jsonify({"projects": projects, "totalCount": total_count})


@project_bp.route("/delete", methods=["DELETE"])
@token_required
def delete(current_user):
    data = request.json or {}
    project_id = data.get("project_id")

    if not project_id:
        return jsonify({"error": "project_id is required"}), 400

    result = delete_project(project_id, current_user["email"])
    return jsonify({"deleted": result.deleted_count})


@project_bp.route("/update", methods=["PUT"])
@token_required
def update_project_route(current_user):
    data = request.json or {}
    project_id = data.get("project_id")
    if not project_id:
        return jsonify({"error": "project_id is required"}), 400

    updated_fields = {
        "name": data.get("name"),
        "description": data.get("description"),
    }
    updated_fields = {k: v for k, v in updated_fields.items() if v is not None}
    if not updated_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    result = update_project(project_id, current_user["email"], updated_fields)
    if not result or result.modified_count == 0:
        return jsonify({"error": "Project not updated or not found"}), 404

    return jsonify({"message": "Project updated successfully"})
