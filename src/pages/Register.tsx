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
  ToggleButtonGroup,
  ToggleButton,
  Grid,
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
  School as SchoolIcon,
  VpnKey as KeyIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

const Register: React.FC = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [educatorCode, setEducatorCode] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!firstName) {
      newErrors.first_name = 'First name is required';
    }

    if (!lastName) {
      newErrors.last_name = 'Last name is required';
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
      await register({
        email,
        username,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        role,
        educator_code: role === 'teacher' ? educatorCode : undefined,
      });
      setSuccess(true);
      setEmail('');
      setUsername('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setPassword2('');
      setEducatorCode('');
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

  const sharedInputSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.02)',
    },
  };

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        backgroundColor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        pt: { xs: 12, md: 14 },
        pb: { xs: 8, md: 10 },
        px: 2,
        overflow: 'auto',
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

                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Create Account
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Join our community and start your learning journey today.
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    "The only way to do great work is to love what you do."
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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

              {!isMobile && (
                <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 500 }}>
                  Create your account
                </Typography>
              )}

              {/* Role toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ToggleButtonGroup
                  value={role}
                  exclusive
                  onChange={(_, val) => { if (val) setRole(val); }}
                  sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 3, fontWeight: 600 } }}
                >
                  <ToggleButton value="student">
                    <PersonIcon sx={{ mr: 1 }} /> Student
                  </ToggleButton>
                  <ToggleButton value="teacher">
                    <SchoolIcon sx={{ mr: 1 }} /> Teacher
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {generalError && (
                <Fade in={!!generalError}>
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
                  sx={sharedInputSx}
                />

                {/* First name + Last name side by side */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={localLoading || isLoading}
                      variant="outlined"
                      placeholder="Juan"
                      required
                      error={!!errors.first_name}
                      helperText={errors.first_name || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={sharedInputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={localLoading || isLoading}
                      variant="outlined"
                      placeholder="Dela Cruz"
                      required
                      error={!!errors.last_name}
                      helperText={errors.last_name || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={sharedInputSx}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Username (In-Game Username)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={localLoading || isLoading}
                  margin="normal"
                  variant="outlined"
                  placeholder="Choose a username"
                  required
                  error={!!errors.username}
                  helperText={errors.username || 'This will be your username inside the DjangoQuest game.'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={sharedInputSx}
                />

                {/* Educator Access Code (teachers only) */}
                {role === 'teacher' && (
                  <TextField
                    fullWidth
                    label="Educator Access Code"
                    value={educatorCode}
                    onChange={(e) => setEducatorCode(e.target.value)}
                    disabled={localLoading || isLoading}
                    margin="normal"
                    variant="outlined"
                    placeholder="e.g. CODE-1234"
                    required
                    error={!!errors.educator_code}
                    helperText={errors.educator_code || 'Required for teacher registration.'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={sharedInputSx}
                  />
                )}

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
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={sharedInputSx}
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
                          onClick={() => setShowPassword2(!showPassword2)}
                          edge="end"
                          size="small"
                          aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                        >
                          {showPassword2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ...sharedInputSx, mb: 1 }}
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
