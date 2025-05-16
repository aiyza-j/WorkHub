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
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';

interface SidebarProps {
  open: boolean;
  role: 'admin' | 'user';
}

const Sidebar: React.FC<SidebarProps> = ({ open, role }) => {
  const theme = useTheme();

  const navItems =
    role === 'admin'
      ? [
          { label: 'Users', icon: <PersonIcon />, path: '/dashboard/admin' },
        ]
      : [
          { label: 'Projects', icon: <WorkIcon />, path: '/project' },
          { label: 'Tasks', icon: <AssignmentIcon />, path: '/task' },
        ];

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
              <ListItemIcon
                sx={{
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.secondary.contrastText
                      : theme.palette.primary.contrastText,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    color:
                      theme.palette.mode === 'light'
                        ? theme.palette.secondary.contrastText
                        : theme.palette.primary.contrastText,
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
