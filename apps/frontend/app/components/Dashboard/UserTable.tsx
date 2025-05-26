import React from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  alpha,
  useTheme,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import { User } from '../../types/User';
import { rowVariants, getStyles } from './dashboardStyles';

interface UserTableProps {
  users: User[];
  editingUserId: string | null;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleEdit: (user: User) => void;
  handleCancelEdit: () => void;
  handleSave: () => Promise<void>;
  handleOpenDeleteModal: (user: User) => void;
}

const UserTable = ({
  users,
  editingUserId,
  selectedUser,
  setSelectedUser,
  handleEdit,
  handleCancelEdit,
  handleSave,
  handleOpenDeleteModal
}: UserTableProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [editValues, setEditValues] = React.useState<{ full_name: string; email: string }>({
    full_name: '',
    email: ''
  });

  // Refs for TextFields
  const nameInputRef = React.useRef<HTMLDivElement>(null);
  const emailInputRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (editingUserId) {
      const userToEdit = users.find((u) => u._id === editingUserId);
      if (userToEdit) {
        setEditValues({
          full_name: userToEdit.full_name,
          email: userToEdit.email
        });
      }
    }
  }, [editingUserId, users]);

  const handleTextFieldChange = (field: 'full_name' | 'email', value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));

    // Update selectedUser as well to ensure changes are synchronized
    if (selectedUser) {
      setSelectedUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  return (
    <TableContainer component={Paper} sx={styles.tableContainer}>
      <Table>
        <TableHead>
          <TableRow sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }}>
            <TableCell sx={styles.tableHeaderCell}>Full Name</TableCell>
            <TableCell sx={styles.tableHeaderCell}>Email</TableCell>
            <TableCell sx={styles.tableHeaderCell}>Role</TableCell>
            <TableCell sx={{
              ...styles.tableHeaderCell,
              ...styles.actionsCellWidth
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
              users.map((user, index) => {
                const isEditing = editingUserId === user._id;

                return (
                  <TableRow
                    key={user._id}
                    component={motion.tr}
                    variants={rowVariants}
                    initial={false}
                    animate="visible"
                    custom={index}
                    sx={styles.tableRow}
                  >
                    <TableCell sx={{ py: 2 }}>
                      {isEditing ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <TextField
                            inputRef={nameInputRef}
                            value={editValues.full_name}
                            onChange={(e) => handleTextFieldChange('full_name', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={{ maxWidth: 200 }}
                          />
                        </div>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon
                            fontSize="small"
                            sx={styles.userIcon}
                          />
                          <Typography>{user.full_name}</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <TextField
                            inputRef={emailInputRef}
                            value={editValues.email}
                            onChange={(e) => handleTextFieldChange('email', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={{ maxWidth: 240 }}
                          />
                        </div>
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
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave();
                              }}
                              startIcon={<SaveIcon />}
                              size="small"
                              sx={{
                                ...styles.buttonWithShadow,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 3,
                                }
                              }}
                            >
                              Save
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              startIcon={<CancelIcon />}
                              size="small"
                              sx={{
                                ...styles.button,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </motion.div>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <IconButton
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(user);
                              }}
                              size="small"
                              sx={{
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                              disabled={user.role === 'admin'}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <IconButton
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteModal(user);
                              }}
                              size="small"
                              sx={{
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                              disabled={user.role === 'admin'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </motion.div>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;