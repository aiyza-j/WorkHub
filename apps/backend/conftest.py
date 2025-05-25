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
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def get_test_mongo_uri():
    """Get the appropriate MongoDB URI for testing."""
    # Always use the MONGO_URI from environment (GitHub secrets or local .env)
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        raise ValueError("MONGO_URI environment variable is not set. Please set it in GitHub secrets or your .env file")

    logger.info(f"Using MongoDB URI: {mongo_uri[:20]}...")

    # For testing, we'll use a test database suffix
    if "?" in mongo_uri:
        # If there are query parameters, insert the test db name before them
        base_uri, params = mongo_uri.split("?", 1)
        if base_uri.endswith("/"):
            test_uri = f"{base_uri}test_db?{params}"
        else:
            # Replace the database name with test_db
            parts = base_uri.split("/")
            if len(parts) > 3:
                parts[-1] = "test_db"
            else:
                parts.append("test_db")
            test_uri = f"{'/'.join(parts)}?{params}"
    else:
        # No query parameters
        if mongo_uri.endswith("/"):
            test_uri = f"{mongo_uri}test_db"
        else:
            # Replace or add database name
            parts = mongo_uri.split("/")
            if len(parts) > 3:
                parts[-1] = "test_db"
            else:
                parts.append("test_db")
            test_uri = "/".join(parts)

    return test_uri


@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the Flask application."""
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "test-secret-key")

    # Set test MongoDB URI
    test_mongo_uri = get_test_mongo_uri()
    app.config["MONGO_URI"] = test_mongo_uri
    os.environ["MONGO_URI"] = test_mongo_uri

    with app.test_client() as testing_client:
        with app.app_context():
            yield testing_client


@pytest.fixture(scope="function")
def test_db():
    """Create a clean test database for each test using the database utility."""
    # Use a test-specific database name to avoid conflicts
    test_db_name = f"test_db_{os.getpid()}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"

    # Temporarily set the MONGO_URI for this test
    original_mongo_uri = os.getenv("MONGO_URI")
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    try:
        # Test connection first
        client = MongoClient(test_mongo_uri)
        client.admin.command("ping")
        logger.info("Successfully connected to MongoDB for testing")

        # Get database using your utility function
        db = get_database(test_db_name)

        # Clean up collections before test
        collections = ["users", "projects", "tasks"]
        for collection in collections:
            try:
                db[collection].delete_many({})
            except Exception:
                pass  # Collection might not exist yet

        yield db

        # Clean up collections after test
        for collection in collections:
            try:
                db[collection].delete_many({})
            except Exception:
                pass

        # Close the test client connection
        client.close()

    except Exception as e:
        logger.error(f"Failed to connect to test database: {e}")
        pytest.skip(f"Database connection failed: {e}")

    finally:
        # Restore original MONGO_URI
        if original_mongo_uri:
            os.environ["MONGO_URI"] = original_mongo_uri
        elif "MONGO_URI" in os.environ:
            del os.environ["MONGO_URI"]


@pytest.fixture(scope="function")
def test_collections():
    """Provide access to test collections using the database utility."""
    test_db_name = f"test_db_{os.getpid()}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"

    # Temporarily set the MONGO_URI for this test
    original_mongo_uri = os.getenv("MONGO_URI")
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    try:
        # Test connection first
        client = MongoClient(test_mongo_uri)
        client.admin.command("ping")

        collections = {
            "users": get_collection("users", test_db_name),
            "projects": get_collection("projects", test_db_name),
            "tasks": get_collection("tasks", test_db_name),
        }

        # Clean up before test
        for collection in collections.values():
            try:
                collection.delete_many({})
            except Exception:
                pass

        yield collections

        # Clean up after test
        for collection in collections.values():
            try:
                collection.delete_many({})
            except Exception:
                pass

        client.close()

    except Exception as e:
        logger.error(f"Failed to connect to test database: {e}")
        pytest.skip(f"Database connection failed: {e}")

    finally:
        # Restore original MONGO_URI
        if original_mongo_uri:
            os.environ["MONGO_URI"] = original_mongo_uri
        elif "MONGO_URI" in os.environ:
            del os.environ["MONGO_URI"]


@pytest.fixture(scope="function")
def db_context():
    """Provide a database context manager for tests."""
    test_db_name = f"test_db_{os.getpid()}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"

    # Temporarily set the MONGO_URI for this test
    original_mongo_uri = os.getenv("MONGO_URI")
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    try:
        # Test connection first
        client = MongoClient(test_mongo_uri)
        client.admin.command("ping")

        with DatabaseContext(test_db_name) as db:
            # Clean up before test
            collections = ["users", "projects", "tasks"]
            for collection in collections:
                try:
                    db[collection].delete_many({})
                except Exception:
                    pass

            yield db

            # Clean up after test
            for collection in collections:
                try:
                    db[collection].delete_many({})
                except Exception:
                    pass

        client.close()

    except Exception as e:
        logger.error(f"Failed to connect to test database: {e}")
        pytest.skip(f"Database connection failed: {e}")

    finally:
        # Restore original MONGO_URI
        if original_mongo_uri:
            os.environ["MONGO_URI"] = original_mongo_uri
        elif "MONGO_URI" in os.environ:
            del os.environ["MONGO_URI"]


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
    secret_key = os.getenv("SECRET_KEY", "test-secret-key")
    return jwt.encode(payload, secret_key, algorithm="HS256")


@pytest.fixture
def admin_token(sample_admin):
    """Generate a JWT token for testing admin endpoints."""
    payload = {
        "user_id": "test_admin_id",
        "email": sample_admin["email"],
        "role": sample_admin["role"],
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    secret_key = os.getenv("SECRET_KEY", "test-secret-key")
    return jwt.encode(payload, secret_key, algorithm="HS256")


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
    config.addinivalue_line("markers", "auth: mark test as authentication related")
    config.addinivalue_line("markers", "api: mark test as API related")


def pytest_sessionstart(session):
    """Actions to perform at the start of the test session."""
    # Set test environment variables
    if not os.getenv("SECRET_KEY"):
        os.environ["SECRET_KEY"] = "test-secret-key"

    # Test MongoDB connection
    try:
        test_mongo_uri = get_test_mongo_uri()
        client = MongoClient(test_mongo_uri)
        client.admin.command("ping")
        client.close()
        logger.info(f"Testing with MongoDB URI: {test_mongo_uri[:20]}...")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB at session start: {e}")
        raise


def pytest_sessionfinish(session, exitstatus):
    """Actions to perform at the end of the test session."""
    # Close database connections
    try:
        close_connection()
    except Exception:
        pass