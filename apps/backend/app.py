from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import mongo

from routes.auth import auth_bp
from routes.users import user_bp
from routes.projects import project_bp
from routes.tasks import task_bp

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
)

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


app.url_map.strict_slashes = False

print("MONGO_URI being used:", app.config.get("MONGO_URI"))

mongo.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(project_bp, url_prefix="/api/projects")
app.register_blueprint(task_bp, url_prefix="/api/tasks")


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
