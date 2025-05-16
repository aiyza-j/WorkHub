'use client';

import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery, CssBaseline } from '@mui/material';
import Header from '../components/Dashboard/Header';
import Sidebar from '../components/Dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Set sidebar collapsed state on mobile devices
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get user role from localStorage or default to 'user'
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') as 'admin' | 'user';
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(10,10,10,0.95)' : 'rgba(250,250,252,0.95)',
      }}
    >
      <CssBaseline />
      <Header
        toggleTheme={toggleTheme}
        mode={mode}
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar open={sidebarOpen} role={role} />

      <Box
        component={motion.div}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          flexGrow: 1,
          padding: { xs: 1, sm: 2, md: 3 },
          marginTop: '64px', // Height of the header
          marginLeft: sidebarOpen
            ? { xs: '65px', sm: '240px' }
            : { xs: '65px', sm: '70px' },
          transition: 'margin-left 0.3s ease',
          width: '100%',
          overflow: 'auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default DashboardLayout;