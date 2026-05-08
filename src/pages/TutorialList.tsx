import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorialApi } from '../api/axios';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip,
  Container, LinearProgress, Paper, Avatar, useTheme, CardHeader, Skeleton, Alert, CardMedia
} from '@mui/material';
import {
  School as SchoolIcon, Code as CodeIcon, CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon, Bookmarks as BookmarksIcon,
  PlayCircleFilled as VideoIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  tutorial_type: 'interactive' | 'video';
  steps: { id: number; title: string; order: number }[];
}

interface ProgressData {
  currentTutorial: number | null;
  currentStep: number | null;
  isCompleted: boolean;
}

const TutorialList: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<{ [key: number]: ProgressData }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isVideo = true;

  const getTutorialColor = (id: number) => {
    const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main];
    return colors[id % colors.length];
  };

  const calculateProgress = (tutorial: Tutorial, userProgress?: ProgressData) => {
    if (!userProgress || userProgress.currentStep === null) return 0;
    if (userProgress.isCompleted) return 100;
    const currentStepIndex = tutorial.steps.findIndex(step => step.order === userProgress.currentStep);
    if (currentStepIndex === -1) return 0;
    return Math.round(((currentStepIndex + 1) / tutorial.steps.length) * 100);
  };

  useEffect(() => {
    const fetchTutorialsAndProgress = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const apiPath = '/video/';
        const progressPath = '/video/progress/';

        const tutorialResponse = await tutorialApi.get<Tutorial[]>(apiPath);
        setTutorials(tutorialResponse.data);

        if (user) {
          const progressResponse = await tutorialApi.get<{ [key: number]: ProgressData }>(progressPath);
          setProgress(progressResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch tutorials:', err);
        setError('Failed to load tutorials. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorialsAndProgress();
  }, [isAuthenticated, user]);

  const rootContainerStyle = {
    minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
    overflow: 'auto', boxSizing: 'border-box' as const, backgroundColor: '#121212', color: '#e0e0e0',
    paddingTop: '32px'
  };

  if (!isAuthenticated && !loading) {
    return (
      <Box sx={rootContainerStyle}>
        <Container maxWidth="sm" sx={{ py: 8, pt: '100px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert 
            severity="info" 
            sx={{ width: '100%' }}
            action={<Button color="inherit" size="small" onClick={() => navigate('/login')}>Login</Button>}
          >
            You need to login first to view the Video Tutorials.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={rootContainerStyle}>
        <Container maxWidth="lg" sx={{ py: 8, pt: '100px', flexGrow: 1 }}>
          <Skeleton width="300px" height={60} sx={{ bgcolor: '#333', mb: 4 }} />
          <Grid container spacing={4}>
            {[1, 2, 3].map((n) => (
              <Grid item xs={12} md={4} key={n}>
                <Skeleton variant="rectangular" height={200} sx={{ bgcolor: '#333', borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={rootContainerStyle}>
        <Container maxWidth="sm" sx={{ py: 8, pt: '100px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Retry</Button>}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  const categoryTutorials = tutorials;

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` : null;
  };

  const renderCard = (tutorial: Tutorial) => {
    const userProgress = progress[tutorial.id];
    const isCompleted = userProgress?.isCompleted || false;
    const progressPercent = calculateProgress(tutorial, userProgress);
    const tutorialColor = getTutorialColor(tutorial.id);
    const buttonText = isVideo ? "Watch Video Guide" : (isCompleted ? "Review Challenges" : progress[tutorial.id] ? "Continue Coding" : "Start Challenges");
    const thumbnailUrl = getYoutubeThumbnail(tutorial.videoUrl);

    return (
      <Grid item xs={12} md={4} key={tutorial.id}>
        <Card
          elevation={2}
          sx={{
            height: '100%',
            display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease',
            backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: 2,
            '&:hover': { transform: 'translateY(-4px)', borderColor: isVideo ? '#f44336' : '#2196f3', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
            overflow: 'hidden'
          }}
        >
          {thumbnailUrl && (
            <CardMedia
              component="img"
              height="180"
              image={thumbnailUrl}
              alt={tutorial.title}
              sx={{ borderBottom: '1px solid #333', objectFit: 'cover' }}
            />
          )}
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: isVideo ? '#d32f2f' : tutorialColor, width: 44, height: 44 }}>{isVideo ? <VideoIcon /> : <CodeIcon />}</Avatar>}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#e0e0e0', fontSize: '1.1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{tutorial.title}</Typography>
                {!isVideo && isCompleted && <CheckCircleIcon fontSize="small" color="success" />}
              </Box>
            }
            sx={{ pb: 0, pt: 2.5 }}
          />
          <CardContent sx={{ pt: 1.5, flexGrow: 1 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#aaa', minHeight: '60px', lineHeight: 1.6 }}>{tutorial.description}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BookmarksIcon fontSize="small" sx={{ color: '#777', mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#777', fontWeight: 500 }}>{tutorial.steps.length} {isVideo ? 'Topics' : 'Challenges'}</Typography>
            </Box>
            {isAuthenticated && !isVideo && (
              <Box sx={{ mt: 1, height: 40 }}>
                {isCompleted ? (
                  <Chip icon={<CheckCircleIcon fontSize="small" />} label="Completed" color="success" size="small" variant="outlined" />
                ) : userProgress ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#999' }}>Progress</Typography>
                      <Typography variant="caption" sx={{ color: '#4fc3f7' }}>{progressPercent}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 6, borderRadius: 3 }} />
                  </>
                ) : (
                  <Chip label="Not started" size="small" variant="outlined" sx={{ color: '#888', borderColor: '#444' }} />
                )}
              </Box>
            )}
          </CardContent>
          <CardActions sx={{ p: 2.5, pt: 0 }}>
            <Button
              variant={isVideo ? "outlined" : (isCompleted ? "outlined" : "contained")}
              color={isVideo ? "error" : (isCompleted ? "success" : "primary")}
              fullWidth
              onClick={() => navigate(isVideo ? `/tutorials/${tutorial.id}/video` : `/tutorials/${tutorial.id}`)}
              disabled={!isAuthenticated}
              endIcon={isVideo ? <VideoIcon /> : <ArrowForwardIcon />}
              sx={{ borderRadius: 1.5, fontWeight: 600, py: 1, textTransform: 'none' }}
            >
              {buttonText}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={rootContainerStyle}>
      <Container maxWidth="lg" sx={{ py: 6, pt: { xs: '80px', md: '100px' }, flexGrow: 1 }}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isVideo ? <VideoIcon sx={{ color: '#f44336', fontSize: 40, mr: 2 }} /> : <SchoolIcon sx={{ color: '#4fc3f7', fontSize: 40, mr: 2 }} />}
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              {isVideo ? 'Video Tutorials' : 'Interactive Learning'}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#999', mt: 2, fontWeight: 400 }}>
            {isVideo 
              ? 'Watch step-by-step videos and follow the text guides below them locally. Best for deep-dive theory.' 
              : 'Write raw code in your browser and get immediate validation. Best for hands-on, practical learning.'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {categoryTutorials.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1e1e1e', borderRadius: 2, border: '1px dashed #444' }}>
                <Typography sx={{ color: '#666', fontSize: '1.1rem' }}>No tutorials available in this category yet.</Typography>
              </Paper>
            </Grid>
          ) : (
            categoryTutorials.map(renderCard)
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default TutorialList;
