'use client'

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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useErrorSnackbar } from '../hooks/useErrorSnackbar';

const SignUpPage = () => {
  const router = useRouter();

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
        backgroundColor: '#f7f7f7',
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h4" gutterBottom textAlign="center" color="primary">
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            value={fullName}
            onChange={handleFullNameChange}
            variant="outlined"
          />

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
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowConfirmPassword}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, py: 1.5 }}
          >
            Create Account
          </Button>

          <Typography textAlign="center" mt={2}>
            Already have an account?{' '}
            <Link
              onClick={() => router.push('/login')}
              sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 500 }}
              underline="hover"
            >
              Log in
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default SignUpPage;
