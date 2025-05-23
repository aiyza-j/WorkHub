from dotenv import load_dotenv
from pathlib import Path
import os
import pytest
import tempfile
from app import app
from utils.database import (
    get_database,
    get_collection,
    close_connection,
    DatabaseContext,
)
from pymongo import MongoClient
import jwt
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()


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
    """Create a clean test database for each test using the database utility."""
    # Use a test-specific database name to avoid conflicts
    test_db_name = "test_db_" + str(os.getpid())

    # Get database using your utility function
    db = get_database(test_db_name)

    # Clean up collections before test
    collections = ["users", "projects", "tasks"]
    for collection in collections:
        db[collection].delete_many({})

    yield db

    # Clean up collections after test
    for collection in collections:
        db[collection].delete_many({})


@pytest.fixture(scope="function")
def test_collections():
    """Provide access to test collections using the database utility."""
    test_db_name = "test_db_" + str(os.getpid())

    collections = {
        "users": get_collection("users", test_db_name),
        "projects": get_collection("projects", test_db_name),
        "tasks": get_collection("tasks", test_db_name),
    }

    # Clean up before test
    for collection in collections.values():
        collection.delete_many({})

    yield collections

    # Clean up after test
    for collection in collections.values():
        collection.delete_many({})


@pytest.fixture(scope="function")
def db_context():
    """Provide a database context manager for tests."""
    test_db_name = "test_db_" + str(os.getpid())

    with DatabaseContext(test_db_name) as db:
        # Clean up before test
        collections = ["users", "projects", "tasks"]
        for collection in collections:
            db[collection].delete_many({})

        yield db

        # Clean up after test
        for collection in collections:
            db[collection].delete_many({})


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


@pytest.fixture
def populated_db(test_collections, sample_user, sample_project, sample_task):
    """Create a database with sample data for integration tests."""
    # Insert sample user
    user_result = test_collections["users"].insert_one(
        {
            **sample_user,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    )

    # Insert sample project
    project_data = {
        **sample_project,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    project_result = test_collections["projects"].insert_one(project_data)

    # Insert sample task
    task_data = {
        **sample_task,
        "project_id": str(project_result.inserted_id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    task_result = test_collections["tasks"].insert_one(task_data)

    return {
        "user_id": str(user_result.inserted_id),
        "project_id": str(project_result.inserted_id),
        "task_id": str(task_result.inserted_id),
        "collections": test_collections,
    }


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "unit: mark test as a unit test")
    config.addinivalue_line("markers", "integration: mark test as an integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "database: mark test as requiring database")


def pytest_sessionstart(session):
    """Actions to perform at the start of the test session."""
    # Ensure environment variables are loaded
    if not os.getenv("MONGO_URI"):
        raise ValueError("MONGO_URI environment variable is required for testing")
    if not os.getenv("SECRET_KEY"):
        raise ValueError("SECRET_KEY environment variable is required for testing")


def pytest_sessionfinish(session, exitstatus):
    """Actions to perform at the end of the test session."""
    # Close database connections
    close_connection()
