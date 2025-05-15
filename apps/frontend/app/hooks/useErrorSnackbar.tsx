import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const useErrorSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showError = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const SnackbarComponent = (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={() => setOpen(false)} severity="error" sx={{ width: '100%' }}>
        {message || 'Something went wrong.'}
      </Alert>
    </Snackbar>
  );

  return { showError, SnackbarComponent };
};
