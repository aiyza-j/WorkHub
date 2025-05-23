import os
import pytest
import tempfile
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

# Load environment variables
load_dotenv()

# Import your app and database utilities
try:
    from app import app
    from utils.database import (
        get_database,
        get_collection,
        close_connection,
        DatabaseContext,
    )
except ImportError:
    # Fallback imports if structure is different
    try:
        import sys

        sys.path.append(".")
        from app import app
        from database import (
            get_database,
            get_collection,
            close_connection,
            DatabaseContext,
        )
    except ImportError:
        print("Warning: Could not import app or database modules")


@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the Flask application."""
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "test-secret-key")
    app.config["MONGO_URI"] = os.getenv(
        "MONGO_URI", "mongodb://localhost:27017/test_db"
    )

    with app.test_client() as testing_client:
        with app.app_context():
            yield testing_client


@pytest.fixture(scope="function")
def test_db():
    """Create a clean test database for each test."""
    # Use a unique test database name
    test_db_name = f"test_db_{os.getpid()}_{id(object())}"

    try:
        # Create direct MongoDB connection for testing
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        db = client[test_db_name]

        # Clean up collections before test
        collections = ["users", "projects", "tasks"]
        for collection in collections:
            db[collection].delete_many({})

        yield db

        # Clean up collections after test
        for collection in collections:
            db[collection].delete_many({})

        # Drop the test database
        client.drop_database(test_db_name)
        client.close()

    except Exception as e:
        print(f"Database setup error: {e}")
        # Fallback to mock database if MongoDB not available
        yield None


@pytest.fixture(scope="function")
def test_collections():
    """Provide access to test collections."""
    test_db_name = f"test_db_{os.getpid()}_{id(object())}"

    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        db = client[test_db_name]

        collections = {
            "users": db["users"],
            "projects": db["projects"],
            "tasks": db["tasks"],
        }

        # Clean up before test
        for collection in collections.values():
            collection.delete_many({})

        yield collections

        # Clean up after test
        for collection in collections.values():
            collection.delete_many({})

        client.drop_database(test_db_name)
        client.close()

    except Exception as e:
        print(f"Collections setup error: {e}")
        yield {}


@pytest.fixture(scope="function")
def db_context():
    """Provide a database context manager for tests."""
    test_db_name = f"test_db_{os.getpid()}_{id(object())}"

    try:
        with DatabaseContext(test_db_name) as db:
            # Clean up before test
            collections = ["users", "projects", "tasks"]
            for collection in collections:
                db[collection].delete_many({})

            yield db

            # Clean up after test
            for collection in collections:
                db[collection].delete_many({})
    except Exception as e:
        print(f"Database context error: {e}")
        yield None


@pytest.fixture
def sample_user():
    """Create a sample user for testing."""
    return {
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "user",
    }


@pytest.fixture
def sample_admin():
    """Create a sample admin user for testing."""
    return {
        "full_name": "Admin User",
        "email": "admin@example.com",
        "password": "adminpassword123",
        "role": "admin",
    }


@pytest.fixture
def auth_token(sample_user):
    """Generate a JWT token for testing authenticated endpoints."""
    secret_key = os.getenv("SECRET_KEY", "test-secret-key")
    payload = {
        "user_id": "test_user_id",
        "email": sample_user["email"],
        "role": sample_user["role"],
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


@pytest.fixture
def admin_token(sample_admin):
    """Generate a JWT token for testing admin endpoints."""
    secret_key = os.getenv("SECRET_KEY", "test-secret-key")
    payload = {
        "user_id": "admin_user_id",
        "email": sample_admin["email"],
        "role": sample_admin["role"],
        "exp": datetime.utcnow() + timedelta(days=1),
    }
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
    if not test_collections:
        return None

    try:
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
    except Exception as e:
        print(f"Populated DB setup error: {e}")
        return None


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Automatically set up test environment for each test."""
    # Set test environment variables if not set
    if not os.getenv("SECRET_KEY"):
        os.environ["SECRET_KEY"] = "test-secret-key-for-testing"
    if not os.getenv("MONGO_URI"):
        os.environ["MONGO_URI"] = "mongodb://localhost:27017/"

    yield

    # Cleanup after test if needed


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "unit: mark test as a unit test")
    config.addinivalue_line("markers", "integration: mark test as an integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "database: mark test as requiring database")
    config.addinivalue_line("markers", "auth: mark test as authentication test")
    config.addinivalue_line("markers", "api: mark test as API endpoint test")


def pytest_sessionstart(session):
    """Actions to perform at the start of the test session."""
    # Ensure environment variables are loaded
    load_dotenv()

    # Set default test values if not provided
    if not os.getenv("SECRET_KEY"):
        os.environ["SECRET_KEY"] = "test-secret-key-for-testing"
    if not os.getenv("MONGO_URI"):
        os.environ["MONGO_URI"] = "mongodb://localhost:27017/"

    print("Test session started with environment configured")


def pytest_sessionfinish(session, exitstatus):
    """Actions to perform at the end of the test session."""
    try:
        # Close database connections
        close_connection()
    except:
        pass
    print("Test session finished")


# Additional helper fixtures
@pytest.fixture
def mock_db():
    """Provide a mock database for tests that don't need real DB."""

    class MockCollection:
        def __init__(self):
            self.data = []

        def insert_one(self, doc):
            doc["_id"] = ObjectId()
            self.data.append(doc)
            return type("obj", (object,), {"inserted_id": doc["_id"]})

        def find_one(self, query):
            for doc in self.data:
                if all(doc.get(k) == v for k, v in query.items()):
                    return doc
            return None

        def delete_many(self, query):
            self.data = [
                doc
                for doc in self.data
                if not all(doc.get(k) == v for k, v in query.items())
            ]

    class MockDB:
        def __init__(self):
            self.users = MockCollection()
            self.projects = MockCollection()
            self.tasks = MockCollection()

        def __getitem__(self, key):
            return getattr(self, key)

    return MockDB()


@pytest.fixture
def create_test_user(test_db):
    """Helper fixture to create a test user in the database."""

    def _create_user(user_data=None):
        if not test_db:
            return None

        if user_data is None:
            user_data = {
                "full_name": "Test User",
                "email": "test@example.com",
                "password": "hashedpassword",
                "role": "user",
                "created_at": datetime.utcnow(),
            }

        try:
            result = test_db.users.insert_one(user_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating test user: {e}")
            return None

    return _create_user
