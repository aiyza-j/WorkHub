import {ServerResponse} from '../models/Project'

export const fetchProjects = async (page: number, limit: number, searchTerm: string) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (searchTerm) params.append('search', searchTerm);

  const res = await fetch(`http://localhost:5000/api/projects/?${params.toString()}`, {
    headers: { Authorization: token || '' },
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return await res.json() as ServerResponse;
};

export const createProject = async (name: string, description: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/projects/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return await res.json();
};

export const updateProject = async (projectId: string, name: string, description: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/projects/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ project_id: projectId, name, description }),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return await res.json();
};

export const deleteProject = async (projectId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/projects/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ project_id: projectId }),
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return await res.json();
};