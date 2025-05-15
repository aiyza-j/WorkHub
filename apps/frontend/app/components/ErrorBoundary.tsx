'use client';

import React, { Component, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Caught by ErrorBoundary:', error, errorInfo);
  }

  handleClose = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    const { hasError, errorMessage } = this.state;

    return (
      <>
        {this.props.children}
        <Snackbar
          open={hasError}
          autoHideDuration={5000}
          onClose={this.handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={this.handleClose} severity="error" sx={{ width: '100%' }}>
            {errorMessage || 'Something went wrong.'}
          </Alert>
        </Snackbar>
      </>
    );
  }
}

export default ErrorBoundary;
