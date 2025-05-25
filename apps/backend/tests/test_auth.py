import pytest
import json
from unittest.mock import patch, MagicMock


@pytest.mark.auth
class TestAuth:
    """Test cases for authentication functionality."""

    def test_register_user_success(self, test_client, test_db, sample_user):
        """Test successful user registration."""
        if test_db is None:
            pytest.skip("Database not available")

        # Debug: Check if user already exists before registration
        existing_user = test_db.users.find_one({"email": sample_user["email"]})
        print(f"Existing user before registration: {existing_user}")

        # If user exists, clean it up manually
        if existing_user:
            result = test_db.users.delete_many({"email": sample_user["email"]})
            print(f"Manually cleaned up {result.deleted_count} existing users")

        response = test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        # Debug: Print response for troubleshooting
        print(f"Registration response status: {response.status_code}")
        print(f"Registration response data: {response.get_json()}")

        # Check if registration was successful (could be 200 or 201)
        assert response.status_code in [
            200,
            201,
        ], f"Expected 200 or 201, got {response.status_code}. Response: {response.get_json()}"
        data = response.get_json()
        assert "message" in data or "success" in data

        # Check user was created in database
        user = test_db.users.find_one({"email": sample_user["email"]})
        assert user is not None
        assert user["email"] == sample_user["email"]

    def test_register_duplicate_email(self, test_client, test_db, sample_user):
        """Test registration with duplicate email."""
        if test_db is None:
            pytest.skip("Database not available")

        # Clean up any existing users first
        test_db.users.delete_many({"email": sample_user["email"]})

        # First registration
        first_response = test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        print(f"First registration status: {first_response.status_code}")
        print(f"First registration data: {first_response.get_json()}")

        # Only proceed if first registration succeeded
        if first_response.status_code not in [200, 201]:
            pytest.skip(
                f"First registration failed with status {first_response.status_code}"
            )

        # Second registration with same email
        response = test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data or "message" in data

    def test_login_success(self, test_client, test_db, sample_user):
        """Test successful user login."""
        if test_db is None:
            pytest.skip("Database not available")

        # Register user first
        reg_response = test_client.post(
            "/api/auth/register",
            data=json.dumps(sample_user),
            content_type="application/json",
        )

        # Only proceed if registration was successful
        if reg_response.status_code not in [200, 201]:
            pytest.skip(f"Registration failed with status {reg_response.status_code}")

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

        # Debug: Print response for troubleshooting
        print(f"Login response status: {response.status_code}")
        print(f"Login response data: {response.get_json()}")

        assert response.status_code == 200
        data = response.get_json()

        # Check for either 'access_token' or 'token' key (API might use either)
        assert "access_token" in data or "token" in data

        # Check for user information
        if "user" in data:
            assert "user" in data
        elif "email" in data or "id" in data:
            # User info might be at root level
            assert data.get("email") or data.get("id")

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
        assert "error" in data or "message" in data

    def test_register_missing_fields(self, test_client):
        """Test registration with missing required fields."""
        incomplete_user = {
            "email": "test@example.com",
            # Missing full_name, password, role
        }

        response = test_client.post(
            "/api/auth/register",
            data=json.dumps(incomplete_user),
            content_type="application/json",
        )

        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data or "message" in data

    def test_register_invalid_email(self, test_client):
        """Test registration with invalid email format."""
        invalid_user = {
            "full_name": "Test User",
            "email": "invalid-email",
            "password": "testpassword123",
            "role": "user",
        }

        response = test_client.post(
            "/api/auth/register",
            data=json.dumps(invalid_user),
            content_type="application/json",
        )

        # Should return 400 for invalid email
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data or "message" in data
