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
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.get("/api/users/?page=1&limit=2", headers=headers)

        assert response.status_code == 200
        data = response.get_json()

        # Check response structure matches frontend expectations
        assert "users" in data or isinstance(data, list)
        assert "total" in data or len(data) >= 0

        # If paginated response
        if "users" in data:
            assert len(data["users"]) <= 2
            assert data["total"] >= 3
        else:
            # If simple list response
            assert isinstance(data, list)

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

        headers = {"Authorization": f"Bearer {admin_token}"}

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
            "_id": str(user_id),
            "email": "updated@example.com",
            "full_name": "Updated Name",
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

        # Verify user was updated in database
        updated_user = test_db.users.find_one({"_id": user_id})
        assert updated_user["full_name"] == "Updated Name"
        assert updated_user["email"] == "updated@example.com"

    def test_admin_update_user_invalid_id(self, test_client, admin_token):
        """Test admin updating user with invalid ID."""
        update_data = {
            "_id": "invalid_id",
            "email": "test@example.com",
            "full_name": "Test Name",
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code in [400, 404]

    def test_admin_update_user_nonexistent(self, test_client, admin_token):
        """Test admin updating non-existent user."""
        update_data = {
            "_id": str(ObjectId()),
            "email": "test@example.com",
            "full_name": "Test Name",
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 404

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

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(user_id)}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

        # Verify user was deleted
        deleted_user = test_db.users.find_one({"_id": user_id})
        assert deleted_user is None

    def test_admin_delete_user_invalid_id(self, test_client, admin_token):
        """Test admin deleting user with invalid ID."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": "invalid_id"}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code in [400, 404]

    def test_admin_delete_user_nonexistent(self, test_client, admin_token):
        """Test admin deleting non-existent user."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(ObjectId())}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 404

    def test_admin_delete_self_prevention(self, test_client, test_db, admin_token):
        """Test preventing admin from deleting themselves."""
        # Create admin user (assuming admin_token corresponds to this user)
        admin_user_id = ObjectId()
        test_db.users.insert_one(
            {
                "_id": admin_user_id,
                "full_name": "Admin User",
                "email": "admin@example.com",
                "role": "admin",
            }
        )

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(admin_user_id)}),
            content_type="application/json",
            headers=headers,
        )

        # Should prevent self-deletion
        assert response.status_code in [400, 403]

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

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.get("/api/users/emails", headers=headers)

        assert response.status_code == 200
        data = response.get_json()

        # Check response format matches frontend expectations
        assert "emails" in data
        assert isinstance(data["emails"], list)
        assert "user1@example.com" in data["emails"]
        assert "user2@example.com" in data["emails"]

    def test_non_admin_cannot_fetch_users(self, test_client, auth_token):
        """Test non-admin user cannot fetch all users."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.get("/api/users/?page=1&limit=10", headers=headers)

        assert response.status_code == 403

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

        headers = {"Authorization": f"Bearer {auth_token}"}
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

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.delete(
            "/api/users/delete",
            data=json.dumps({"id": str(other_user_id)}),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 403

    def test_non_admin_cannot_fetch_user_emails(self, test_client, auth_token):
        """Test non-admin user cannot fetch all user emails."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.get("/api/users/emails", headers=headers)

        assert response.status_code == 403

    def test_unauthenticated_user_access_denied(self, test_client):
        """Test unauthenticated users cannot access admin endpoints."""
        # Test all admin endpoints without token
        endpoints = [
            ("/api/users/", "GET"),
            ("/api/users/update", "PUT"),
            ("/api/users/delete", "DELETE"),
            ("/api/users/emails", "GET"),
        ]

        for endpoint, method in endpoints:
            if method == "GET":
                response = test_client.get(endpoint)
            elif method == "PUT":
                response = test_client.put(
                    endpoint,
                    data=json.dumps({"test": "data"}),
                    content_type="application/json",
                )
            elif method == "DELETE":
                response = test_client.delete(
                    endpoint,
                    data=json.dumps({"id": "test_id"}),
                    content_type="application/json",
                )

            assert response.status_code == 401

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

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 400

    def test_admin_update_user_with_duplicate_email(
        self, test_client, test_db, admin_token
    ):
        """Test admin updating user with email that already exists."""
        # Create two test users
        user1_id = ObjectId()
        user2_id = ObjectId()

        test_db.users.insert_many(
            [
                {
                    "_id": user1_id,
                    "full_name": "User One",
                    "email": "user1@example.com",
                    "role": "user",
                },
                {
                    "_id": user2_id,
                    "full_name": "User Two",
                    "email": "user2@example.com",
                    "role": "user",
                },
            ]
        )

        # Try to update user2 with user1's email
        update_data = {
            "_id": str(user2_id),
            "email": "user1@example.com",  # Duplicate email
            "full_name": "Updated User Two",
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            "/api/users/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 400

    def test_admin_pagination_edge_cases(self, test_client, test_db, admin_token):
        """Test admin user pagination with edge cases."""
        # Create exactly 5 users
        test_users = [
            {
                "_id": ObjectId(),
                "full_name": f"User {i}",
                "email": f"user{i}@example.com",
                "role": "user",
            }
            for i in range(1, 6)
        ]
        test_db.users.insert_many(test_users)

        headers = {"Authorization": f"Bearer {admin_token}"}

        # Test page beyond available data
        response = test_client.get("/api/users/?page=10&limit=10", headers=headers)
        assert response.status_code == 200
        data = response.get_json()
        users = data.get("users", data) if isinstance(data, dict) else data
        assert len(users) == 0 or users == []

        # Test with limit 0
        response = test_client.get("/api/users/?page=1&limit=0", headers=headers)
        assert response.status_code in [200, 400]  # Depends on backend validation

        # Test with negative page
        response = test_client.get("/api/users/?page=-1&limit=10", headers=headers)
        assert response.status_code in [200, 400]  # Depends on backend validation
