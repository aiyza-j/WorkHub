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
  MenuItem,
  Select,
  Pagination,
  InputAdornment,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  alpha,
  Card,
  IconButton,
  Tooltip,
  Fade,
  Backdrop,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  _id: string;
  title: string;
  description: string;
  project_id: string;
  assignee: string;
  status: string;
}

interface ServerResponse {
  tasks: Task[];
  total: number;
}

// Animated components using framer-motion
const MotionTableRow = motion(TableRow);
const MotionCard = motion(Card);
const MotionBox = motion(Box);

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
  boxShadow: 24,
};

const ITEMS_PER_PAGE = 5;
const STATUS_OPTIONS = ['open', 'in-progress', 'completed'];

export default function TaskTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  // Theme and responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', ITEMS_PER_PAGE.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const url = projectId
        ? `http://localhost:5000/api/tasks/project/${projectId}?${params.toString()}`
        : `http://localhost:5000/api/tasks/user-tasks?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: token || '' },
      });

      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data: ServerResponse = await res.json();

      setTasks(data.tasks);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err.message);
      setTasks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchTerm, statusFilter, page, projectId]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    setSelectedTask({
      _id: '',
      title: '',
      description: '',
      project_id: projectId || '',
      assignee: '',
      status: 'open',
    });
    setOpenCreateModal(true);
  };

  const handleOpenDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setOpenDeleteModal(true);
  };

  const handleCloseModals = () => {
    setSelectedTask(null);
    setOpenCreateModal(false);
    setOpenDeleteModal(false);
    setEditingTaskId(null);
  };

  const handleCreate = async () => {
    if (!selectedTask?.title || !selectedTask?.description || !selectedTask?.assignee) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          project_id: projectId,
          assignee: selectedTask.assignee,
        }),
      });
      fetchTasks();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedTask) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/tasks/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          task_id: selectedTask._id,
          status: selectedTask.status,
        }),
      });

      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask?._id) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/tasks/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ task_id: selectedTask._id }),
      });
      fetchTasks();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task._id);
    setSelectedTask({ ...task });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setSelectedTask(null);
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setSelectedTask((prev) => ({ ...prev!, status: e.target.value }));
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.palette.success;
      case 'in-progress':
        return theme.palette.warning;
      default:
        return theme.palette.info;
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        marginTop: 8,
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <Typography variant="h4" gutterBottom component={motion.h4}
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          fontWeight: 500,
          color: theme.palette.primary.main,
          mb: 4
        }}
      >
        Tasks
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          width: '100%',
          mt: 5,
        }}
      >
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth={isMobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }
            }}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            size="small"
            fullWidth={isMobile}
            sx={{
              minWidth: 120,
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {projectId && (
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="contained"
              onClick={handleOpenCreateModal}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                boxShadow: 2,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Create Task
            </Button>
          </MotionBox>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <AnimatePresence>
            <MotionCard
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              sx={{
                width: '100%',
                mb: 2,
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Assignee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                      {projectId && <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No tasks yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task, index) => (
                        <MotionTableRow
                          key={task._id.toString()}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                            '& td': {
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              color: task.status === 'completed' ? 'text.secondary' : 'inherit',
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                              py: 2,
                            }
                          }}
                        >
                          <TableCell sx={{ maxWidth: { xs: 100, sm: 150, md: 200 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {editingTaskId === task._id ? (
                              <TextField
                                value={selectedTask?.title || ''}
                                onChange={(e) =>
                                  setSelectedTask((prev) => ({ ...prev!, title: e.target.value }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                              />
                            ) : (
                              <Tooltip title={task.title} arrow>
                                <span>{task.title}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ maxWidth: { xs: 100, sm: 200, md: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {editingTaskId === task._id ? (
                              <TextField
                                value={selectedTask?.description || ''}
                                onChange={(e) =>
                                  setSelectedTask((prev) => ({
                                    ...prev!,
                                    description: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                              />
                            ) : (
                              <Tooltip title={task.description} arrow>
                                <span>{task.description}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ maxWidth: { xs: 100, sm: 150 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={task.assignee} arrow>
                              <span>{task.assignee}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {editingTaskId === task._id ? (
                              <Select
                                value={selectedTask?.status || 'open'}
                                onChange={handleStatusChange}
                                size="small"
                                fullWidth
                                sx={{
                                  borderRadius: 1,
                                  minWidth: 120
                                }}
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <MenuItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : (
                              <MotionBox
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                                sx={{
                                  display: 'inline-block',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 6,
                                  backgroundColor: alpha(getStatusColor(task.status).main, 0.2),
                                  color: getStatusColor(task.status).dark,
                                  fontWeight: 'medium',
                                  fontSize: '0.8rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5
                                }}
                              >
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </MotionBox>
                            )}
                          </TableCell>
                          {projectId && (
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {editingTaskId === task._id ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <MotionBox
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <IconButton
                                      color="primary"
                                      onClick={handleSave}
                                      size="small"
                                      sx={{
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.success.main, 0.2),
                                        }
                                      }}
                                    >
                                      <CheckIcon fontSize="small" />
                                    </IconButton>
                                  </MotionBox>
                                  <MotionBox
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <IconButton
                                      onClick={handleCancelEdit}
                                      size="small"
                                      sx={{
                                        backgroundColor: alpha(theme.palette.grey[400], 0.1),
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.grey[400], 0.2),
                                        }
                                      }}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </MotionBox>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <MotionBox
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Tooltip title="Edit Task" arrow>
                                      <IconButton
                                        color="primary"
                                        onClick={() => handleEdit(task)}
                                        size="small"
                                        sx={{
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                          }
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </MotionBox>
                                  <MotionBox
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Tooltip title="Delete Task" arrow>
                                      <IconButton
                                        color="error"
                                        onClick={() => handleOpenDeleteModal(task)}
                                        size="small"
                                        sx={{
                                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                                          }
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </MotionBox>
                                </Box>
                              )}
                            </TableCell>
                          )}
                        </MotionTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </MotionCard>
          </AnimatePresence>

          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3,
              mb: 2
            }}
          >
            <Pagination
              count={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size={isMobile ? "small" : "medium"}
              siblingCount={isMobile ? 0 : 1}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  '&.Mui-selected': {
                    fontWeight: 'bold',
                  }
                }
              }}
            />
          </MotionBox>
        </>
      )}

      {/* Create Modal */}
      <Modal
        open={openCreateModal}
        onClose={handleCloseModals}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openCreateModal}>
          <MotionBox
            sx={modalStyle}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Typography
              variant="h6"
              mb={2}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              Create New Task
              <IconButton
                size="small"
                onClick={handleCloseModals}
                sx={{
                  color: theme.palette.grey[500],
                  '&:hover': { color: theme.palette.grey[700] }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={selectedTask?.title || ''}
              onChange={(e) =>
                setSelectedTask((prev) => ({ ...prev!, title: e.target.value }))
              }
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={selectedTask?.description || ''}
              onChange={(e) =>
                setSelectedTask((prev) => ({ ...prev!, description: e.target.value }))
              }
              multiline
              rows={3}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }
              }}
            />
            <TextField
              fullWidth
              label="Assignee Email"
              value={selectedTask?.assignee || ''}
              onChange={(e) =>
                setSelectedTask((prev) => ({ ...prev!, assignee: e.target.value }))
              }
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }
              }}
            />
            <MotionBox
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="contained"
                onClick={handleCreate}
                fullWidth
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 2
                }}
              >
                Create Task
              </Button>
            </MotionBox>
          </MotionBox>
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
          <MotionBox
            sx={modalStyle}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Typography
              variant="h6"
              mb={2}
              sx={{
                color: theme.palette.error.main,
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              Confirm Delete
              <IconButton
                size="small"
                onClick={handleCloseModals}
                sx={{
                  color: theme.palette.grey[500],
                  '&:hover': { color: theme.palette.grey[700] }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Typography mb={4} sx={{ color: theme.palette.text.secondary }}>
              Are you sure you want to delete task <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{selectedTask?.title}</Box>?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <MotionBox
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCloseModals}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                  }}
                >
                  Cancel
                </Button>
              </MotionBox>
              <MotionBox
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    boxShadow: 1
                  }}
                >
                  Delete
                </Button>
              </MotionBox>
            </Box>
          </MotionBox>
        </Fade>
      </Modal>
    </MotionBox>
  );
}