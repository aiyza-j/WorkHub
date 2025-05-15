'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@mui/material/styles';
import {logout} from '../../utils/auth'

interface HeaderProps {
  toggleTheme: () => void;
  mode: 'light' | 'dark';
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ toggleTheme, mode, toggleSidebar, sidebarOpen }: HeaderProps) => {
  const theme = useTheme();

  return (
    <AppBar position="fixed" elevation={1} sx={{
    borderBottom: `1px solid #b6a9c2`,backgroundColor: mode === 'dark' ? '#000' : theme.palette.primary.main}}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center'}}>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }} onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            color={theme.palette.mode === 'dark' ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText}
            noWrap
          >
            WorkHub
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Button
            color="inherit"
            variant="contained"
            size="small"
            onClick={logout}
            sx={{
              backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main,
              color: theme.palette.mode === 'light' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
              border: '1px solid #3c096c', borderRadius: '5px'
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
