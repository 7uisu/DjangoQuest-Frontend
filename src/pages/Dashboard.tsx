// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid2,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  EmojiEvents as AchievementIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isAchievementsLoading, setIsAchievementsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAchievementsLoading(true);
      const fetchAchievements = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockAchievements = user.achievements || [
            {
              id: 1,
              user: user.id,
              achievement: {
                id: 1,
                name: "First Login",
                description: "Logged into the platform for the first time",
                xp_reward: 10,
                icon: null,
                created_at: new Date().toISOString(),
              },
              date_unlocked: new Date().toISOString(),
            },
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
  }, [user]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          pt: 8,
          px: 0,
          mx: 0,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Not authenticated
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh', // Full viewport height
        width: '100vw', // Full viewport width
        bgcolor: 'rgba(0, 0, 0, 0.7)', // Match navbar's black transparent background
        backdropFilter: 'blur(5px)', // Match navbar's blur effect
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'flex-start', // Align content at the top (not centered vertically)
        position: 'relative',
        pt: 8, // Space for navbar
        px: 0,
        mx: 0,
      }}
    >
      <Box sx={{ maxWidth: 'lg', width: '100%', mt: 4, mb: 4, px: { xs: 2, sm: 0 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid2 container spacing={3}>
          {/* User Profile Card */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={user.profile.avatar || undefined}
                  sx={{ width: 80, height: 80, mb: 2 }}
                >
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" component="h2">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  @{user.username}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Member since:</strong> {new Date(user.date_joined).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>XP:</strong> {user.profile.total_xp}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Bio:</strong> {user.profile.bio || 'No bio provided'}
                </Typography>
              </Box>
            </Paper>
          </Grid2>

          {/* Achievements Section */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Your Achievements
              </Typography>

              {isAchievementsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : achievements.length > 0 ? (
                <List>
                  {achievements.map((item) => (
                    <ListItem key={item.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          <AchievementIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.achievement.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {item.achievement.description}
                            </Typography>
                            <Typography component="span" variant="body2" display="block">
                              Unlocked: {new Date(item.date_unlocked).toLocaleDateString()}
                            </Typography>
                            <Typography component="span" variant="body2" display="block">
                              XP Reward: {item.achievement.xp_reward}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
                  You haven't earned any achievements yet.
                </Typography>
              )}
            </Paper>
          </Grid2>

          {/* Activity Stats Card */}
          <Grid2 size={{ xs: 12 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Activity Overview
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimelineIcon fontSize="large" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Progress
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                        {user.profile.total_xp} XP
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Keep going to earn more achievements!
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AchievementIcon fontSize="large" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Achievements
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                        {achievements.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total achievements unlocked
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="large" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Account Status
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user.is_verified
                          ? 'Your account is fully verified'
                          : 'Please verify your email address'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              </Grid2>
            </Paper>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
};

export default Dashboard;