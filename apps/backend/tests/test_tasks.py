import pytest
import json


@pytest.mark.api
class TestTasks:
    """Test cases for task management functionality."""

    def test_create_task(self, test_client, test_db, auth_token, sample_task):
        """Test creating a new task."""
        headers = {"Authorization": auth_token}
        response = test_client.post(
            "/api/tasks/",
            data=json.dumps(sample_task),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 201

    def test_get_user_tasks(self, test_client, test_db, auth_token):
        """Test getting user's tasks."""
        project = {
            "name": "Sample Project",
            "description": "Project Desc, 'owner_email': 'test@example.com'",
        }
        project_id = test_db.projects.insert_one(project).inserted_id
        # Create a task in database
        test_db.tasks.insert_one(
            {
                "title": "Test Task",
                "description": "Test Description",
                "project_id": str(project_id),
                "assignee": "test@example.com",
                "status": "open",
            }
        )

        headers = {"Authorization": auth_token}
        response = test_client.get(f"/api/tasks/project/{project_id}", headers=headers)

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict)

    def test_update_task(self, test_client, test_db, auth_token):
        """Test updating a task via PUT /api/tasks/update."""
        project_id = test_db.projects.insert_one(
            {
                "name": "Update Project",
                "description": "Test project",
                "owner_email": "test@example.com",
            }
        ).inserted_id

        task_id = test_db.tasks.insert_one(
            {
                "title": "Old Title",
                "description": "Old Desc",
                "project_id": str(project_id),
                "assignee": "test@example.com",
                "status": "open",
            }
        ).inserted_id

        headers = {"Authorization": auth_token}
        update_payload = {
            "task_id": str(task_id),
            "updates": {
                "title": "Updated Title",
                "description": "Updated Desc",
                "status": "completed",
            },
        }

        response = test_client.put(
            "/api/tasks/update",
            data=json.dumps(update_payload),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200
        updated_task = test_db.tasks.find_one({"_id": task_id})
        assert updated_task["title"] == "Updated Title"
        assert updated_task["status"] == "completed"

    def test_delete_task(self, test_client, test_db, auth_token):
        """Test deleting a task via DELETE /api/tasks/delete."""
        project_id = test_db.projects.insert_one(
            {
                "name": "Delete Project",
                "description": "Test project",
                "owner_email": "test@example.com",
            }
        ).inserted_id

        task_id = test_db.tasks.insert_one(
            {
                "title": "To be deleted",
                "description": "Delete me",
                "project_id": str(project_id),
                "assignee": "test@example.com",
                "status": "open",
            }
        ).inserted_id

        headers = {"Authorization": auth_token}
        delete_payload = {"task_id": str(task_id)}

        response = test_client.delete(
            "/api/tasks/delete",
            data=json.dumps(delete_payload),
            content_type="application/json",
            headers=headers,
        )

        assert response.status_code == 200
        deleted_task = test_db.tasks.find_one({"_id": task_id})
        assert deleted_task is None
