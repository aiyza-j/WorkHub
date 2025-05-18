'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Link,
  IconButton,
  InputAdornment,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';
import { useErrorSnackbar } from '../hooks/useErrorSnackbar';
import { motion } from 'framer-motion';

// Animation variants
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4
    }
  })
};

const buttonVariants = {
  hover: {
    scale: 1.03,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)"
  },
  tap: {
    scale: 0.97
  }
};

const LoginPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showError, SnackbarComponent } = useErrorSnackbar();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const validateEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await res.json();

      localStorage.setItem('token', data.token);

      if (!res.ok) {
        if (data.message?.includes('Invalid credentials')) {
          setEmailError('Invalid credentials.');
        } else {
          showError(data.message || 'Invalid credentials');
        }
      }  else {
        const DashboardComponent = (await import('../../app/dashboard/DashboardRedirect')).default;
        router.push('/dashboard');
    }
    } catch (error: any) {
      console.error('Sign-up error:', error);
      showError(error.message || 'Something went wrong.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : '#f7f9fc',
        py: { xs: 4, md: 8 },
        px: 2,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(145deg, #121212, #1a1a1a)`
          : `linear-gradient(145deg, #f7f9fc, #ffffff)`,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <Paper
            elevation={theme.palette.mode === 'dark' ? 4 : 2}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                : '0 8px 32px rgba(31, 38, 135, 0.1)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant={isMobile ? "h4" : "h3"}
                gutterBottom
                textAlign="center"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Log In
              </Typography>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 2px 10px rgba(60, 9, 108, 0.1)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 2px rgba(60, 9, 108, 0.2)'
                      }
                    }
                  }}
                />
              </motion.div>

              <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 2px 10px rgba(60, 9, 108, 0.1)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 2px rgba(60, 9, 108, 0.2)'
                      }
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div
                custom={2}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <Button
                  component={motion.button}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  Log In
                </Button>
              </motion.div>

              <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                <Typography textAlign="center" mt={2}>
                  Don't have an account?{' '}
                  <Link
                    onClick={() => router.push('/signup')}
                    sx={{
                      cursor: 'pointer',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: theme.palette.primary.light,
                        textDecoration: 'none'
                      }
                    }}
                    underline="hover"
                  >
                    Sign up
                  </Link>
                </Typography>
              </motion.div>
            </form>
          </Paper>
          {SnackbarComponent}
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;