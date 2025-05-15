from flask import Blueprint, jsonify, current_app, request
from utils.decorators import token_required, require_role
from models.user import get_all_users, delete_user_by_email

user_bp = Blueprint("users", __name__)

@user_bp.route("/", methods=["GET"])
@token_required
@require_role("admin")
def get_users(current_user):
    mongo = current_app.extensions["pymongo"]
    users = get_all_users(mongo)
    return jsonify(users)

@user_bp.route("/delete", methods=["DELETE"])
@token_required
@require_role("admin")
def delete_user(current_user):
    email = request.json.get("email")
    mongo = current_app.extensions["pymongo"]
    result = delete_user_by_email(mongo, email)
    return jsonify({"deleted": result.deleted_count})
