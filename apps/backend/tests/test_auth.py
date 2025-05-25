import pytest
import json
from unittest.mock import patch, MagicMock


@pytest.mark.auth
class TestAuth:
    """Test cases for authentication functionality."""

    def test_register_user_success(self, test_client, test_db, sample_user):
        """Test successful user registration."""
        if not test_db:
            pytest.skip("Database not available")

        response = test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        assert response.status_code == 201
        data = response.get_json()
        assert "message" in data
        assert "user_id" in data

        # Check user was created in database
        user = test_db.users.find_one({"email": sample_user["email"]})
        assert user is not None
        assert user["email"] == sample_user["email"]

    def test_register_duplicate_email(self, test_client, test_db, sample_user):
        """Test registration with duplicate email."""
        if not test_db:
            pytest.skip("Database not available")

        # First registration
        test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        # Second registration with same email
        response = test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_login_success(self, test_client, test_db, sample_user):
        """Test successful user login."""
        if not test_db:
            pytest.skip("Database not available")

        # Register user first
        test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        # Login
        login_data = {
            "email": sample_user["email"],
            "password": sample_user["password"],
        }

        response = test_client.post(
            "/api/auth/login",
            data=json.dumps(login_data),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.get_json()
        assert "access_token" in data
        assert "user" in data

    def test_login_invalid_credentials(self, test_client):
        """Test login with invalid credentials."""
        login_data = {"email": "nonexistent@example.com", "password": "wrongpassword"}

        response = test_client.post(
            "/api/auth/login",
            data=json.dumps(login_data),
            content_type="application/json",
        )

        assert response.status_code == 401
        data = response.get_json()
        assert "error" in data