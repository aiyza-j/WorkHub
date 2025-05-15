from flask import Blueprint, request, jsonify, current_app
from utils.decorators import token_required
from models.project import create_project, get_projects_by_owner, get_all_projects, delete_project

project_bp = Blueprint("projects", __name__)

@project_bp.route("/", methods=["POST"])
@token_required
def new_project(current_user):
    data = request.json
    mongo = current_app.extensions["pymongo"]
    create_project(mongo, data['name'], data['description'], current_user['email'])
    return jsonify({"message": "Project created"})

@project_bp.route("/", methods=["GET"])
@token_required
def get_my_projects(current_user):
    mongo = current_app.extensions["pymongo"]
    projects = get_projects_by_owner(mongo, current_user['email'])
    return jsonify(projects)

@project_bp.route("/all", methods=["GET"])
@token_required
def get_all(current_user):
    mongo = current_app.extensions["pymongo"]
    projects = get_all_projects(mongo)
    return jsonify(projects)

@project_bp.route("/delete", methods=["DELETE"])
@token_required
def delete(current_user):
    project_id = request.json.get("project_id")
    mongo = current_app.extensions["pymongo"]
    result = delete_project(mongo, project_id)
    return jsonify({"deleted": result.deleted_count})
