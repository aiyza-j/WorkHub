import React from 'react';
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import DashboardCard from './DashboardCard';

export default function AdminDashboard() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* User Management */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid >
          <DashboardCard
            title="Manage Users"
            description="View and manage all users."
            buttonText="Go to Users"
            onClick={() => console.log('Go to Users')}
          />
        </Grid>

        {/* Manage Projects */}
        <Grid >
          <DashboardCard
            title="Manage Projects"
            description="View and manage all projects."
            buttonText="Go to Projects"
            onClick={() => console.log('Go to Projects')}
          />
        </Grid>

        {/* Task Management */}
        <Grid >
          <DashboardCard
            title="Manage Tasks"
            description="Assign and track tasks."
            buttonText="Go to Tasks"
            onClick={() => console.log('Go to Tasks')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
