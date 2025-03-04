// src/pages/PasswordResetConfirm.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const PasswordResetConfirm: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { confirmPasswordReset, isLoading, error } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setInfoMessage(null);
    try {
      await confirmPasswordReset({ uid: uid!, token: token!, new_password: newPassword });
      setSuccess('Password reset successfully.');
      setInfoMessage('You will be redirected to the login page in a few seconds...');
      // The redirect is handled by useAuth with a 5-second delay
    } catch (err) {
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
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading || !!success} // Disable after success
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading || !!success} // Disable after success
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordResetConfirm;