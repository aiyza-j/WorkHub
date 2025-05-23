import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Project } from '../types/Project';
import { modalStyle } from '../components/Project/styles';

interface CreateModalProps {
  open: boolean;
  handleClose: () => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  handleCreate: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({
  open,
  handleClose,
  selectedProject,
  setSelectedProject,
  handleCreate,
}) => {
  // Safe default values
  const safeProject = selectedProject || {
    _id: '',
    name: '',
    description: '',
    owner_email: ''
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      safeProject.name.trim() !== '' &&
      safeProject.description.trim() !== ''
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      handleCreate();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle} component={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Typography variant="h6" mb={3} fontWeight="600">
            Create New Project
          </Typography>
          <TextField
            fullWidth
            label="Project Name "
            value={safeProject.name}
            onChange={(e) =>
              setSelectedProject({ ...safeProject, name: e.target.value })
            }
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 1.5,
              }
            }}

          />
          <TextField
            fullWidth
            label="Description "
            value={safeProject.description}
            onChange={(e) =>
              setSelectedProject({ ...safeProject, description: e.target.value })
            }
            sx={{ mb: 3 }}
            multiline
            rows={3}
            InputProps={{
              sx: {
                borderRadius: 1.5,
              }
            }}

          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
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
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isFormValid()}
              sx={{
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
              Create
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CreateModal;