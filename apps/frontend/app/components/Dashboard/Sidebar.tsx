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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Users', icon: <PersonIcon />, path: '/users' },
];

const Sidebar: React.FC<{ open: boolean }> = ({ open }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: open ? 220 : 60,
        height: '100%',
        transition: 'width 0.3s',
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid #b6a9c2`,

      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.path}>
              <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText }}>
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: theme.palette.mode === 'light' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
