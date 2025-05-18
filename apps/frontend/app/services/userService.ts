import { User, ServerResponse } from '../types/User';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchUsers = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<ServerResponse> => {
  const token = localStorage.getItem('token');

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (searchTerm) params.append('search', searchTerm);

  const res = await fetch(`${API_BASE_URL}/users/?${params.toString()}`, {
    headers: { Authorization: token || '' },
  });

  if (!res.ok) throw new Error('Failed to fetch users');

  return await res.json();
};

export const updateUser = async (user: User): Promise<void> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}/users/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) throw new Error('Failed to update user');
};

export const deleteUser = async (email: string): Promise<void> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}/users/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error('Failed to delete user');
};

export const fetchUserEmails = async (): Promise<string[]> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}/users/emails`, {
    headers: { Authorization: token || '' },
  });

  if (!res.ok) throw new Error('Failed to fetch user emails');

  const data = await res.json();
  return data.emails;
};