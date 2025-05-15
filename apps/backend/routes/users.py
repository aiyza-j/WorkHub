from flask import Blueprint, jsonify, current_app, request
from utils.decorators import token_required, require_role
from models.user import get_all_users, delete_user_by_email, update_user_by_email
from extensions import mongo

user_bp = Blueprint("users", __name__)

@user_bp.route("/", methods=["GET"])
@token_required
@require_role("admin")
def get_users(current_user):
    users = get_all_users()
    return jsonify(users)


@user_bp.route("/delete", methods=["DELETE"])
@token_required
@require_role("admin")
def delete_user(current_user):
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if email == current_user["email"]:
        return jsonify({"error": "Admins cannot delete their own account"}), 403

    result = delete_user_by_email(email)

    if result.deleted_count == 0:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"message": f"User with email {email} deleted", "deleted": result.deleted_count}), 200


@user_bp.route("/update", methods=["PUT"])
@token_required
@require_role("admin")
def update_user(current_user):
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Target email is required"}), 400

    update_fields = {}
    for field in ["full_name", "email", "password"]:
        if field in data and data[field]:
            update_fields[field] = data[field]

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    result = update_user_by_email(email, update_fields)

    if result.modified_count == 0:
        return jsonify({"message": "No changes made or user not found"}), 404

    return jsonify({"message": f"User with email {email} updated", "modified": result.modified_count}), 200
