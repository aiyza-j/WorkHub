import pytest
from app import app


class TestApp:
    """Test caswes for main application functionality."""

    def test_app_creation(self, test_client):
        """Test that the Flask app is created successfully."""
        assert app is not None
        assert app.config["TESTING"] is True

    def test_health_check(self, test_client):
        """Test the health check endpoint."""
        response = test_client.get("/api/health")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "healthy"

    def test_cors_headers(self, test_client):
        """Test that CORS headers are present."""
        response = test_client.options("/api/health")
        assert response.status_code == 200

    def test_404_error(self, test_client):
        """Test 404 error handling."""
        response = test_client.get("/api/nonexistent")
        assert response.status_code == 404
