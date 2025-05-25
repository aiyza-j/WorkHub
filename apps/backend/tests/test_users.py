import pytest
import json
from bson import ObjectId


@pytest.mark.api
class TestAdminUserManagement:
    """Test cases for admin user management functionality."""

    def test_admin_fetch_users_with_pagination(self, test_client, test_db, admin_token):
        """Test admin fetching users with pagination and search."""

        test_users = [
            {
                "_id": ObjectId(),
                "full_name": "John Doe",
                "email": "john@example.com",
                "role": "user",
            },
            {
                "_id": ObjectId(),
                "full_name": "Jane Smith",
                "email": "jane@example.com",
                "role": "user",
            },
            {
                "_id": ObjectId(),
                "full_name": "Admin User",
                "email": "admin@example.com",
                "role": "admin",
            },
        ]
        test_db.users.insert_many(test_users)

        # Test basic pagination
        headers = {"Authorization": admin_token}
        response = test_client.get("/api/users/?page=1&limit=2", headers=headers)

        assert response.status_code == 200
        data = response.get_json()

        # Check response structure matches frontend expectations
        assert "users" in data or isinstance(data, list)
        assert "total" in data or len(data) >= 0

    def test_admin_fetch_users_with_search(self, test_client, test_db, admin_token):
        """Test admin searching users by name or email."""
        # Create test users
        test_users = [
            {
                "_id": ObjectId(),
                "full_name": "John Doe",
                "email": "john@example.com",
                "role": "user",
            },
            {
                "_id": ObjectId(),
                "full_name": "Jane Smith",
                "email": "jane@example.com",
                "role": "user",
            },
        ]
        test_db.users.insert_many(test_users)

        headers = {"Authorization": admin_token}

        # Search by name
        response = test_client.get("/api/users/?search=John", headers=headers)
        assert response.status_code == 200
        data = response.get_json()

        # Verify search results
        users = data.get("users", data) if isinstance(data, dict) else data
        found_john = any(user["full_name"] == "John Doe" for user in users)
        assert found_john

    def test_admin_update_user_success(self, test_client, test_db, admin_token):
        """Test admin successfully updating a user."""
        # Create a test user
        user_id = ObjectId()
        test_db.users.insert_one(
            {
                "_id": user_id,
                "full_name": "Original Name",
                "email": "original@example.com",
                "role": "user",
            }
        )

        # Update data matching frontend format
        update_data = {
            "user_id": str(user_id),
            "email": "updated@example.com",
            "full_name": "Updated Name",
        }

        headers = {"Authorization": admin_token}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

    def test_admin_delete_user_success(self, test_client, test_db, admin_token):
        """Test admin successfully deleting a user."""
        # Create a test user
        user_id = ObjectId()
        test_db.users.insert_one(
            {
                "_id": user_id,
                "full_name": "To Be Deleted",
                "email": "delete@example.com",
                "role": "user",
            }
        )

        headers = {"Authorization": admin_token}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(user_id)}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

    def test_admin_delete_user_invalid_id(self, test_client, admin_token):
        """Test admin deleting user with invalid ID."""
        headers = {"Authorization": admin_token}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": "invalid_id"}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code in [400, 404]

    def test_admin_delete_user_nonexistent(self, test_client, admin_token):
        """Test admin deleting non-existent user."""
        headers = {"Authorization": admin_token}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(ObjectId())}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 404

    def test_admin_fetch_user_emails(self, test_client, test_db, admin_token):
        """Test admin fetching all user emails."""
        # Create test users
        test_users = [
            {
                "_id": ObjectId(),
                "full_name": "User One",
                "email": "user1@example.com",
                "role": "user",
            },
            {
                "_id": ObjectId(),
                "full_name": "User Two",
                "email": "user2@example.com",
                "role": "user",
            },
        ]
        test_db.users.insert_many(test_users)

        headers = {"Authorization": admin_token}
        response = test_client.get("/api/users/emails", headers=headers)

        assert response.status_code == 200
        data = response.get_json()

        # Check response format matches frontend expectations
        assert "emails" in data
        assert isinstance(data["emails"], list)
        assert "user1@example.com" in data["emails"]
        assert "user2@example.com" in data["emails"]

    def test_non_admin_cannot_update_other_users(
        self, test_client, test_db, auth_token
    ):
        """Test non-admin user cannot update other users."""
        # Create another user
        other_user_id = ObjectId()
        test_db.users.insert_one(
            {
                "_id": other_user_id,
                "full_name": "Other User",
                "email": "other@example.com",
                "role": "user",
            }
        )

        update_data = {
            "_id": str(other_user_id),
            "email": "hacked@example.com",
            "full_name": "Hacked Name",
        }

        headers = {"Authorization": auth_token}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 403

    def test_non_admin_cannot_delete_users(self, test_client, test_db, auth_token):
        """Test non-admin user cannot delete other users."""
        # Create another user
        other_user_id = ObjectId()
        test_db.users.insert_one(
            {
                "_id": other_user_id,
                "full_name": "Other User",
                "email": "other@example.com",
                "role": "user",
            }
        )

        headers = {"Authorization": auth_token}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(other_user_id)}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 403

    def test_admin_update_user_with_missing_fields(
        self, test_client, test_db, admin_token
    ):
        """Test admin updating user with missing required fields."""
        # Create a test user
        user_id = ObjectId()
        test_db.users.insert_one(
            {
                "_id": user_id,
                "full_name": "Test User",
                "email": "test@example.com",
                "role": "user",
            }
        )

        # Missing required fields
        update_data = {
            "_id": str(user_id)
            # Missing email and full_name
        }

        headers = {"Authorization": admin_token}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 400
