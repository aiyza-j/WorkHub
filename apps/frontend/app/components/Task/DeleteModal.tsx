import React from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  Fade,
  Backdrop,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Task } from '../../types/Task';
import { modalStyle } from './styles';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onDelete: () => void;
  theme: any;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onClose,
  task,
  onDelete,
  theme,
}) => {
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
              onClick={onClose}
              sx={{
                color: theme.palette.grey[500],
                '&:hover': { color: theme.palette.grey[700] }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Typography>
          <Typography mb={4} sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete task <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{task?.title}</Box>?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Box component={motion.div} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Cancel
              </Button>
            </Box>
            <Box component={motion.div} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                color="error"
                onClick={onDelete}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  boxShadow: 1
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeleteModal;