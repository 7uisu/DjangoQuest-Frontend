// src/pages/Register.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLocalLoading(true);

    try {
      await register({ email, username, password, password2 });
      setSuccess(true);
      setEmail('');
      setUsername('');
      setPassword('');
      setPassword2('');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        const responseErrors = err.response.data;
        const fieldErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(responseErrors)) {
          if (Array.isArray(value)) {
            fieldErrors[key] = value[0] as string;
          } else if (typeof value === 'string') {
            fieldErrors[key] = value;
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setGeneralError('Registration failed. Please try again.');
        }
      } else {
        setGeneralError('Registration failed. Please try again.');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', // Full viewport height (section3)
        width: '100vw', // Full viewport width, explicitly using vw to avoid parent constraints
        bgcolor: 'rgba(0, 0, 0, 0.7)', // Match navbar's black transparent background
        backdropFilter: 'blur(5px)', // Match navbar's blur effect
        display: 'flex',
        justifyContent: 'center', // Center horizontally (section3)
        alignItems: 'center', // Center vertically (section3)
        position: 'relative', // Ensure it’s not affected by parent positioning
        pt: 8, // Space for navbar (AppBar height)
        px: 0, // Remove any horizontal padding that might offset centering
        mx: 0, // Remove any horizontal margin
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: '400px', // Match screenshot’s form width
          mx: 'auto', // Center horizontally
          p: { xs: 2, sm: 3 }, // Responsive padding
          borderRadius: 2,
          backgroundColor: '#f5f5f5', // Light gray background like screenshot
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', // Match navbar shadow
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Sign Up
        </Typography>

        {generalError && <Alert severity="error" sx={{ mb: 2 }}>{generalError}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! You can now{' '}
            <Link component={RouterLink} to="/login">
              sign in
            </Link>
            .
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email || ''}
            disabled={localLoading || isLoading}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!errors.username}
            helperText={errors.username || ''}
            disabled={localLoading || isLoading}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password || ''}
            disabled={localLoading || isLoading}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type="password"
            id="password2"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            error={!!errors.password2}
            helperText={errors.password2 || ''}
            disabled={localLoading || isLoading}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1,
              bgcolor: '#7FD8D4', // Cyan color like navbar’s Feedback button
              '&:hover': { bgcolor: '#5ac8a5' }, // Darker on hover
            }}
            disabled={localLoading || isLoading}
          >
            {(localLoading || isLoading) ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'SIGN UP'
            )}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              {"Already have an account? Sign In"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;