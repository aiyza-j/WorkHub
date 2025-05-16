'use client';

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import ThemeRegistry from '../theme/ThemeRegistry';
import { useSession } from '../hooks/useSession'; 

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeRegistry mode={mode}>
      <Box sx={{ display: 'flex' }}>
        <Sidebar open={sidebarOpen} role={session?.role === 'admin' ? 'admin' : 'user'} />
        <Box component="main" sx={{ flexGrow: 1, ml: sidebarOpen ? '240px' : '60px', transition: 'margin-left 0.3s' }}>
          <Header
            toggleTheme={toggleTheme}
            mode={mode}
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
          <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
      </Box>
    </ThemeRegistry>
  );
};

export default DashboardLayout;
