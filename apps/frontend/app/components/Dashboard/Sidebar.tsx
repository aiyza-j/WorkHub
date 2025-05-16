'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession } from '@/app/hooks/useSession';

interface SidebarProps {
  open: boolean;
  role: 'admin' | 'user';
}

const Sidebar: React.FC<SidebarProps> = ({ open, role }) => {
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const pathname = usePathname();

  const navItems =
    role === 'admin'
      ? [
          { label: 'Users', icon: <PersonIcon />, path: '/dashboard/admin' },
        ]
      : [
          { label: 'Projects', icon: <WorkIcon />, path: '/project' },
          { label: 'Tasks', icon: <AssignmentIcon />, path: '/task' },
        ];

  const sidebarWidth = open ? { xs: 220, sm: 240 } : { xs: 65, sm: 70 };

  const sidebarVariants = {
    open: { width: isMobile ? 220 : 240, transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: isMobile ? 65 : 70, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const textVariants = {
    open: { opacity: 1, x: 0, display: "block", transition: { delay: 0.1 } },
    closed: { opacity: 0, x: -10, transitionEnd: { display: "none" } }
  };

  return (
    <motion.div
      initial={open ? "open" : "closed"}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.palette.mode === 'dark' ? '4px 0 15px rgba(0,0,0,0.3)' : '4px 0 15px rgba(0,0,0,0.1)',
        overflowX: 'hidden'
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }} />
      <Divider sx={{ opacity: 0.5 }} />

      {open && (
        <Box sx={{ py: 2, px: 3 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: 1,
                fontWeight: 500
              }}
            >
              Navigation
            </Typography>
          </motion.div>
        </Box>
      )}

      <List sx={{ p: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ width: '100%' }}
              >
                <ListItemButton
                  component={Link}
                  href={item.path}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.05)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.03)',
                    },
                    py: 1.2
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
                        ? theme.palette.mode === 'dark'
                          ? theme.palette.primary.light
                          : theme.palette.primary.main
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(0,0,0,0.6)',
                      minWidth: { xs: 40, sm: 45 }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={textVariants}
                      >
                        <ListItemText
                          primary={item.label}
                          sx={{
                            '& .MuiTypography-root': {
                              fontWeight: isActive ? 600 : 400,
                              color: isActive
                                ? theme.palette.mode === 'dark'
                                  ? theme.palette.primary.light
                                  : theme.palette.primary.main
                                : theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.9)'
                                  : 'rgba(0,0,0,0.8)',
                            }
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ListItemButton>
              </motion.div>
            </ListItem>
          );
        })}
      </List>
    </motion.div>
  );
};

export default Sidebar;