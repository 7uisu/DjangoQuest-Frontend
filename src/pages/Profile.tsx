// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid2, // Replace Grid with Grid2
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile, getUserAchievements, UserAchievementData } from '../api/user';

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
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
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
        profile: {
          bio: formData.bio,
          avatar: avatarFile,
        },
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'rgba(0, 0, 0, 0.7)', // Match navbar's black transparent background
        backdropFilter: 'blur(5px)', // Match navbar's blur effect
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        pt: 8,
        px: 0,
        mx: 0,
      }}
    >
      <Box sx={{ maxWidth: 'lg', width: '100%', mt: 4, mb: 4, px: { xs: 2, sm: 0 } }}>
        <Grid2 container spacing={3}>
          {/* Profile Card */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview || undefined}
                    alt={user.username}
                    sx={{ width: 150, height: 150, mb: 2 }}
                  />
                  {editMode && (
                    <Box sx={{ position: 'absolute', right: 0, bottom: 10 }}>
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
                          sx={{ bgcolor: 'white' }}
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      </label>
                    </Box>
                  )}
                </Box>

                <Typography variant="h5" gutterBottom>
                  {user.username}
                </Typography>

                <Chip
                  label={`XP: ${user.profile.total_xp}`}
                  color="primary"
                  sx={{ mb: 2 }}
                />

                {!editMode ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                      {user.profile.bio || "No bio available"}
                    </Typography>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      onClick={() => setEditMode(true)}
                      sx={{ mt: 3 }}
                    >
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      size="small"
                    />

                    <TextField
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      size="small"
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
                    />

                    <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                      <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={24} /> : 'Save'}
                      </Button>

                      <Button
                        startIcon={<CancelIcon />}
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid2>

          {/* Achievements */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff' }}>
              <Typography variant="h5" gutterBottom>
                Achievements
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {achievements.length > 0 ? (
                <Grid2 container spacing={2}>
                  {achievements.map((achievement) => (
                    <Grid2 size={{ xs: 12, sm: 6 }} key={achievement.achievement.id}>
                      <Card variant="outlined">
                        <CardHeader
                          title={achievement.achievement.name}
                          subheader={`Unlocked: ${new Date(achievement.date_unlocked).toLocaleDateString()}`}
                        />
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">
                            {achievement.achievement.description}
                          </Typography>
                          <Chip
                            label={`+${achievement.achievement.xp_reward} XP`}
                            color="secondary"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    You haven't unlocked any achievements yet.
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Complete tasks and challenges to earn achievements and XP!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
};

export default Profile;