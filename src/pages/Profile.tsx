// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid2,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Container,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  alpha,
  styled,
  Fade,
  Grow,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile, getUserAchievements, UserAchievementData } from '../api/user';

// Styled components for enhanced visuals (matched with Dashboard.tsx)
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

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  position: 'relative',
  background: alpha(theme.palette.grey[800], 0.7),
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
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
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [achievements, setAchievements] = useState<UserAchievementData[]>([]);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.profile?.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profile?.avatar || null);
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.profile.bio,
      });
      setAvatarPreview(user.profile.avatar);
    }
  }, [user]);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await getUserAchievements();
        setAchievements(data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      }
    };

    if (user) {
      loadAchievements();
    }
  }, [user]);

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
      setAvatarPreview(user.profile.avatar);
    }
    setAvatarFile(null);
    setEditMode(false);
  };

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
      }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        pt: 10,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                color: '#ffffff',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Your Profile, @{user.username}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: alpha(theme.palette.common.white, 0.8),
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              Manage your details and view your achievements.
            </Typography>
          </Box>
        </Fade>

        <Grid2 container spacing={4}>
          {/* Profile Card */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Grow in={true} timeout={800}>
              <GradientPaper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <ProfileAvatar src={avatarPreview || undefined} alt={user.username}>
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </ProfileAvatar>

                  {editMode && (
                    <Box sx={{ position: 'absolute', top: theme.spacing(2), right: theme.spacing(2) }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-upload"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <label htmlFor="avatar-upload">
                        <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="span"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.8),
                            '&:hover': { bgcolor: theme.palette.primary.main },
                          }}
                        >
                          <PhotoCameraIcon sx={{ color: '#fff' }} />
                        </IconButton>
                      </label>
                    </Box>
                  )}

                  {!editMode && (
                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => setEditMode(true)}
                        sx={{
                          borderRadius: 8,
                          textTransform: 'none',
                          color: '#ffffff',
                          borderColor: alpha(theme.palette.common.white, 0.5),
                          '&:hover': { borderColor: '#ffffff' },
                        }}
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  )}

                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: '#ffffff' }}
                  >
                    {formData.first_name} {formData.last_name}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ color: alpha(theme.palette.common.white, 0.8), mb: 1 }}
                  >
                    @{user.username}
                  </Typography>

                  <Chip
                    label={`Total XP: ${user.profile.total_xp}`}
                    sx={{
                      mb: 2,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Chip label="User Info" sx={{ color: '#ffffff' }} />
                </Divider>

                <Box sx={{ mt: 2 }}>
                  {!editMode ? (
                    <>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}
                      >
                        <span style={{ fontWeight: 'bold' }}>Email:</span>
                        <span>{user.email}</span>
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff' }}
                      >
                        Bio:
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.6),
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: alpha(theme.palette.common.white, 0.8) }}
                        >
                          {formData.bio || 'No bio provided. Tell others a bit about yourself!'}
                        </Typography>
                      </Paper>
                    </>
                  ) : (
                    <Box sx={{ width: '100%' }}>
                      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                      <TextField
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        size="small"
                        sx={{
                          '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' },
                          '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) },
                        }}
                      />

                      <TextField
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        size="small"
                        sx={{
                          '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' },
                          '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) },
                        }}
                      />

                      <TextField
                        label="Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        size="small"
                        sx={{
                          '& .MuiInputBase-root': { bgcolor: theme.palette.grey[800], color: '#fff' },
                          '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) },
                        }}
                      />

                      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                        <Button
                          startIcon={<SaveIcon />}
                          variant="contained"
                          onClick={handleSave}
                          disabled={saving}
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.dark },
                          }}
                        >
                          {saving ? <CircularProgress size={24} /> : 'Save'}
                        </Button>

                        <Button
                          startIcon={<CancelIcon />}
                          variant="outlined"
                          onClick={handleCancel}
                          disabled={saving}
                          sx={{
                            color: '#ffffff',
                            borderColor: alpha(theme.palette.common.white, 0.5),
                            '&:hover': { borderColor: '#ffffff', bgcolor: alpha(theme.palette.grey[700], 0.2) },
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </GradientPaper>
            </Grow>
          </Grid2>

          {/* Achievements */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Grow in={true} timeout={1000}>
              <GradientPaper sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}
                >
                  Recent Achievements
                </Typography>

                {achievements.length > 0 ? (
                  <Grid2 container spacing={2}>
                    {achievements.map((achievement) => (
                      <Grid2 size={{ xs: 12, sm: 6 }} key={achievement.achievement.id}>
                        <StyledCard variant="outlined">
                          <CardHeader
                            title={achievement.achievement.name}
                            subheader={`Unlocked: ${new Date(achievement.date_unlocked).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}`}
                            titleTypographyProps={{ sx: { color: '#ffffff', fontWeight: 'bold' } }}
                            subheaderTypographyProps={{ sx: { color: alpha(theme.palette.common.white, 0.8) } }}
                          />
                          <CardContent>
                            <Typography
                              variant="body2"
                              sx={{ color: alpha(theme.palette.common.white, 0.8) }}
                            >
                              {achievement.achievement.description}
                            </Typography>
                            <Chip
                              label={`+${achievement.achievement.xp_reward} XP`}
                              color="secondary"
                              size="small"
                              sx={{ mt: 1, bgcolor: theme.palette.secondary.main, color: '#fff' }}
                            />
                          </CardContent>
                        </StyledCard>
                      </Grid2>
                    ))}
                  </Grid2>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography
                      variant="body1"
                      sx={{ color: alpha(theme.palette.common.white, 0.8), p: 2 }}
                    >
                      You haven't earned any achievements yet.
                    </Typography>
                  </Box>
                )}
              </GradientPaper>
            </Grow>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

export default Profile;