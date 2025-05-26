import React from 'react';
import {
  Card,
  Typography,
  TextField,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  SelectChangeEvent,
  Theme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Task } from '../../types/Task';
import { statusBadgeStyle, actionButtonStyle } from './styles';

interface MobileTaskViewProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  editingTaskId: string | null;
  selectedTask: Task | null;
  theme: Theme;
  userEmails: string[];
  loadingEmails?: boolean;
  emailError?: string | null;
  handleEdit: (task: Task) => void;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleOpenDeleteModal: (task: Task) => void;
  handleStatusChange: (event: SelectChangeEvent) => void;
  handleTaskChange: (field: string, value: string) => void;
  getStatusColor: (status: string) => void;
  setSelectedTask: (task: Task) => void;
}

const MobileTaskView: React.FC<MobileTaskViewProps> = ({
  tasks,
  loading,
  editingTaskId,
  selectedTask,
  theme,
  userEmails,
  loadingEmails,
  emailError,
  handleEdit,
  handleSave,
  handleCancelEdit,
  handleOpenDeleteModal,
  handleStatusChange,
  handleTaskChange,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tasks.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            {loading ? 'Loading tasks...' : 'No tasks found'}
          </Typography>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card
            key={task._id}
            sx={{
              p: 2,
              position: 'relative',
              cursor: editingTaskId === task._id ? 'default' : 'pointer',
              '&:hover': {
                boxShadow: 4,
                transform: editingTaskId === task._id ? 'none' : 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out',
              }
            }}
          >
            <Box sx={{ mb: 1 }}>
              {editingTaskId === task._id ? (
                <TextField
                  fullWidth
                  label="Title"
                  value={selectedTask?.title || ''}
                  onChange={(e) => handleTaskChange('title', e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {task.title}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              {editingTaskId === task._id ? (
                <TextField
                  fullWidth
                  label="Description"
                  value={selectedTask?.description || ''}
                  onChange={(e) => handleTaskChange('description', e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                            sx={{ mb: 2 }}
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
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Assignee:</strong> {task.assignee}
                    </Typography>
                    )}
              {editingTaskId === task._id ? (
                <Select
                  value={selectedTask?.status || 'open'}
                  onChange={handleStatusChange}
                  size="small"
                  sx={{
                    minWidth: 120,
                    borderRadius: 1
                  }}
                >
                  {['open', 'in-progress', 'completed'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Chip
                  label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  sx={statusBadgeStyle(theme, task.status)}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {editingTaskId === task._id ? (
                <>
                  <IconButton
                    color="primary"
                    onClick={handleSave}
                    size="small"
                    sx={actionButtonStyle()}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleCancelEdit}
                    size="small"
                    sx={actionButtonStyle()}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Tooltip title="Edit Task">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(task)}
                      size="small"
                      sx={actionButtonStyle()}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Task">
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteModal(task)}
                      size="small"
                      sx={actionButtonStyle()}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Card>
        ))
      )}
    </Box>
  );
};

export default MobileTaskView;