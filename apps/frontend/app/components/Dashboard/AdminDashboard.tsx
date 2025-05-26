'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Pagination,
  InputAdornment,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { User } from '../../types/User';
import { fetchUsers, updateUser, deleteUser } from '../../services/userService';
import {
  tableContainerVariants,
  getStyles
} from './dashboardStyles';
const DeleteUserModal = React.lazy(() => import('../DeleteModals/DeleteUserModal'));
import UserTable from './UserTable';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const theme = useTheme();
  const styles = getStyles(theme);

  const ITEMS_PER_PAGE = 5;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchUsers(page, ITEMS_PER_PAGE, searchTerm);
      setUsers(data.users);
      setTotalCount(data.totalCount);
    } catch (err) {
      if (err instanceof Error) {
      setError(err.message);
      }else{
        setError("An unxknown error occurred.");
      }
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handleCloseModals = () => {
    setSelectedUser(null);
    setOpenDeleteModal(false);
    setEditingUserId(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser);
      loadUsers();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser._id);
      loadUsers();
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
              ...styles.headerTypography,
              fontWeight: 600,
              fontSize: { xs: '1.75rem', md: '2.25rem' }
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
                ...styles.searchField,
                width: { xs: '100%', sm: '70%', md: '80%' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              borderLeft: `4px solid ${theme.palette.error.main}`,
              mb: 2
            }}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <motion.div
              variants={tableContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <UserTable
                users={users}
                editingUserId={editingUserId}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                handleEdit={handleEdit}
                handleCancelEdit={handleCancelEdit}
                handleSave={handleSave}
                handleOpenDeleteModal={handleOpenDeleteModal}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3
                }}
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Pagination
                  count={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }
                  }}
                />
              </Box>
            </motion.div>
          </>
        )}

        {/* Delete Modal */}
        <React.Suspense fallback={<CircularProgress />}>
        {openDeleteModal && (
          <DeleteUserModal
            open={openDeleteModal}
            onClose={handleCloseModals}
            selectedUser={selectedUser}
            onDelete={handleDelete}
          />
        )}
      </React.Suspense>
      </Box>
    </Container>
  );
}

export default AdminDashboard;