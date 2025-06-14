'use client';

import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery, CssBaseline } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/app/hooks/useSession';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../components/Dashboard/Header'), {
  ssr: false,
  loading: () => <div style={{ height: '64px' }}></div>,
});
const Sidebar = dynamic(() => import('../components/Dashboard/Sidebar'), {
  ssr: false,
  loading: () => <div style={{ height: '64px' }}></div>,
});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { session } = useSession();


  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);



  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get user role from localStorage or default to 'user'
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') as 'admin' | 'user';
    console.log(role)
    if (userRole) {
      setRole(userRole);
    }
  }, [role]);

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

        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar open={sidebarOpen} role={session?.role as 'admin' | 'user'} />

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