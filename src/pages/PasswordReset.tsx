// src/pages/PasswordReset.tsx
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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PasswordReset: React.FC = () => {
  const { requestPasswordReset, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setInfoMessage(null);
    try {
      await requestPasswordReset({ email });
      setSuccess('Password reset email sent successfully.');
      setInfoMessage('Please check your inbox (and spam/junk folder) for the reset email. It may take a few minutes to arrive.');
    } catch (err) {
      console.log("Password reset request failed:", err);
      // Error is handled by useAuth
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        pt: 8,
        px: 0,
        mx: 0,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: '600px',
          mx: 'auto',
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Reset Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {infoMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {infoMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || !!success}
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading || !!success}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordReset;