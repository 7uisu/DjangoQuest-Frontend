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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
      </Container>
    </Box>
  );
};

export default Dashboard;