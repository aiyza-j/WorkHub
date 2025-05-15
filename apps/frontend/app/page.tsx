'use client'

import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';


const features = [
  {
    title: 'User Management',
    description: 'Easily add, update, and organize your team members.',
    icon: <PeopleIcon fontSize="large" color="primary" />,
  },
  {
    title: 'Project Tracking',
    description: 'Manage project timelines and team responsibilities.',
    icon: <AssignmentIcon fontSize="large" color="primary" />,
  },
  {
    title: 'Task Collaboration',
    description: 'Assign tasks and track progress across your team.',
    icon: <ListAltIcon fontSize="large" color="primary" />,
  },
];

const LandingPage = () => {
  const router = useRouter();
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>

      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="secondary">
          Welcome to WorkHub
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Manage users, projects, and tasks — all in one place.
        </Typography>
        <Box textAlign="center" mt={5}>
        <Typography variant="h5" gutterBottom>
          Ready to streamline your workflow?
        </Typography>
        <Button variant="contained" color="secondary" size="large" onClick={() => router.push('/signup')}>
          Sign Up for Free
        </Button>
      </Box>
      </Box>

      <Grid container spacing={4} sx={{ flexWrap: 'nowrap'}}>
        {features.map((feature, index) => (
          <section key={index}>
            <Grid container spacing={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', background: '#3c096c',color: '#ffffff'}}>
                <Box mb={2}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="primary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          </section>
        ))}
      </Grid>



    </Container>
  );
};

export default LandingPage;
