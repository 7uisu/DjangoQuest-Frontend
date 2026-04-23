import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Grid,
  Button,
  useTheme,
  alpha,
  styled,
  Chip,
  LinearProgress,
  Container,
  Fade,
  Grow,
  TextField,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  EmojiEvents as AchievementIcon,
  Timeline as TimelineIcon,
  VerifiedUser as VerifiedIcon,
  GppBad as UnverifiedIcon,
  Edit as EditIcon,
  ArrowUpward as LevelUpIcon, // Simplified to one ArrowUpward import
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../api/user';
import { tutorialApi } from '../api/axios';
import { unenrollClassroom, enrollClassroom } from '../api/game';

// Styled components (unchanged)
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
  border: `4px solid ${theme.palette.background.paper}`,
  margin: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const Dashboard: React.FC = () => {
  const { user, isLoading, setUser } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isAchievementsLoading, setIsAchievementsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.profile?.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  const [enrollCode, setEnrollCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const theme = useTheme();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.profile.bio,
      });
      const avatar = user.profile.avatar;
      let avatarPath: string | null = avatar || null;
      if (avatarPath) {
        const parts = avatarPath.split('/');
        const filename = parts[parts.length - 1];
        avatarPath = `/avatars/${filename}`;
      }
      setAvatarPreview(avatarPath ? `${BASE_URL}${avatarPath}` : null);

      setIsAchievementsLoading(true);
      const fetchAchievements = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockAchievements = user.achievements || [
            { id: 1, user: user.id, achievement: { id: 1, name: "First Login", description: "Logged in for the first time", xp_reward: 10, icon: null, created_at: new Date().toISOString() }, date_unlocked: new Date().toISOString() },
            { id: 2, user: user.id, achievement: { id: 2, name: "Profile Completed", description: "Filled out all profile info", xp_reward: 25, icon: null, created_at: new Date().toISOString() }, date_unlocked: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, user: user.id, achievement: { id: 3, name: "Week Streak", description: "Logged in for 7 days", xp_reward: 50, icon: null, created_at: new Date().toISOString() }, date_unlocked: new Date(Date.now() - 172800000).toISOString() },
          ];
          setAchievements(mockAchievements);
        } catch (error) {
          console.error("Failed to fetch achievements:", error);
        } finally {
          setIsAchievementsLoading(false);
        }
      };
      fetchAchievements();
    }
  }, [user, BASE_URL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        profile: { bio: formData.bio, avatar: avatarFile },
      };
      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);
      const avatar = updatedUser.profile.avatar;
      let avatarPath: string | null = avatar || null;
      if (avatarPath) {
        const parts = avatarPath.split('/');
        const filename = parts[parts.length - 1];
        avatarPath = `/avatars/${filename}`;
      }
      setAvatarPreview(avatarPath ? `${BASE_URL}${avatarPath}` : null);
      setEditMode(false);
      setAvatarFile(null);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.profile.bio,
      });
      const avatar = user.profile.avatar;
      let avatarPath: string | null = avatar || null;
      if (avatarPath) {
        const parts = avatarPath.split('/');
        const filename = parts[parts.length - 1];
        avatarPath = `/avatars/${filename}`;
      }
      setAvatarPreview(avatarPath ? `${BASE_URL}${avatarPath}` : null);
    }
    setAvatarFile(null);
    setEditMode(false);
  };

  const handleResetProgress = async () => {
    // Null check for user
    if (!user) {
      setResetError('No user authenticated.');
      return;
    }

    setResetting(true);
    setResetError('');
    try {
      await tutorialApi.post('/user/reset-progress/');
      // Type assertion to bypass strict type checking
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          total_xp: 0,
        },
      } as const; // 'as const' ensures TypeScript treats it as a literal type
      setUser(updatedUser);
      setResetDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to reset progress:', err);
      setResetError(err.response?.data?.detail || 'Failed to reset progress. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const handleUnenroll = async () => {
    if (!user) return;
    setUnenrolling(true);
    try {
      await unenrollClassroom();
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          classroom_name: null,
          teacher_name: null,
        },
      } as const;
      setUser(updatedUser);
      setUnenrollDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to unenroll:', err);
    } finally {
      setUnenrolling(false);
    }
  };

  const handleEnroll = async () => {
    if (!user || !enrollCode.trim()) return;
    setEnrolling(true);
    setEnrollError('');
    try {
      const result = await enrollClassroom(enrollCode.trim());
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          classroom_name: result.classroom_name,
          teacher_name: result.teacher,
        },
      } as const;
      setUser(updatedUser);
      setEnrollCode('');
    } catch (err: any) {
      console.error('Failed to enroll:', err);
      setEnrollError(err.response?.data?.detail || 'Failed to enroll in classroom. Please check your code.');
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)` }}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100%', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Typography variant="h3" sx={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Not Authenticated</Typography>
        <Button variant="contained" size="large" sx={{ borderRadius: 8, padding: '12px 32px', background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', '&:hover': { background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`, transform: 'translateY(-2px)' } }}>Log In</Button>
      </Box>
    );
  }

  const currentXP = user.profile.total_xp;
  const xpPerLevel = 100;
  const currentLevel = Math.floor(currentXP / xpPerLevel);
  const nextLevelXP = (currentLevel + 1) * xpPerLevel;
  const xpProgress = ((currentXP % xpPerLevel) / xpPerLevel) * 100;

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, backgroundAttachment: 'fixed', backgroundSize: 'cover', display: 'flex', justifyContent: 'center', pt: 10, pb: 6 }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 5 }}>
            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Welcome back, {user.username}!</Typography>
            <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.8), textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Check out your latest achievements and track your progress.</Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={800}>
              <GradientPaper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <ProfileAvatar src={avatarPreview || undefined}>
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </ProfileAvatar>
                  {!editMode && (
                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                      <Button startIcon={<EditIcon />} variant="outlined" size="small" onClick={() => setEditMode(true)} sx={{ borderRadius: 8, color: '#ffffff', borderColor: alpha(theme.palette.common.white, 0.5), '&:hover': { borderColor: '#ffffff' } }}>Edit Profile</Button>
                    </Box>
                  )}
                  {editMode && (
                    <Box sx={{ position: 'absolute', top: theme.spacing(2), right: theme.spacing(2) }}>
                      <input accept="image/*" style={{ display: 'none' }} id="avatar-upload" type="file" onChange={handleAvatarChange} />
                      <label htmlFor="avatar-upload">
                        <IconButton color="primary" component="span" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.8), '&:hover': { bgcolor: theme.palette.primary.main } }}>
                          <PhotoCameraIcon sx={{ color: '#fff' }} />
                        </IconButton>
                      </label>
                    </Box>
                  )}
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: '#ffffff' }}>{formData.first_name} {formData.last_name}</Typography>
                  <Typography variant="subtitle1" sx={{ color: alpha(theme.palette.common.white, 0.8), mb: 1 }}>@{user.username}</Typography>
                  <Chip icon={user.is_verified ? <VerifiedIcon /> : <UnverifiedIcon />} label={user.is_verified ? "Verified" : "Unverified"} color={user.is_verified ? "success" : "warning"} sx={{ mb: 3 }} />
                </Box>
                <Divider sx={{ my: 3 }}><Chip label="User Info" sx={{ color: '#ffffff' }} /></Divider>
                <Box sx={{ mt: 2 }}>
                  {!editMode ? (
                    <>
                      <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}><span style={{ fontWeight: 'bold' }}>Email:</span><span>{user.email}</span></Typography>
                      <Typography variant="body1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}><span style={{ fontWeight: 'bold' }}>Member since:</span><span>{new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></Typography>
                      <Typography variant="body1" gutterBottom sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}><span style={{ fontWeight: 'bold' }}>Level:</span><span>Level {currentLevel}</span></Typography>

                      {user.profile.classroom_name ? (
                        <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.primary.light }}>Enrolled Classroom</Typography>
                          <Typography variant="h6" sx={{ color: '#ffffff', mt: 0.5 }}>{user.profile.classroom_name}</Typography>
                          <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1.5 }}>Teacher: {user.profile.teacher_name}</Typography>
                          <Button size="small" variant="outlined" color="error" onClick={() => setUnenrollDialogOpen(true)} sx={{ borderRadius: 4, textTransform: 'none' }}>Unenroll</Button>
                        </Box>
                      ) : (
                        <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.light }}>Join a Classroom</Typography>
                          <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1.5, mt: 0.5 }}>Enter your teacher's code to enroll.</Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              size="small"
                              placeholder="Enrollment Code"
                              value={enrollCode}
                              onChange={(e) => setEnrollCode(e.target.value)}
                              sx={{ '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' } }}
                            />
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={handleEnroll}
                              disabled={enrolling || !enrollCode.trim()}
                              sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}
                            >
                              {enrolling ? <CircularProgress size={20} /> : 'Enroll'}
                            </Button>
                          </Box>
                          {enrollError && <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{enrollError}</Typography>}
                        </Box>
                      )}

                      <Box sx={{ mt: 2, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff' }}>XP Progress</Typography>
                          <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8) }}>{currentXP % xpPerLevel}/{xpPerLevel} XP</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={xpProgress} sx={{ height: 10, borderRadius: 5, backgroundColor: alpha(theme.palette.primary.main, 0.2), '& .MuiLinearProgress-bar': { backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, borderRadius: 5 } }} />
                        <Typography variant="caption" sx={{ mt: 1, color: alpha(theme.palette.common.white, 0.7), textAlign: 'right' }}>{nextLevelXP - currentXP} XP until Level {currentLevel + 1}</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff' }}>Bio:</Typography>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), borderRadius: 2 }}><Typography variant="body2">{formData.bio || 'No bio provided.'}</Typography></Paper>
                    </>
                  ) : (
                    <Box sx={{ width: '100%' }}>
                      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                      <TextField label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} fullWidth margin="normal" size="small" sx={{ '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' }, '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) } }} />
                      <TextField label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} fullWidth margin="normal" size="small" sx={{ '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' }, '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) } }} />
                      <TextField label="Bio" name="bio" value={formData.bio} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} size="small" sx={{ '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' }, '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) } }} />
                      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                        <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}>{saving ? <CircularProgress size={24} /> : 'Save'}</Button>
                        <Button startIcon={<CancelIcon />} variant="outlined" onClick={handleCancel} disabled={saving} sx={{ color: '#ffffff', borderColor: alpha(theme.palette.common.white, 0.5), '&:hover': { borderColor: '#ffffff', bgcolor: alpha(theme.palette.grey[700], 0.2) } }}>Cancel</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </GradientPaper>
            </Grow>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grow in={true} timeout={1000}>
              <GradientPaper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                      <LevelUpIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Progress Snapshot
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip label={`Total XP: ${currentXP}`} color="primary" sx={{ borderRadius: 4, fontWeight: 'bold', background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }} />
                      <Button
                        startIcon={<RefreshIcon />}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setResetDialogOpen(true)}
                        sx={{ borderRadius: 8, textTransform: 'none', color: '#ff4444', borderColor: '#ff4444', '&:hover': { borderColor: '#ff6666', bgcolor: alpha('#ff4444', 0.1) } }}
                      >
                        Reset Progress
                      </Button>
                    </Box>
                  </Box>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TimelineIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total XP</Typography>
                        </Box>
                        <Typography variant="h4">{currentXP}</Typography>
                        <Typography variant="body2" color="textSecondary">Earned through activities and achievements.</Typography>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AchievementIcon color="secondary" sx={{ fontSize: 30, mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Achievements</Typography>
                        </Box>
                        <Typography variant="h4">{achievements.length}</Typography>
                        <Typography variant="body2" color="textSecondary">Achievements unlocked so far.</Typography>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LevelUpIcon color="success" sx={{ fontSize: 30, mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Current Level</Typography>
                        </Box>
                        <Typography variant="h4">{currentLevel}</Typography>
                        <Typography variant="body2" color="textSecondary">Your current progression level.</Typography>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                </Grid>
              </GradientPaper>
            </Grow>

            <Grow in={true} timeout={1100}>
              <GradientPaper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                  Game Progression Analytics
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8), mb: 1 }}>
                      Story Mode Progress {(user.story_progress ?? 0).toFixed(0)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={user.story_progress ?? 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8), mb: 0.5 }}>
                        Learning Mode Sandbox
                      </Typography>
                      <Chip
                        label={user.learning_mode_gwa && user.learning_mode_gwa > 0 ? `Current GWA: ${user.learning_mode_gwa.toFixed(2)}` : 'Not Started'}
                        sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.light, fontWeight: 'bold' }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Python History Quiz: ${user.ch1_quiz_score ?? 0} / 5`} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.light }} />
                      <Chip label={`Story Challenges: ${user.challenges_completed ?? 0}`} sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.light }} />
                      <Chip label={`College Professors Conquered: ${user.learning_modules_completed ?? 0} / 7`} sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.light }} />
                      <Chip label={`Overall GWA: ${(user.story_mode_gwa ?? 0).toFixed(2)}`} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.light, fontWeight: 'bold' }} />
                      {user.ch1_did_remedial && (
                        <Chip label={`Python History Remedial: ${user.ch1_remedial_score ?? 0} / 5`} sx={{ bgcolor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.light }} />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setDetailsOpen(true)}
                      sx={{ borderColor: alpha(theme.palette.common.white, 0.3), color: '#fff' }}
                    >
                      View Detailed Module Analytics
                    </Button>
                  </Grid>
                </Grid>
              </GradientPaper>
            </Grow>

            <Grow in={true} timeout={1200}>
              <GradientPaper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>Recent Achievements</Typography>
                {isAchievementsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
                ) : achievements.length > 0 ? (
                  <List>
                    {achievements.map((item) => (
                      <StyledListItem key={item.id} alignItems="flex-start">
                        <ListItemAvatar><Avatar><AchievementIcon /></Avatar></ListItemAvatar>
                        <ListItemText
                          primary={item.achievement.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="textPrimary">{item.achievement.description}</Typography>
                              <Typography component="span" variant="body2" display="block">Unlocked: {new Date(item.date_unlocked).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Typography>
                              <Typography component="span" variant="body2" display="block">XP Reward: {item.achievement.xp_reward}</Typography>
                            </>
                          }
                        />
                      </StyledListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ color: alpha(theme.palette.common.white, 0.8), p: 2 }}>You haven't earned any achievements yet.</Typography>
                )}
              </GradientPaper>
            </Grow>
          </Grid>
        </Grid>

        <Dialog
          open={resetDialogOpen}
          onClose={() => setResetDialogOpen(false)}
          aria-labelledby="reset-progress-dialog-title"
          PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff' } }}
        >
          <DialogTitle id="reset-progress-dialog-title">Reset Tutorial Progress</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.8) }}>
              Are you sure you want to reset your tutorial progress? This will clear all completed tutorials, steps, and associated XP. This action cannot be undone.
            </DialogContentText>
            {resetError && <Alert severity="error" sx={{ mt: 2 }}>{resetError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)} sx={{ color: '#fff' }} disabled={resetting}>Cancel</Button>
            <Button
              onClick={handleResetProgress}
              variant="contained"
              color="error"
              startIcon={<RefreshIcon />}
              disabled={resetting}
            >
              {resetting ? <CircularProgress size={24} /> : 'Reset'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Unenroll Dialog */}
        <Dialog open={unenrollDialogOpen} onClose={() => setUnenrollDialogOpen(false)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff' } }}>
          <DialogTitle>Unenroll Classroom</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.8) }}>
              Are you sure you want to unenroll from <strong>{user.profile.classroom_name}</strong>? You will lose access to the teacher's dashboard, but you will keep your game progress.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnenrollDialogOpen(false)} sx={{ color: '#fff' }} disabled={unenrolling}>Cancel</Button>
            <Button onClick={handleUnenroll} variant="contained" color="error" disabled={unenrolling}>
              {unenrolling ? <CircularProgress size={24} /> : 'Unenroll'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detailed Godot Transcript Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: theme.palette.grey[900], color: '#fff', border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }
          }}
        >
          <DialogTitle sx={{ borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, pb: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
              Detailed Module Diagnostics for @{user.username}
            </Typography>
            {user.detailed_grades && user.detailed_grades.length > 0 && (
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.secondary.light }}>Cumulative Grade Weighted Average</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>{(user.story_mode_gwa ?? 0).toFixed(2)}</Typography>
              </Box>
            )}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {/* ── Story Mode Grades Section ── */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.warning.light, mb: 2, borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`, pb: 1 }}>
              📖 Story Mode Grades
            </Typography>
            {!user.detailed_grades || user.detailed_grades.length === 0 ? (
              <Typography sx={{ color: alpha(theme.palette.common.white, 0.6), mb: 3 }}>No story mode grades yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {user.detailed_grades.map((prof: any, idx: number) => (
                  <Box key={idx} sx={{ p: 2, bgcolor: alpha(theme.palette.common.white, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.light, mb: 1 }}>{prof.professor}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), display: 'block' }}>Final Grade</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: prof.grade === 'Not Attempted' ? alpha(theme.palette.common.white, 0.3) : '#fff' }}>{prof.grade}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), display: 'block' }}>Retakes</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: prof.retakes === 'Not Attempted' ? alpha(theme.palette.common.white, 0.3) : '#fff' }}>{prof.retakes}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), display: 'block' }}>Removal Passed</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: prof.removal_exam === 'Not Attempted' ? alpha(theme.palette.common.white, 0.3) : '#fff' }}>
                          {prof.removal_exam === true ? "Passed" : (prof.grade === 5.0 && prof.retakes > 0) ? "Failed" : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                    {prof.ai_data && prof.grade !== 'Not Attempted' && (() => {
                      const aiLabels: Record<string, string> = {
                        'Professor Query': '🤖 AI Relationship Minigame',
                        'Professor Syntax': '🤖 AI Data Type Detective',
                        'Professor View': '🤖 AI URL Router Minigame',
                        'Professor Auth': '🤖 AI ID Checker Minigame',
                        'Professor REST': '🤖 AI HTTP Verbs Minigame',
                      };
                      const label = aiLabels[prof.professor] || '🤖 AI Minigame';
                      const hasSkips = Object.entries(prof.ai_data).some(([k, v]) => k.includes('skipped') && v === true);
                      return (
                      <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
                        <Typography variant="caption" sx={{ color: theme.palette.info.light, fontWeight: 'bold', display: 'block', mb: 1 }}>
                          {label} Status
                        </Typography>
                        {prof.ai_data.ai_fully_offline ? (
                          <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>❌ Fully Offline (Auto-Skipped)</Typography>
                        ) : hasSkips ? (
                          <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>⚠️ Partial Connection (Some Auto-Skipped)</Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>✅ Online — Completed</Typography>
                        )}
                      </Box>
                      );
                    })()}
                  </Box>
                ))}
              </Box>
            )}

            {/* ── Learning Mode Grades Section ── */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.light, mb: 2, borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.3)}`, pb: 1 }}>
              📚 Learning Mode Grades (Sandbox)
            </Typography>
            {!user.learning_mode_detailed_grades || user.learning_mode_detailed_grades.length === 0 ? (
              <Typography sx={{ color: alpha(theme.palette.common.white, 0.6) }}>No learning mode grades yet. Play professors in Learning Mode to see grades here.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {user.learning_mode_detailed_grades.map((entry: any, idx: number) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: theme.palette.info.light, fontWeight: 'bold' }}>{entry.professor}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>{entry.label || entry.grade}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, p: 2 }}>
            <Button onClick={() => setDetailsOpen(false)} sx={{ color: '#fff' }}>Close Menu</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;