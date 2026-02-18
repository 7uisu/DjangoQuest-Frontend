import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tutorialApi } from '../api/axios';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Container,
  LinearProgress,
  Divider,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  CardHeader,
  CardMedia,
  Skeleton
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Bookmarks as BookmarksIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

// Define tutorial interface (aligned with backend Tutorial model)
interface Tutorial {
  id: number;
  title: string;
  description: string;
  steps: { id: number; title: string; order: number }[];
}

// Progress data (aligned with UserProgressView response)
interface ProgressData {
  currentTutorial: number | null;
  currentStep: number | null;
  isCompleted: boolean;
}

const TutorialList: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<{ [key: number]: ProgressData }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign a color to each tutorial based on its ID (for visual variety)
  const getTutorialColor = (id: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main
    ];
    return colors[id % colors.length];
  };

  // Calculate progress percentage
  const calculateProgress = (tutorial: Tutorial, userProgress?: ProgressData) => {
    if (!userProgress || userProgress.currentStep === null) return 0;
    if (userProgress.isCompleted) return 100;
    const currentStepIndex = tutorial.steps.findIndex(step => step.order === userProgress.currentStep);
    if (currentStepIndex === -1) return 0;
    return Math.round(((currentStepIndex + 1) / tutorial.steps.length) * 100);
  };

  // Fetch tutorials and user progress on mount
  useEffect(() => {
    const fetchTutorialsAndProgress = async () => {
      try {
        setLoading(true);

        // Fetch all tutorials
        const tutorialResponse = await tutorialApi.get<Tutorial[]>('/tutorials/');
        setTutorials(tutorialResponse.data);

        // Fetch user progress if authenticated
        if (isAuthenticated && user) {
          const progressResponse = await tutorialApi.get<{ [key: number]: ProgressData }>('/user/progress/');
          setProgress(progressResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch tutorials or progress:', err);
        setError('Failed to load tutorials. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorialsAndProgress();
  }, [isAuthenticated, user]);

  // Navigate to specific tutorial
  const handleStartTutorial = (tutorialId: number) => {
    navigate(`/tutorials/${tutorialId}`);
  };

  // Root container style that applies full viewport height and width
  const rootContainerStyle = {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    boxSizing: 'border-box',
    backgroundColor: '#121212',
    color: '#e0e0e0'
  };

  // Loading state with skeleton UI
  if (loading) {
    return (
      <Box sx={rootContainerStyle}>
        <Container maxWidth="lg" sx={{ py: 8, pt: '100px', flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            <Skeleton width="200px" />
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <Skeleton width="80%" />
          </Typography>
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                  <Skeleton variant="rectangular" height={140} sx={{ bgcolor: '#333' }} />
                  <CardContent>
                    <Skeleton width="80%" height={28} sx={{ bgcolor: '#333' }} />
                    <Skeleton width="100%" height={20} sx={{ mt: 1, bgcolor: '#333' }} />
                    <Skeleton width="60%" height={20} sx={{ mt: 1, bgcolor: '#333' }} />
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 2 }}>
                    <Skeleton width={120} height={36} sx={{ bgcolor: '#333' }} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <Box sx={rootContainerStyle}>
        <Container maxWidth="sm" sx={{ py: 8, pt: '100px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2, width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Render tutorial list
  return (
    <Box sx={rootContainerStyle}>
      <Container maxWidth="lg" sx={{ py: 8, pt: '100px', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon fontSize="large" sx={{ mr: 2, color: '#4fc3f7' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#e0e0e0' }}>
            Interactive Tutorials
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#1e1e1e',
            borderRadius: 2,
            border: '1px solid #333'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: '#e0e0e0' }}>
            Level Up Your Coding Skills
          </Typography>
          <Typography variant="body1" sx={{ color: '#999' }}>
            Explore our interactive, step-by-step tutorials designed to help you master programming concepts through hands-on practice.
            {!isAuthenticated && " Sign in to track your progress and unlock all features."}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {tutorials.map((tutorial) => {
            const userProgress = progress[tutorial.id];
            const isCompleted = userProgress?.isCompleted || false;
            const progressPercent = calculateProgress(tutorial, userProgress);
            const tutorialColor = getTutorialColor(tutorial.id);

            return (
              <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      borderColor: '#555',
                    },
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: tutorialColor,
                          width: 40,
                          height: 40
                        }}
                      >
                        <CodeIcon />
                      </Avatar>
                    }
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#e0e0e0' }}>
                          {tutorial.title}
                        </Typography>
                        {isCompleted && (
                          <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                    sx={{ pb: 0 }}
                  />

                  <CardContent sx={{ pt: 1, flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: '#999' }}>
                      {tutorial.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <BookmarksIcon fontSize="small" sx={{ color: '#777', mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#777' }}>
                        {tutorial.steps.length} Steps
                      </Typography>
                    </Box>

                    {isAuthenticated && (
                      <Box sx={{ mt: 2 }}>
                        {isCompleted ? (
                          <Chip
                            icon={<CheckCircleIcon fontSize="small" />}
                            label="Completed"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        ) : userProgress ? (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#999' }}>
                                Progress ({progressPercent}%)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#4fc3f7' }}>
                                Step {userProgress.currentStep ?
                                  tutorial.steps.find(s => s.id === userProgress.currentStep)?.order || '?' : 1}
                                of {tutorial.steps.length}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={progressPercent}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </>
                        ) : (
                          <Chip
                            label="Not started"
                            size="small"
                            variant="outlined"
                            sx={{
                              color: "white",
                              borderColor: "white"
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant={isCompleted ? "outlined" : "contained"}
                      color={isCompleted ? "success" : "primary"}
                      fullWidth
                      onClick={() => handleStartTutorial(tutorial.id)}
                      disabled={!isAuthenticated}
                      endIcon={<ArrowForwardIcon />}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 500,
                        textTransform: 'none'
                      }}
                    >
                      {isCompleted ? 'Review Tutorial' : userProgress ? 'Continue' : 'Start Tutorial'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {!isAuthenticated && (
          <Paper
            elevation={2}
            sx={{
              mt: 4,
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ready to track your progress?
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Sign in to save your progress and unlock all tutorials.
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1,
                textTransform: 'none',
                boxShadow: theme.shadows[4]
              }}
            >
              Sign In
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TutorialList;