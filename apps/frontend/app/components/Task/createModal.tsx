import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Fade,
  Backdrop,
  IconButton,
  alpha,
  CircularProgress,
  MenuItem,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Task } from '../../types/Task';
import { modalStyle } from './styles';

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onChange: (updatedTask: Task) => void;
  onSubmit: () => void;
  theme: any;
  userEmails: string[];
  loadingEmails?: boolean;
  emailError?: string | null;
}

const CreateModal: React.FC<CreateModalProps> = ({
  open,
  onClose,
  task,
  onChange,
  onSubmit,
  theme,
  userEmails,
  loadingEmails,
  emailError,
}) => {
  // Safe default values
  const safeTask = task || {
    _id: '',
    title: '',
    description: '',
    project_id: '',
    assignee: '',
    status: 'open',
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      safeTask.title.trim() !== '' &&
      safeTask.description.trim() !== '' &&
      safeTask.assignee.trim() !== ''
    );
  };

  const handleChange = (field: keyof Task, value: string) => {
    onChange({
      ...safeTask,
      [field]: value
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={modalStyle}
          component={motion.div}
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
              onClick={onClose}
              sx={{
                color: theme.palette.grey[500],
                '&:hover': { color: theme.palette.grey[700] }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Typography>

          {/* Title Field */}
          <TextField
            fullWidth
            label="Title "
            value={safeTask.title}
            onChange={(e) => handleChange('title', e.target.value)}
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

          {/* Description Field */}
          <TextField
            fullWidth
            label="Description "
            value={safeTask.description}
            onChange={(e) => handleChange('description', e.target.value)}
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

          {/* Assignee Field */}
          {loadingEmails ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading assignees...</Typography>
            </Box>
          ) : emailError ? (
            <Typography color="error" sx={{ mb: 3 }}>{emailError}</Typography>
          ) : (
            <Select
              fullWidth

              value={safeTask.assignee}
              onChange={(e) => handleChange('assignee', e.target.value as string)}
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}

            >
              <MenuItem value="" disabled>
                Select Assignee
              </MenuItem>
              {userEmails.map((email) => (
                <MenuItem key={email} value={email}>
                  {email}
                </MenuItem>
              ))}
            </Select>
          )}

          {/* Submit Button */}
          <Box component={motion.div} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              onClick={onSubmit}
              fullWidth
              disabled={!isFormValid()}
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 2,

              }}
            >
              Create Task
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CreateModal;