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
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Container,
  Fade,
  Divider,
} from '@mui/material';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowPassword2 = () => {
    setShowPassword2(!showPassword2);
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
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff, #fff 10px, transparent 10px, transparent 20px)',
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

                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight="bold"
                  sx={{ mb: 2, position: 'relative' }}
                >
                  Create Account
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ mb: 4, opacity: 0.9, position: 'relative' }}
                >
                  Join our community and start your learning journey today.
                </Typography>

                <Box sx={{ mt: 'auto', position: 'relative' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    "The only way to do great work is to love what you do."
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    — Steve Jobs
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
                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                >
                  Sign Up
                </Typography>
              )}

              {/* Non-mobile title */}
              {!isMobile && (
                <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 500 }}>
                  Create your account
                </Typography>
              )}

              {generalError && (
                <Fade in={!!generalError}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {generalError}
                  </Alert>
                </Fade>
              )}

              {success && (
                <Fade in={success}>
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    Registration successful! You can now{' '}
                    <Link component={RouterLink} to="/login">
                      sign in
                    </Link>
                    .
                  </Alert>
                </Fade>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={localLoading || isLoading}
                  margin="normal"
                  variant="outlined"
                  placeholder="your.email@example.com"
                  required
                  error={!!errors.email}
                  helperText={errors.email || ''}
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
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={localLoading || isLoading}
                  margin="normal"
                  variant="outlined"
                  placeholder="Choose a username"
                  required
                  error={!!errors.username}
                  helperText={errors.username || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={localLoading || isLoading}
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!errors.password}
                  helperText={errors.password || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowPassword}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword2 ? 'text' : 'password'}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  disabled={localLoading || isLoading}
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!errors.password2}
                  helperText={errors.password2 || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowPassword2}
                          edge="end"
                          size="small"
                          aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                        >
                          {showPassword2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={localLoading || isLoading}
                  size="large"
                  startIcon={!(localLoading || isLoading) && <LoginIcon />}
                  sx={{
                    mt: 2,
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  {(localLoading || isLoading) ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign Up'
                  )}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Already have an account?
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
                      },
                    }}
                  >
                    Sign In
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

export default Register;
