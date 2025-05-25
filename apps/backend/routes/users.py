from flask import Blueprint, jsonify, request
from utils.decorators import token_required, require_role
from models.user import get_all_users, delete_user_by_id, update_user_by_id
from extensions import mongo
from bson import ObjectId
from bson.errors import InvalidId

user_bp = Blueprint("users", __name__)


def is_valid_objectid(id_str):
    try:
        ObjectId(id_str)
        return True
    except (InvalidId, TypeError):
        return False


@user_bp.route("/", methods=["GET"])
@token_required
@require_role("admin")
def get_users(current_user):
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search = request.args.get("search", "")
    role_filter = request.args.get("role")

    query = {}
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    if role_filter:
        query["role"] = role_filter

    skip = (page - 1) * limit
    users_cursor = mongo.db.users.find(query).skip(skip).limit(limit)
    users = list(users_cursor)
    total = mongo.db.users.count_documents(query)

    for user in users:
        user["_id"] = str(user["_id"])

    return jsonify({"users": users, "total": total, "page": page, "limit": limit})


@user_bp.route("/delete", methods=["DELETE"])
@token_required
@require_role("admin")
def delete_user(current_user):
    data = request.json
    print(data)
    user_id = data.get("id")

    if not user_id or not is_valid_objectid(user_id):
        return jsonify({"error": "Invalid User ID"}), 400

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Fetch user to check email before deletion
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.get("email") == current_user["email"]:
        return jsonify({"error": "Admins cannot delete their own account"}), 403

    result = delete_user_by_id(user_id)

    if not result or result.deleted_count == 0:
        return jsonify({"error": "User not found or could not be deleted"}), 404

    return (
        jsonify(
            {
                "message": f"User with id {user_id} deleted",
                "deleted": result.deleted_count,
            }
        ),
        200,
    )


@user_bp.route("/update", methods=["PUT"])
@token_required
@require_role("admin")
def update_user(current_user):
    data = request.json
    user_id = data.get("_id")

    if not user_id:
        return jsonify({"error": "User ID (_id) is required"}), 400

    update_fields = {}
    for field in ["full_name", "email", "password"]:
        if field in data and data[field]:
            update_fields[field] = data[field]

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    result = update_user_by_id(user_id, update_fields)

    if result.modified_count == 0:
        return jsonify({"message": "No changes made or user not found"}), 404

    return (
        jsonify(
            {
                "message": f"User with id {user_id} updated",
                "modified": result.modified_count,
            }
        ),
        200,
    )


@user_bp.route("/emails", methods=["GET"])
@token_required
def get_user_emails(current_user):
    users_cursor = mongo.db.users.find({}, {"email": 1})
    emails = [user["email"] for user in users_cursor]
    return jsonify({"emails": emails})
