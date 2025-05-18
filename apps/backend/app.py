from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
from extensions import mongo

from routes.auth import auth_bp
from routes.users import user_bp
from routes.projects import project_bp
from routes.tasks import task_bp

load_dotenv()

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


app.url_map.strict_slashes = False

mongo.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(project_bp, url_prefix="/api/projects")
app.register_blueprint(task_bp, url_prefix="/api/tasks")

if __name__ == "__main__":
    app.run(debug=True, port=5000)