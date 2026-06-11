import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Container,
  Fade,
  Divider,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const PasswordResetConfirm: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { confirmPasswordReset, isLoading, error, clearError } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    clearError && clearError();
  }, []);

  // Fix: Use union type for input or textarea
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'password' | 'confirm'
  ) => {
    clearError && clearError();
    if (field === 'password') {
      setNewPassword(e.target.value);
    } else {
      setConfirmPassword(e.target.value);
    }
    setPasswordError(null);
    
    // Clear success/info messages when user starts typing again
    if (success || infoMessage) {
      setSuccess(null);
      setInfoMessage(null);
    }
  };

  const validatePasswords = (): boolean => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setInfoMessage(null);
    
    if (!validatePasswords()) {
      return;
    }
    
    try {
      await confirmPasswordReset({ uid: uid!, token: token!, new_password: newPassword });
      setSuccess('Password reset successfully.');
      setInfoMessage('You will be redirected to the login page in a few seconds...');
      // The redirect is handled by useAuth with a delay
    } catch (err) {
      console.log("Password reset confirmation failed:", err);
      // Error is handled by useAuth
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        pt: 0,
        px: 0,
        mx: 0,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              width: '100%',
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 16px 42px rgba(31, 41, 51, 0.08)',
            }}
          >
            {!isMobile && (
              <Box
                sx={{
                  flex: '0 0 40%',
                  backgroundColor: theme.palette.mode === 'light' ? '#eef6f1' : 'background.default',
                  color: 'text.primary',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
                  New Password
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  You're almost there! Create a new secure password for your account.
                </Typography>
                
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    "Strong passwords are like strong locks - they protect what's important."
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    — Security Expert
                  </Typography>
                </Box>
              </Box>
            )}
            
            {/* Form side */}
            <Box
              sx={{
                flex: isMobile ? '1' : '0 0 60%',
                p: { xs: 3, sm: 4, md: 5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* Mobile title - only shown on mobile */}
              {isMobile && (
                <Typography variant="h4" component="h1" align="center" fontWeight="bold" gutterBottom color="primary">
                  Reset Password
                </Typography>
              )}
              
              {/* Non-mobile title */}
              {!isMobile && (
                <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 500 }}>
                  Create a new password
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please enter a new secure password for your account. Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols.
              </Typography>

              {error && (
                <Fade in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {passwordError && (
                <Fade in={!!passwordError}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                    }}
                  >
                    {passwordError}
                  </Alert>
                </Fade>
              )}

              {success && (
                <Fade in={!!success}>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}

              {infoMessage && (
                <Fade in={!!infoMessage}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                    }}
                  >
                    {infoMessage}
                  </Alert>
                </Fade>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => handleInputChange(e, 'password')} // Updated type is applied here
                  disabled={isLoading || !!success}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange(e, 'confirm')} // Updated type is applied here
                  disabled={isLoading || !!success}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    }
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isLoading || !!success}
                  size="large"
                  startIcon={!isLoading && <CheckCircleIcon />}
                  sx={{ 
                    mt: 1, 
                    mb: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Set New Password'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Already know your password?
                  </Typography>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body1"
                    sx={{ 
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Back to Sign In
                  </Link>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default PasswordResetConfirm;
