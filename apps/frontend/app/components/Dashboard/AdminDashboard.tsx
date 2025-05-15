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
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface User {
  _id: string;
  email: string;
  full_name: string;
  role: string;
}

interface ServerResponse {
  users: User[];
  totalCount: number;
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

const ITEMS_PER_PAGE = 5;

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', ITEMS_PER_PAGE.toString());
    if (searchTerm) params.append('search', searchTerm);

    try {
      const res = await fetch(`http://localhost:5000/api/users/?${params.toString()}`, {
        headers: { Authorization: token || '' },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: ServerResponse = await res.json();

      setUsers(data.users);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

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
    setEditingUserId(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify(selectedUser),
      });

      if (!res.ok) throw new Error('Failed to update user');
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

  const handleEdit = (user: User) => {
    setEditingUserId(user._id);
    setSelectedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedUser(null);
  };

  return (
    <Box sx={{ padding: 4, marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        mt: 5
      }}>
        <TextField
          sx={{ width: "80%" }}
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ width: '100%', mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        {editingUserId === user._id ? (
                          <TextField
                            value={selectedUser?.full_name || ''}
                            onChange={(e) =>
                              setSelectedUser((prev) => ({ ...prev!, full_name: e.target.value }))
                            }
                            size="small"
                          />
                        ) : (
                          user.full_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingUserId === user._id ? (
                          <TextField
                            value={selectedUser?.email || ''}
                            onChange={(e) =>
                              setSelectedUser((prev) => ({ ...prev!, email: e.target.value }))
                            }
                            size="small"
                          />
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {editingUserId === user._id ? (
                          <>
                            <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
                              Save
                            </Button>
                            <Button variant="outlined" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleEdit(user)}
                              sx={{ mr: 1 }}
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
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* Edit Modal */}
      <Modal open={openEditModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Edit User
          </Typography>
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
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={openDeleteModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography mb={2}>
            Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>?
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