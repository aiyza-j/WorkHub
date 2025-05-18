'use client';

import React from 'react';
import { CircularProgress, Typography, Box, Container } from '@mui/material';

const Loading = () => {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh' }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <CircularProgress size={60} thickness={4.5} color="primary" />
        <Typography variant="h6" color="textSecondary" mt={3}>
          Loading, please wait...
        </Typography>
      </Box>
    </Container>
  );
};

export default Loading;
