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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Email as EmailIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';

const PasswordReset: React.FC = () => {
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    clearError && clearError();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError && clearError();
    setEmail(e.target.value);
    // Clear success/info messages when user starts typing again
    if (success || infoMessage) {
      setSuccess(null);
      setInfoMessage(null);
    }
  };

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
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.dark} 100%)`,
        backgroundSize: 'cover',
        backdropFilter: 'blur(8px)',
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
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 10px, transparent 10px, transparent 20px)',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              width: '100%',
              overflow: 'hidden',
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Decorative side panel - hidden on mobile */}
            {!isMobile && (
              <Box
                sx={{
                  flex: '0 0 40%',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                
                <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2, position: 'relative' }}>
                  Reset Password
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, position: 'relative' }}>
                  Don't worry, it happens to the best of us. We'll help you get back into your account.
                </Typography>
                
                <Box sx={{ mt: 'auto', position: 'relative' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    "Security is not a product, but a process."
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    — Bruce Schneier
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
                  Forgot your password?
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your email address below and we'll send you instructions to reset your password.
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
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  disabled={isLoading || !!success}
                  margin="normal"
                  variant="outlined"
                  placeholder="your.email@example.com"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
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
                  startIcon={!isLoading && <LockResetIcon />}
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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Remember your password?
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

export default PasswordReset;