'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  Button,
  Pagination,
} from '@mui/material';

interface User {
  _id: string;
  email: string;
  full_name: string;
  role: string;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const limit = 5;

    try {
      const res = await fetch(
        `http://localhost:5000/api/users/?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: { Authorization: token || '' },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handleCloseModals = () => {
    setSelectedUser(null);
    setOpenEditModal(false);
    setOpenDeleteModal(false);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify(selectedUser),
      });
      fetchUsers();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ email: selectedUser.email }),
      });
      fetchUsers();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ padding: 4, marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <TextField
        label="Search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 5, width: "90%"}}
      />

      {loading ? (
        <CircularProgress sx={{ ml:2 }}/>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ width: '90%', mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #3c096c' }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #3c096c' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #3c096c' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #3c096c' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        sx={{ mr: 1,  border: '1px solid #3c096c', color: '#3c096c'}}
                        onClick={() => handleOpenEditModal(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenDeleteModal(user)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </>
      )}

      <Modal open={openEditModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>Edit User</Typography>
          <TextField
            fullWidth
            label="Full Name"
            value={selectedUser?.full_name || ''}
            onChange={(e) =>
              setSelectedUser((prev) => ({ ...prev!, full_name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={selectedUser?.email || ''}
            onChange={(e) =>
              setSelectedUser((prev) => ({ ...prev!, email: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </Modal>

      <Modal open={openDeleteModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>Confirm Delete</Typography>
          <Typography mb={2}>
            Are you sure you want to delete user{' '}
            <strong>{selectedUser?.full_name}</strong>?
          </Typography>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Confirm Delete
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={handleCloseModals}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
