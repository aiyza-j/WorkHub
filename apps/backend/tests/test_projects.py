import pytest
import json


@pytest.mark.api
class TestProjects:
    """Test cases for project management functionality."""

    def test_create_project(self, test_client, test_db, auth_token, sample_project):
        """Test creating a new project."""
        if not test_db:
            pytest.skip("Database not available")

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.post(
            "/api/projects/",
            data=json.dumps(sample_project),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert "project_id" in data

        # Check project was created in database
        project = test_db.projects.find_one({"name": sample_project["name"]})
        assert project is not None

    def test_get_user_projects(self, test_client, test_db, auth_token):
        """Test getting user's projects."""
        if not test_db:
            pytest.skip("Database not available")

        # Create a project in database
        test_db.projects.insert_one(
            {
                "name": "Test Project",
                "description": "Test Description",
                "owner_email": "test@example.com",
            }
        )

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.get("/api/projects/", headers=headers)

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_update_project(self, test_client, test_db, auth_token):
        """Test updating a project."""
        if not test_db:
            pytest.skip("Database not available")

        # Create a project in database
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

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.put(
            f"/api/projects/{project_id}",
            data=json.dumps(update_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

    def test_delete_project(self, test_client, test_db, auth_token):
        """Test deleting a project."""
        if not test_db:
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

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = test_client.delete(
            "/api/projects/delete",
            data=json.dumps(delete_data),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200

        project = test_db.projects.find_one({"_id": project_id})
        assert project is None