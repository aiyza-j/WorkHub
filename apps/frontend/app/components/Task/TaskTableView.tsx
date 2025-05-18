import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Box,
  Typography,
  MenuItem,
  TextField,
  Select,
  SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Task } from '../../types/Task';
import { tableHeaderStyle, statusBadgeStyle, actionButtonStyle } from './styles';

interface TaskTableViewProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  editingTaskId: string | null;
  selectedTask: Task | null;
  theme: any;
  projectId: string | null;
  userEmails: string[];
  loadingEmails?: boolean;
  emailError?: string | null;
  handleEdit: (task: Task) => void;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleOpenDeleteModal: (task: Task) => void;
  handleStatusChange: (event: SelectChangeEvent) => void;
  handleTaskChange: (field: string, value: string) => void;
  getStatusColor: (status: string) => any;
  setSelectedTask: (task: Task) => void;
}

const TaskTableView: React.FC<TaskTableViewProps> = ({
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
}) => {
  return (
    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', borderRadius: 2, boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "rgba(60, 9, 108, 0.05)" }}>
            <TableCell sx={tableHeaderStyle}>Title</TableCell>
            <TableCell sx={tableHeaderStyle}>Description</TableCell>
            <TableCell sx={tableHeaderStyle}>Assignee</TableCell>
            <TableCell sx={tableHeaderStyle}>Status</TableCell>
            {projectId && <TableCell sx={tableHeaderStyle}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {loading ? 'Loading...' : 'No tasks found'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task._id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '& td': {
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    color: task.status === 'completed' ? 'text.secondary' : 'inherit',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 2,
                  }
                }}
              >
                <TableCell sx={{ maxWidth: { xs: 100, sm: 150, md: 200 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {editingTaskId === task._id ? (
                    <TextField
                      value={selectedTask?.title || ''}
                      onChange={(e) => handleTaskChange('title', e.target.value)}
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
                      onChange={(e) => handleTaskChange('description', e.target.value)}
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
                    {editingTaskId === task._id ? (
                        <>
                        {loadingEmails ? (
                            <Typography variant="body2">Loading emails...</Typography>
                        ) : emailError ? (
                            <Typography color="error" variant="body2">
                            {emailError}
                            </Typography>
                        ) : (
                            <Select
                            value={selectedTask?.assignee || ''}
                            onChange={(e) => handleTaskChange('assignee', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ borderRadius: 1 }}
                            >
                            {userEmails.map((email) => (
                                <MenuItem key={email} value={email}>
                                {email}
                                </MenuItem>
                            ))}
                            </Select>
                        )}
                        </>
                    ) : (
                        <Tooltip title={task.assignee} arrow>
                        <span>{task.assignee}</span>
                        </Tooltip>
                    )}
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
                      {['open', 'in-progress', 'completed'].map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Box
                      sx={statusBadgeStyle(theme, task.status)}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Box>
                  )}
                </TableCell>
                {projectId && <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {editingTaskId === task._id ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={handleSave}
                        size="small"
                        sx={actionButtonStyle(theme, 'success')}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={handleCancelEdit}
                        size="small"
                        sx={actionButtonStyle(theme, 'default')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Task" arrow>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(task)}
                          size="small"
                          sx={actionButtonStyle(theme, 'primary')}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Task" arrow>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteModal(task)}
                          size="small"
                          sx={actionButtonStyle(theme, 'error')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTableView;