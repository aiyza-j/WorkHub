'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  IconButton,
  InputAdornment,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useErrorSnackbar } from '../hooks/useErrorSnackbar';
import { motion } from 'framer-motion';

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

const SignUpPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showError, SnackbarComponent } = useErrorSnackbar();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const validatePasswordMatch = () => {
    return password === confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!validatePasswordMatch()) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role: "user"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes('Email already')) {
          setEmailError('Email already registered.');
        } else {
          showError(data.message || 'Signup Failed');
        }
      } else {
        router.push('/login');
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
                Sign Up
              </Typography>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  value={fullName}
                  onChange={handleFullNameChange}
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

              <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
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
                        <IconButton onClick={handleClickShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                <TextField
                  fullWidth
                  margin="normal"
                  label="Re-enter Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!passwordError}
                  helperText={passwordError || ' '}
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
                        <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div
                custom={4}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  component={motion.button}
                  variants={buttonVariants}
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
                  Create Account
                </Button>
              </motion.div>

              <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible">
                <Typography textAlign="center" mt={2}>
                  Already have an account?{' '}
                  <Link
                    onClick={() => router.push('/login')}
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
                    Log in
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

export default SignUpPage;