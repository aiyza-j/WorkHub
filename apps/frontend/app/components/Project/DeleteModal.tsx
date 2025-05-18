import React from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Project } from '../../types/Project';
import { modalStyle } from '../Project/styles';

interface DeleteModalProps {
  open: boolean;
  handleClose: () => void;
  selectedProject: Project | null;
  handleDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  handleClose,
  selectedProject,
  handleDelete,
}) => {
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
          <Typography variant="h6" mb={2} fontWeight="600">
            Confirm Delete
          </Typography>
          <Typography mb={3}>
            Are you sure you want to delete project <strong>{selectedProject?.name}</strong>?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
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
              Delete
            </Button>
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
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeleteModal;