import React from 'react';
import { Box, Grid, Typography, Container, useTheme } from '@mui/material';
import DashboardCard from './DashboardCard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const router = useRouter();
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          marginTop: { xs: 8, sm: 10 },
          marginBottom: 4
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 4,
              color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)',
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              paddingBottom: 1,
              display: 'inline-block'
            }}
          >
            User Dashboard
          </Typography>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%' }}
        >
          <Grid container spacing={3} sx={{ width: "100%" }}>
            <Grid component={motion.div} variants={itemVariants}>
              <DashboardCard
                title="My Projects"
                description="View and manage all your ongoing and completed projects. Track progress, deadlines, and team collaboration."
                buttonText="Go to Projects"
                onClick={() => router.push('/project')}
              />
            </Grid>

            <Grid component={motion.div} variants={itemVariants}>
              <DashboardCard
                title="My Tasks"
                description="View and manage your assigned tasks. Organize by priority, set reminders, and track completion status."
                buttonText="Go to Tasks"
                onClick={() => router.push('/task')}
              />
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </Container>
  );
}