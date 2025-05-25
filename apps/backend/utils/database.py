import os
from pymongo import MongoClient
from pymongo.database import Database
from typing import Optional
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


_client: Optional[MongoClient] = None
_database: Optional[Database] = None


def get_mongo_client() -> MongoClient:
    """
    Get MongoDB client instance (singleton pattern).

    Returns:
        MongoClient: MongoDB client instance
    """
    global _client

    if _client is None:
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise ValueError("MONGO_URI environment variable is not set")

        try:
            # Create client with connection timeout settings for better reliability
            _client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=10000,  # 10 seconds
                connectTimeoutMS=10000,  # 10 seconds
                socketTimeoutMS=10000,  # 10 seconds
                maxPoolSize=10,
                retryWrites=True
            )

            # Test the connection with retries
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    _client.admin.command("ping")
                    logger.info("Successfully connected to MongoDB")
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    logger.warning(f"Connection attempt {attempt + 1} failed, retrying...")
                    time.sleep(2)

        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            _client = None
            raise

    return _client


def get_database(db_name: Optional[str] = None) -> Database:
    """
    Get database instance.

    Args:
        db_name (str, optional): Database name. If not provided, uses default from URI or 'app_db'

    Returns:
        Database: MongoDB database instance
    """
    global _database

    client = get_mongo_client()

    if db_name:
        return client[db_name]

    if _database is None:
        # Extract database name from URI or use default
        mongo_uri = os.getenv("MONGO_URI", "")

        # Try to extract database name from URI
        if "/" in mongo_uri:
            # Split by '/' and get the last part, then remove query parameters
            uri_parts = mongo_uri.split("/")
            if len(uri_parts) > 3:  # mongodb://host:port/dbname
                db_name = uri_parts[-1].split("?")[0]
                if db_name and db_name != "":
                    _database = client[db_name]
                else:
                    _database = client["app_db"]  # default database name
            else:
                _database = client["app_db"]  # default database name
        else:
            _database = client["app_db"]  # default database name

        logger.info(f"Using database: {_database.name}")

    return _database


def get_collection(collection_name: str, db_name: Optional[str] = None):
    """
    Get a specific collection from the database.

    Args:
        collection_name (str): Name of the collection
        db_name (str, optional): Database name

    Returns:
        Collection: MongoDB collection instance
    """
    db = get_database(db_name)
    return db[collection_name]


def close_connection():
    """Close the MongoDB connection."""
    global _client, _database

    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("MongoDB connection closed")


def init_database():
    """Initialize database with any required setup (indexes, etc.)."""
    try:
        db = get_database()

        # Create indexes for better performance
        users_collection = db.users
        try:
            users_collection.create_index("email", unique=True)
        except Exception as e:
            logger.warning(f"Index creation for users.email failed (may already exist): {e}")

        try:
            users_collection.create_index("created_at")
        except Exception as e:
            logger.warning(f"Index creation for users.created_at failed: {e}")

        projects_collection = db.projects
        try:
            projects_collection.create_index("owner_email")
        except Exception as e:
            logger.warning(f"Index creation for projects.owner_email failed: {e}")

        try:
            projects_collection.create_index("created_at")
        except Exception as e:
            logger.warning(f"Index creation for projects.created_at failed: {e}")

        tasks_collection = db.tasks
        try:
            tasks_collection.create_index("project_id")
        except Exception as e:
            logger.warning(f"Index creation for tasks.project_id failed: {e}")

        try:
            tasks_collection.create_index("assignee")
        except Exception as e:
            logger.warning(f"Index creation for tasks.assignee failed: {e}")

        try:
            tasks_collection.create_index("status")
        except Exception as e:
            logger.warning(f"Index creation for tasks.status failed: {e}")

        try:
            tasks_collection.create_index("created_at")
        except Exception as e:
            logger.warning(f"Index creation for tasks.created_at failed: {e}")

        logger.info("Database initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def health_check() -> bool:
    """
    Check if database connection is healthy.

    Returns:
        bool: True if connection is healthy, False otherwise
    """
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# Context manager for database operations
class DatabaseContext:
    """Context manager for database operations with automatic cleanup."""

    def __init__(self, db_name: Optional[str] = None):
        self.db_name = db_name
        self.db = None

    def __enter__(self):
        self.db = get_database(self.db_name)
        return self.db

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Any cleanup if needed
        pass