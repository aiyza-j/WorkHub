'use client'

import React, { useState } from 'react';
import { Container, Typography, Button, Box, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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
      damping: 10
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)"
  },
  tap: {
    scale: 0.95
  }
};

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
          <motion.div variants={itemVariants}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              gutterBottom
              color="primary"
              sx={{
                fontWeight: 800,
                background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2
              }}
            >
              Welcome to WorkHub
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              sx={{
                maxWidth: "700px",
                mx: "auto",
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Manage users, projects, and tasks — all in one place.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box textAlign="center" mt={{ xs: 4, md: 6 }}>
              <Typography variant="h5" gutterBottom color="text.primary" sx={{ fontWeight: 600 }}>
                Ready to streamline your workflow?
              </Typography>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => router.push('/signup')}
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: '30px',
                  }}
                >
                  Sign Up for Free
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Box>

        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          justifyContent="center"
          sx={{ mt: { xs: 2, md: 5 } }}
        >
          {features.map((feature, index) => (
            <Grid  key={index}>
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    borderRadius: '16px',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(145deg, #2a0550, #3c096c)`
                      : 'white',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    mb={2}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(60, 9, 108, 0.05)',
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      mb: 3
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}>
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default LandingPage;