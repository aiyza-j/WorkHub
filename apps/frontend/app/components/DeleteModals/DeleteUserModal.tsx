import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  useTheme,
  Fade,
  Backdrop
} from '@mui/material';
import { motion } from 'framer-motion';
import { User } from '../../types/User';

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  onDelete: () => Promise<void>;
}

const DeleteUserModal = ({
  open,
  onClose,
  selectedUser,
  onDelete
}: DeleteUserModalProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-user-dialog-title"
      aria-describedby="delete-user-dialog-description"
      TransitionComponent={Fade}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          p: 1,
          boxShadow: 24,
        }
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box
        component={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <DialogTitle id="delete-user-dialog-title" sx={{ fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-user-dialog-description">
            Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong> with email <strong>{selectedUser?.email}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
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
            onClick={onDelete}
            color="error"
            variant="contained"
            autoFocus
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
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DeleteUserModal;