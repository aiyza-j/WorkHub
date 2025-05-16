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
  Container,
  useTheme,
  alpha,
  Fade,
  Backdrop,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import { motion, AnimatePresence } from 'framer-motion';

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

const AdminDashboard = () => {
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
  const theme = useTheme();
  const MotionTableRow = motion(TableRow);

  const ITEMS_PER_PAGE = 5;

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: { xs: 3, sm: 4 },
  };

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

  const tableContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: 2, marginTop: { xs: 2, sm: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              mb: 4,
              color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)',
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              paddingBottom: 1,
              display: 'inline-block'
            }}
          >
            Admin Dashboard
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
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
              sx={{
                width: { xs: "100%", sm: "80%" },
                '.MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.07)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }
              }}
              label="Search Users"
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
        </motion.div>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <motion.div
              variants={tableContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <TableContainer
                component={Paper}
                sx={{
                  width: '100%',
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }}>
                      <TableCell sx={{
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        py: 2
                      }}>Full Name</TableCell>
                      <TableCell sx={{
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                      }}>Email</TableCell>
                      <TableCell sx={{
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                      }}>Role</TableCell>
                      <TableCell sx={{
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        width: { xs: 120, sm: 180 }
                      }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              No users found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user, index) => (
                          <MotionTableRow
                            key={user._id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            exit={{ opacity: 0, x: -20 }}

                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04)
                              },
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <TableCell sx={{ py: 2 }}>
                              {editingUserId === user._id ? (
                                <TextField
                                  value={selectedUser?.full_name || ''}
                                  onChange={(e) =>
                                    setSelectedUser((prev) => ({ ...prev!, full_name: e.target.value }))
                                  }
                                  size="small"
                                  fullWidth
                                  sx={{ maxWidth: 200 }}
                                />
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon
                                    fontSize="small"
                                    sx={{
                                      color: alpha(theme.palette.primary.main, 0.7),
                                      opacity: 0.8
                                    }}
                                  />
                                  <Typography>{user.full_name}</Typography>
                                </Box>
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
                                  fullWidth
                                  sx={{ maxWidth: 240 }}
                                />
                              ) : (
                                user.email
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"

                              />
                            </TableCell>
                            <TableCell>
                              {editingUserId === user._id ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="contained"
                                      onClick={handleSave}
                                      startIcon={<SaveIcon />}
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        textTransform: 'none',
                                        boxShadow: 1
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="outlined"
                                      onClick={handleCancelEdit}
                                      startIcon={<CancelIcon />}
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        textTransform: 'none'
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </motion.div>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      onClick={() => handleEdit(user)}
                                      startIcon={<EditIcon />}
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        textTransform: 'none'
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleOpenDeleteModal(user)}
                                      startIcon={<DeleteIcon />}
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        textTransform: 'none'
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </motion.div>
                                </Box>
                              )}
                            </TableCell>
                          </MotionTableRow>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'center',
                '& .MuiPaginationItem-root': {
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }
              }}>
                <Pagination
                  count={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton={false}
                  showLastButton={page < Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  siblingCount={1}
                  boundaryCount={1}
                />

              </Box>
            </motion.div>
          </>
        )}

        {/* Edit Modal */}
        <Modal
          open={openEditModal}
          onClose={handleCloseModals}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={openEditModal}>
            <Box sx={modalStyle}>
              <Typography variant="h6" mb={3} sx={{ fontWeight: 600 }}>
                Edit User
              </Typography>
              <TextField
                fullWidth
                label="Full Name"
                value={selectedUser?.full_name || ''}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev!, full_name: e.target.value }))
                }
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedUser?.email || ''}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev!, email: e.target.value }))
                }
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Save Changes
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModals}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none'
                    }}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Delete Modal */}
        <Modal
          open={openDeleteModal}
          onClose={handleCloseModals}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={openDeleteModal}>
            <Box sx={modalStyle}>
              <Typography variant="h6" mb={1} sx={{ fontWeight: 600 }}>
                Confirm Delete
              </Typography>
              <Typography mb={3} color="text.secondary">
                Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>?
                This action cannot be undone.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    startIcon={<DeleteIcon />}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none'
                    }}
                  >
                    Confirm Delete
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModals}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none'
                    }}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Container>
  );
}

export default AdminDashboard;