import React from 'react';
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import DashboardCard from './DashboardCard';

export default function AdminDashboard() {
  return (
    <Box sx={{ padding: 2, marginTop: 10 }}>
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>


      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid >
          <DashboardCard
            title="Manage Users"
            description="View and manage all users."
            buttonText="Go to Users"
            onClick={() => console.log('Go to Users')}
          />
        </Grid>

      </Grid>
    </Box>
  );
}
