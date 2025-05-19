from flask import Blueprint, request, jsonify, current_app
from models.user import create_user, find_user_by_email
import jwt, bcrypt, datetime
from extensions import mongo

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    if find_user_by_email(data['email']):
        return jsonify({"error": "Email already registered"}), 400
    create_user(data['full_name'], data['email'], data['password'], data.get('role', 'user'))
    return jsonify({"message": "User registered"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = find_user_by_email(data['email'])
    if not user or not bcrypt.checkpw(data['password'].encode(), user['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    payload = {
        'id': str(user['_id']),
        "email": user['email'],
        "password": user['role'],
        "full_name": user['full_name'],
        "role": user['role'],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({"token": token})
