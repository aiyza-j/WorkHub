'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import ThemeRegistry from '../theme/ThemeRegistry';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <ThemeRegistry mode={mode}>
      <Box sx={{ display: 'flex' }}>
        <Sidebar open={sidebarOpen} />
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
