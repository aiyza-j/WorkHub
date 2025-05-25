import pytest
import json
from bson import ObjectId


@pytest.mark.api
class TestProjects:
    """Test cases for project management functionality."""

    def test_create_project(self, test_client, test_db, auth_token, sample_project):
        """Test creating a new project."""
        if test_db is None:
            pytest.skip("Database not available")

        headers = {"Authorization": auth_token}
        response = test_client.post(
            "/api/projects/",
            data=json.dumps(sample_project),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data == {"message": "Project created"}

        # Check project was created in database
        project = test_db.projects.find_one({"name": sample_project["name"]})
        assert project is not None

    def test_get_user_projects(self, test_client, test_db, auth_token):
        """Test getting user's projects."""
        if test_db is None:
            pytest.skip("Database not available")

        # Create a project in database
        test_db.projects.insert_one(
            {
                "name": "Test Project",
                "description": "Test Description",
                "owner_email": "test@example.com",
            }
        )

        headers = {"Authorization": auth_token}
        response = test_client.get("/api/projects/", headers=headers)

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict)
        assert "projects" in data
        assert isinstance(data["projects"], list)
        assert len(data) >= 1

    def test_update_project(self, test_client, test_db, auth_token):
        """Test updating a project."""
        if test_db is None:
            pytest.skip("Database not available")

        # Create a project in the database
        project_id = test_db.projects.insert_one(
            {
                "name": "Test Project Update",
                "description": "Test Description",
                "owner_email": "test@example.com",
            }
        ).inserted_id

        update_data = {
            "project_id": str(project_id),
            "name": "Updated Project",
            "description": "Updated Description",
        }

        headers = {"Authorization": auth_token}
        response = test_client.put(
            "/api/projects/update",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data == {"message": "Project updated successfully"}

    def test_delete_project(self, test_client, test_db, auth_token):
        """Test deleting a project."""
        if test_db is None:
            pytest.skip("Database not available")

        # Create a project in database
        project_id = test_db.projects.insert_one(
            {
                "name": "Test Project",
                "description": "Test Description",
                "owner_email": "test@example.com",
            }
        ).inserted_id

        delete_data = {"project_id": str(project_id)}

        headers = {"Authorization": auth_token}
        response = test_client.delete(
            "/api/projects/delete",
            data=json.dumps(delete_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

        project = test_db.projects.find_one({"_id": project_id})
        assert project is None
