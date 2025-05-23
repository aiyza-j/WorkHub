import os
from pymongo import MongoClient
from pymongo.database import Database
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global MongoDB client instance
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
            _client = MongoClient(mongo_uri)
            # Test the connection
            _client.admin.command("ping")
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
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
            db_name = mongo_uri.split("/")[-1].split("?")[0]
            if db_name and db_name != "":
                _database = client[db_name]
            else:
                _database = client["app_db"]  # default database name
        else:
            _database = client["app_db"]  # default database name

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
        users_collection.create_index("email", unique=True)
        users_collection.create_index("created_at")

        projects_collection = db.projects
        projects_collection.create_index("owner_email")
        projects_collection.create_index("created_at")

        tasks_collection = db.tasks
        tasks_collection.create_index("project_id")
        tasks_collection.create_index("assignee")
        tasks_collection.create_index("status")
        tasks_collection.create_index("created_at")

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
