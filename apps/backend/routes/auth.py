from flask import Blueprint, request, jsonify, current_app
from models.user import create_user, find_user_by_email
import jwt, bcrypt, datetime

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    mongo = current_app.extensions["pymongo"]
    if find_user_by_email(mongo, data['email']):
        return jsonify({"error": "Email already registered"}), 400
    create_user(mongo, data['username'], data['email'], data['password'], data.get('role', 'user'))
    return jsonify({"message": "User registered"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    mongo = current_app.extensions["pymongo"]
    user = find_user_by_email(mongo, data['email'])
    if not user or not bcrypt.checkpw(data['password'].encode(), user['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    payload = {
        "email": user['email'],
        "role": user['role'],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({"token": token})
