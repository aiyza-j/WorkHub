from flask import Blueprint, request, jsonify, current_app
from models.user import create_user, find_user_by_email
import jwt, bcrypt, datetime
from extensions import mongo
import re

auth_bp = Blueprint("auth", __name__)


def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    required_fields = ["full_name", "email", "password"]
    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if not is_valid_email(data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    if find_user_by_email(data["email"]):
        return jsonify({"error": "Email already registered"}), 400
    create_user(
        data["full_name"], data["email"], data["password"], data.get("role", "user")
    )
    return jsonify({"message": "User registered"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = find_user_by_email(data["email"])
    if not user or not bcrypt.checkpw(data["password"].encode(), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    payload = {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return jsonify({"token": token})
