from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

from routes.auth import auth_bp
from routes.users import user_bp
from routes.projects import project_bp
from routes.tasks import task_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

mongo = PyMongo(app)
app.extensions["pymongo"] = mongo

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(project_bp, url_prefix="/api/projects")
app.register_blueprint(task_bp, url_prefix="/api/tasks")

if __name__ == "__main__":
    app.run(debug=True)
