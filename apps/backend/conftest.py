import pytest
import os
import tempfile
from app import app
from utils.database import get_database
from pymongo import MongoClient
import jwt
from datetime import datetime, timedelta


@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the Flask application."""

    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")

    with app.test_client() as testing_client:
        with app.app_context():
            yield testing_client


@pytest.fixture(scope="function")
def test_db():
    """Create a clean test database for each test."""
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client.test_db

    collections = ["users", "projects", "tasks"]
    for collection in collections:
        db[collection].delete_many({})

    yield db

    for collection in collections:
        db[collection].delete_many({})

    client.close()


@pytest.fixture
def sample_user():
    """Create a sample user for testing."""
    return {
        "full_name": "testname",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "user",
    }


@pytest.fixture
def sample_admin():
    """Create a sample admin user for testing."""
    return {
        "full_name": "adminname",
        "email": "admin@example.com",
        "password": "adminpassword123",
        "role": "admin",
    }


@pytest.fixture
def auth_token(sample_user):
    """Generate a JWT token for testing authenticated endpoints."""
    payload = {
        "user_id": "test_user_id",
        "email": sample_user["email"],
        "role": sample_user["role"],
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")


@pytest.fixture
def admin_token(sample_admin):
    """Generate a JWT token for testing admin endpoints."""
    payload = {
        "user_id": "test_user_id",
        "email": sample_admin["email"],
        "role": sample_admin["role"],
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")


@pytest.fixture
def sample_project():
    """Create a sample project for testing."""
    return {
        "name": "Test Project",
        "description": "A test project for unit testing",
        "owner_email": "test@example.com",
    }


@pytest.fixture
def sample_task():
    """Create a sample task for testing."""
    return {
        "title": "Test Task",
        "description": "A test task for unit testing",
        "status": "open",
        "assignee": "test@example.com",
        "project_id": "test_project_id",
    }


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "unit: mark test as a unit test")
    config.addinivalue_line("markers", "integration: mark test as an integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")
