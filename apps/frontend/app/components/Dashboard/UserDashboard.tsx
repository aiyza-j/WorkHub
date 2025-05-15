import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import DashboardCard from './DashboardCard';
import {useRouter} from 'next/navigation'


export default function UserDashboard() {
  const router = useRouter()
  return (
    <Box sx={{ padding: 2, marginTop: 10 }}>
      <Typography variant="h3" gutterBottom>
        User Dashboard
      </Typography>


      <Grid container spacing={2} sx={{ marginTop: 2, width: "100%"}}>
        <Grid>
          <DashboardCard
            title="My Projects"
            description="View all your projects."
            buttonText="Go to Projects"
            onClick={() => router.push('/project')}
          />
        </Grid>


        <Grid >
          <DashboardCard
            title="My Tasks"
            description="View and manage your tasks."
            buttonText="Go to Tasks"
            onClick={() => router.push('/task')}
          />
        </Grid>

      </Grid>
    </Box>
  );
}
