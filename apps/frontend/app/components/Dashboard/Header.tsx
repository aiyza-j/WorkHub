'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@mui/material/styles';
import { logout } from '../../utils/auth';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../contexts/ThemeContext';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ toggleSidebar, sidebarOpen }: HeaderProps) => {
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { toggleTheme, mode } = useThemeContext();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{
        justifyContent: 'space-between',
        px: { xs: 1, sm: 2, md: 3 },
        height: '64px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <motion.div
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={toggleSidebar}
            >
              <MenuIcon sx={{ color: mode === 'dark' ? 'white' : theme.palette.primary.main }} />
            </IconButton>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                background: mode === 'dark'
                  ? 'linear-gradient(45deg, #8a2be2, #ff69b4)'
                  : 'linear-gradient(45deg, #673ab7, #03a9f4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              WorkHub
            </Typography>
          </motion.div>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
          >
            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
              {mode === 'light' ?
                <DarkModeIcon sx={{ color: theme.palette.primary.main }} /> :
                <LightModeIcon sx={{ color: theme.palette.secondary.main }} />
              }
            </IconButton>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              color="inherit"
              variant="contained"
              size={isMobile ? "small" : "medium"}
              onClick={logout}
              sx={{
                backgroundColor: mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main,
                color:  mode === 'light' ? "#fff" : "#000",
                borderRadius: 6,
                textTransform: 'none',
                fontWeight: 500,
                px: { xs: 2, sm: 3 },
                py: 0.8,
                boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.1)' : '0 4px 8px rgba(255,255,255,0.1)',
                '&:hover': {
                  boxShadow: mode === 'light' ? '0 6px 12px rgba(0,0,0,0.2)' : '0 6px 12px rgba(255,255,255,0.2)',
                }
              }}
            >
              Logout
            </Button>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;