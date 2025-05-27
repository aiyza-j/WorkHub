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

# Global test database name - shared across all fixtures
TEST_DB_NAME = "workHub"


def get_test_mongo_uri():
    """Get the appropriate MongoDB URI for testing."""
    # Always use the MONGO_URI from environment (GitHub secrets or local .env)
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        raise ValueError(
            "MONGO_URI environment variable is not set. Please set it in GitHub secrets or your .env file"
        )

    logger.info(f"Using MongoDB URI: {mongo_uri[:20]}...")

    return mongo_uri


@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the Flask application."""
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    # Set test MongoDB URI
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    with app.test_client() as testing_client:
        with app.app_context():
            yield testing_client


@pytest.fixture(scope="session")
def test_db_session():
    """Create a test database connection for the entire session."""
    # Temporarily set the MONGO_URI for this test session
    original_mongo_uri = os.getenv("MONGO_URI")
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    try:
        # Test connection first
        client = MongoClient(test_mongo_uri)
        client.admin.command("ping")
        logger.info("Successfully connected to MongoDB for testing")

        # Get database using your utility function
        print("MONGO_URI used in test:", os.getenv("MONGO_URI"))
        db = get_database(TEST_DB_NAME)
        print("Database name in test:", db.name)

        yield db

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
def test_db(test_db_session):
    """Provide a clean test database for each test function."""
    # Clean up collections before test
    collections = ["users", "projects", "tasks"]
    for collection in collections:
        try:
            result = test_db_session[collection].delete_many({})
            logger.info(
                f"Cleaned {result.deleted_count} documents from {collection} collection before test"
            )
        except Exception as e:
            logger.warning(f"Failed to clean {collection} collection before test: {e}")

    yield test_db_session

    # Clean up collections after test
    for collection in collections:
        try:
            result = test_db_session[collection].delete_many({})
            logger.info(
                f"Cleaned {result.deleted_count} documents from {collection} collection after test"
            )
        except Exception as e:
            logger.warning(f"Failed to clean {collection} collection after test: {e}")


@pytest.fixture(scope="function")
def test_collections(test_db_session):
    """Provide access to test collections using the database utility."""
    # Temporarily set the MONGO_URI for this test
    original_mongo_uri = os.getenv("MONGO_URI")
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    try:
        collections = {
            "users": get_collection("users", TEST_DB_NAME),
            "projects": get_collection("projects", TEST_DB_NAME),
            "tasks": get_collection("tasks", TEST_DB_NAME),
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

    finally:
        # Restore original MONGO_URI
        if original_mongo_uri:
            os.environ["MONGO_URI"] = original_mongo_uri
        elif "MONGO_URI" in os.environ:
            del os.environ["MONGO_URI"]


@pytest.fixture(scope="function")
def db_context(test_db_session):
    """Provide a database context manager for tests."""
    # Temporarily set the MONGO_URI for this test
    original_mongo_uri = os.getenv("MONGO_URI")
    test_mongo_uri = get_test_mongo_uri()
    os.environ["MONGO_URI"] = test_mongo_uri

    try:
        with DatabaseContext(TEST_DB_NAME) as db:
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
        "_id": "test_admin_id",
        "email": "admin@example.com",
        "full_name": "Test Admin",
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
    secret_key = os.getenv("SECRET_KEY")
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


@pytest.fixture
def admin_token(sample_admin):
    """Generate a JWsT token for testing admin endpoints."""
    payload = {
        "id": str(sample_admin["_id"]),
        "email": sample_admin["email"],
        "full_name": sample_admin["full_name"],
        "role": sample_admin["role"],
        "exp": datetime.utcnow() + timedelta(hours=2),
    }
    secret_key = os.getenv("SECRET_KEY")
    logger.info(f"Using secret key: {secret_key[:5]}...")
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


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
    # Clean up test database
    try:
        test_mongo_uri = get_test_mongo_uri()
        client = MongoClient(test_mongo_uri)
        client.drop_database(TEST_DB_NAME)
        client.close()
        logger.info(f"Cleaned up test database: {TEST_DB_NAME}")
    except Exception as e:
        logger.warning(f"Failed to clean up test database: {e}")

    # Close database connections
    try:
        close_connection()
    except Exception:
        pass
