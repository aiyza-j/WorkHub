import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import DashboardCard from './DashboardCard';

export default function UserDashboard() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>

      {/* User Projects */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid>
          <DashboardCard
            title="My Projects"
            description="View all your projects."
            buttonText="Go to Projects"
            onClick={() => console.log('Go to My Projects')}
          />
        </Grid>

        {/* My Tasks */}
        <Grid >
          <DashboardCard
            title="My Tasks"
            description="View and manage your tasks."
            buttonText="Go to Tasks"
            onClick={() => console.log('Go to My Tasks')}
          />
        </Grid>

        {/* Notifications */}
        <Grid >
          <DashboardCard
            title="Notifications"
            description="Check important notifications."
            buttonText="View Notifications"
            onClick={() => console.log('Go to Notifications')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
