  import React, { useEffect, useState, useCallback } from 'react';
  import {
    Box,
    Typography,
    CircularProgress,
    TextField,
    Button,
    Select,
    MenuItem,
    InputAdornment,
    Pagination,
    useTheme,
    useMediaQuery,
  } from '@mui/material';
  import SearchIcon from '@mui/icons-material/Search';
  import AddIcon from '@mui/icons-material/Add';
  import { motion } from 'framer-motion';
  import { useRouter, useSearchParams } from 'next/navigation';
  import { Task, ServerResponse, STATUS_OPTIONS, ITEMS_PER_PAGE } from '../../types/Task';
  import { fetchTasks, createTask, deleteTask, updateTask } from '../../services/taskServices';
  import { fetchUserEmails } from '../../services/userService';
  import CreateModal from './createModal';
  import DeleteModal from './DeleteModal';
  import TaskTableView from './TaskTableView';
  import MobileTaskView from './MobileTaskView';
  import { SelectChangeEvent } from '@mui/material/Select';
  import { tableHeaderStyle, statusBadgeStyle, actionButtonStyle } from './styles';

  const TaskTable = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [userEmails, setUserEmails] = useState<string[]>([]);
    const [loadingEmails, setLoadingEmails] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    // Debounce search term to prevent excessive API calls
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }, [searchTerm]);

    const loadTasks = useCallback(async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || '';

      try {
        const data = await fetchTasks(
          page,
          ITEMS_PER_PAGE,
          debouncedSearchTerm,
          statusFilter,
          projectId,
          token
        );
        setTasks(data.tasks);
        setTotalCount(data.total);
      } catch (err: any) {
        setError(err.message);
        setTasks([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }, [page, debouncedSearchTerm, statusFilter, projectId]);

    useEffect(() => {
      loadTasks();
    }, [loadTasks]);

    useEffect(() => {
      setPage(1);
    }, [debouncedSearchTerm, statusFilter]);

    useEffect(() => {
        const loadUserEmails = async () => {

          setLoadingEmails(true);
          try {
            const emails = await fetchUserEmails();
            setUserEmails(emails);
          } catch (err) {
            setEmailError('Failed to load user emails');
            console.error('Error fetching user emails:', err);
          } finally {
            setLoadingEmails(false);
          }
        };

        loadUserEmails();
      }, []);

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
      const token = localStorage.getItem('token') || '';

      try {
        await createTask({
          title: selectedTask.title,
          description: selectedTask.description,
          project_id: selectedTask.project_id,
          assignee: selectedTask.assignee,
        }, token);
        loadTasks();
        handleCloseModals();
      } catch (err) {
        console.error('Error creating task:', err);
      }
    };

    const handleSave = async () => {
    if (!selectedTask) return;
    const token = localStorage.getItem('token') || '';

    try {
      await updateTask(
        selectedTask._id,
        {
          title: selectedTask.title,
          description: selectedTask.description,
          assignee: selectedTask.assignee,
          status: selectedTask.status,
        },
        token
      );
      loadTasks();
      setEditingTaskId(null);
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
    };


    const handleDelete = async () => {
      if (!selectedTask?._id) return;
      const token = localStorage.getItem('token') || '';

      try {
        await deleteTask(selectedTask._id, token);
        loadTasks();
        handleCloseModals();
      } catch (err) {
        console.error('Error deleting task:', err);
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

    const handleStatusChange = (event: SelectChangeEvent) => {
      setSelectedTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: event.target.value,
        };
      });
    };

    const handleTaskChange = (field: string, value: string) => {
      setSelectedTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [field]: value,
        };
      });
    };

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

    const commonProps = {
      tasks,
      loading,
      error,
      editingTaskId,
      selectedTask,
      theme,
      projectId,
      userEmails,
      loadingEmails,
      emailError,
      handleEdit,
      handleSave,
      handleCancelEdit,
      handleOpenDeleteModal,
      handleStatusChange,
      handleTaskChange,
      getStatusColor,
      setSelectedTask,
    };

    return (
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          marginTop: 8,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h4" gutterBottom
            sx={{
              fontWeight: 500,
              color: theme.palette.primary.main,
              mb: 4
            }}
          >
            {projectId ? `Tasks for Project` : 'To Do Tasks'}
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
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                },
              }}
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
              onChange={(e) => setStatusFilter(e.target.value as string)}
              displayEmpty
              size="small"
              fullWidth={isMobile}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
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
            <Box>
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
            </Box>
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
            {isMobile ? (
              <MobileTaskView {...commonProps} />
            ) : (
              <TaskTableView {...commonProps} />
            )}

            <Box
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
                      backgroundColor: `${theme.palette.primary.main}10`,
                    },
                    '&.Mui-selected': {
                      fontWeight: 'bold',
                    }
                  }
                }}
              />
            </Box>
          </>
        )}

        <CreateModal
          open={openCreateModal}
          onClose={handleCloseModals}
          task={selectedTask}
          onChange={setSelectedTask}
          onSubmit={handleCreate}
          theme={theme}
          userEmails={userEmails}
          loadingEmails={loadingEmails}
          emailError={emailError}
        />

        <DeleteModal
          open={openDeleteModal}
          onClose={handleCloseModals}
          task={selectedTask}
          onDelete={handleDelete}
          theme={theme}
        />
      </Box>
    );
  };

  export default TaskTable;