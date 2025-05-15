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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter, useSearchParams } from 'next/navigation';

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

  return (
    <Box sx={{ padding: 4, marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          mt: 5,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
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
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
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
        <Button variant="contained" onClick={handleOpenCreateModal}>
          + Create Task
        </Button>
        )}
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  {projectId && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No tasks yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow
                      key={task._id.toString()}
                      hover
                      sx={{
                        '& td': {
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          color: task.status === 'completed' ? 'text.secondary' : 'inherit',
                        }
                      }}
                    >
                      <TableCell>
                        {editingTaskId === task._id ? (
                          <TextField
                            value={selectedTask?.title || ''}
                            onChange={(e) =>
                              setSelectedTask((prev) => ({ ...prev!, title: e.target.value }))
                            }
                            size="small"
                          />
                        ) : (
                          task.title
                        )}
                      </TableCell>
                      <TableCell>
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
                          />
                        ) : (
                          task.description
                        )}
                      </TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>
                        {editingTaskId === task._id ? (
                          <Select
                            value={selectedTask?.status || 'open'}
                            onChange={handleStatusChange}
                            size="small"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor:
                                task.status === 'completed' ? 'success.light' :
                                task.status === 'in-progress' ? 'warning.light' :
                                'info.light',
                              color: 'common.white',
                            }}
                          >
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTaskId === task._id ? (
                          <>
                            <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
                              Save
                            </Button>
                            <Button variant="outlined" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </>
                        ) : projectId && (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleEdit(task)}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleOpenDeleteModal(task)}
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

      {/* Create Modal */}
      <Modal open={openCreateModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Create New Task
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={selectedTask?.title || ''}
            onChange={(e) =>
              setSelectedTask((prev) => ({ ...prev!, title: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={selectedTask?.description || ''}
            onChange={(e) =>
              setSelectedTask((prev) => ({ ...prev!, description: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Assignee Email"
            value={selectedTask?.assignee || ''}
            onChange={(e) =>
              setSelectedTask((prev) => ({ ...prev!, assignee: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleCreate}>
            Create
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
            Are you sure you want to delete task <strong>{selectedTask?.title}</strong>?
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