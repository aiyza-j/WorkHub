import { Task, ServerResponse } from '../types/Task';

const API_BASE_URL = 'http://localhost:5000/api/tasks';

export const fetchTasks = async (
  page: number,
  itemsPerPage: number,
  searchTerm: string,
  statusFilter: string,
  projectId: string | null,
  token: string
): Promise<ServerResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', itemsPerPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  if (statusFilter) params.append('status', statusFilter);

  const url = projectId
    ? `${API_BASE_URL}/project/${projectId}?${params.toString()}`
    : `${API_BASE_URL}/user-tasks?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: token },
  });

  if (!res.ok) throw new Error('Failed to fetch tasks');
  return await res.json();
};

export const createTask = async (
  task: Omit<Task, '_id' | 'status'>,
  token: string
) => {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return await res.json();
};


export const deleteTask = async (taskId: string, token: string) => {
  const res = await fetch(`${API_BASE_URL}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ task_id: taskId }),
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return await res.json();
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, '_id' | 'created_at'>>,
  token: string
) => {
  const res = await fetch(`${API_BASE_URL}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({
      task_id: taskId,
      updates,
    }),
  });

  if (!res.ok) throw new Error('Failed to update task');
  return await res.json();
};