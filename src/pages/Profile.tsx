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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [detailsOpen, setDetailsOpen] = useState(false);
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

          {/* Game Progress Card */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Grow in={true} timeout={900}>
              <GradientPaper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                  Game Progression Analytics
                </Typography>

                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
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
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8), mb: 0.5 }}>
                        Learning Mode Sandbox
                      </Typography>
                      <Chip
                        label={user.learning_mode_gwa && user.learning_mode_gwa > 0 ? `Current GWA: ${user.learning_mode_gwa.toFixed(2)}` : 'Not Started'}
                        sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.light, fontWeight: 'bold' }}
                      />
                    </Box>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Python History Quiz: ${user.ch1_quiz_score ?? 0} / 5`} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.light }} />
                      <Chip label={`Story Challenges: ${user.challenges_completed ?? 0}`} sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.light }} />
                      <Chip label={`College Professors Conquered: ${user.learning_modules_completed ?? 0} / 7`} sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.light }} />
                      <Chip label={`Overall GWA: ${(user.story_mode_gwa ?? 0).toFixed(2)}`} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.light, fontWeight: 'bold' }} />
                      {user.ch1_did_remedial && (
                        <Chip label={`Python History Remedial: ${user.ch1_remedial_score ?? 0} / 5`} sx={{ bgcolor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.light }} />
                      )}
                    </Box>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setDetailsOpen(true)}
                      sx={{ borderColor: alpha(theme.palette.common.white, 0.3), color: '#fff' }}
                    >
                      View Detailed Module Analytics
                    </Button>
                  </Grid2>
                </Grid2>
              </GradientPaper>
            </Grow>

            {/* Achievements */}
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

      {/* Advanced Details Dialog */}
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
    </Box>
  );
};

export default Profile;