// src/pages/Feedback.tsx
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, TextField, Button, Rating, Box,
  Stepper, Step, StepLabel, Card, CardActionArea, CardContent,
  Snackbar, Alert, CircularProgress, alpha, Select, MenuItem,
  FormControl, InputLabel, FormLabel,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  Language as WebsiteIcon,
  School as ClassroomIcon,
  Send as SendIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/axios';
import axios from 'axios';

const STEPS = ['Category', 'Rating', 'Details'];

interface FeedbackFormData {
  feedback_type: string;
  rating: number;
  comments: string;
  game_level: string;
  curriculum_relevance_rating: number;
  website_usability_notes: string;
  classroom_id: number | '';
}

const Feedback: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedback_type: '',
    rating: 0,
    comments: '',
    game_level: '',
    curriculum_relevance_rating: 0,
    website_usability_notes: '',
    classroom_id: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherClassrooms, setTeacherClassrooms] = useState<{ id: number; name: string }[]>([]);

  const isTeacher = user?.is_teacher || false;

  // Fetch teacher's classrooms
  useEffect(() => {
    if (isTeacher) {
      const fetchClassrooms = async () => {
        try {
          const res = await userApi.get('/../../dashboard/classrooms/');
          setTeacherClassrooms(res.data || []);
        } catch {
          // Classrooms not critical — silently fail
        }
      };
      fetchClassrooms();
    }
  }, [isTeacher]);

  const feedbackTypes = isTeacher
    ? [
        { value: 'game', label: 'Game', icon: <GameIcon sx={{ fontSize: 40 }} />, color: '#818cf8' },
        { value: 'website', label: 'Website', icon: <WebsiteIcon sx={{ fontSize: 40 }} />, color: '#2dd4bf' },
      ]
    : [
        { value: 'game', label: 'Game', icon: <GameIcon sx={{ fontSize: 40 }} />, color: '#818cf8' },
        { value: 'website', label: 'Website', icon: <WebsiteIcon sx={{ fontSize: 40 }} />, color: '#2dd4bf' },
        { value: 'classroom', label: 'Classroom', icon: <ClassroomIcon sx={{ fontSize: 40 }} />, color: '#fbbf24' },
      ];

  const handleNext = () => {
    if (activeStep === 0 && !formData.feedback_type) {
      setError('Please select a category.');
      return;
    }
    if (activeStep === 1 && formData.rating === 0) {
      setError('Please provide a rating.');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        feedback_type: formData.feedback_type,
        rating: formData.rating,
        comments: formData.comments,
      };

      // Teacher extras
      if (isTeacher) {
        if (formData.feedback_type === 'game') {
          if (formData.game_level) payload.game_level = formData.game_level;
          if (formData.curriculum_relevance_rating > 0) payload.curriculum_relevance_rating = formData.curriculum_relevance_rating;
        }
        if (formData.feedback_type === 'website') {
          if (formData.website_usability_notes) payload.website_usability_notes = formData.website_usability_notes;
        }
        if (formData.classroom_id) payload.classroom_id = formData.classroom_id;
      }

      // Create feedback API instance
      const feedbackApi = axios.create({
        baseURL: '/api/feedback',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      await feedbackApi.post('/', payload);

      // Reset
      setFormData({ feedback_type: '', rating: 0, comments: '', game_level: '', curriculum_relevance_rating: 0, website_usability_notes: '', classroom_id: '' });
      setActiveStep(0);
      setSuccess(true);
    } catch (err: any) {
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const firstError = Object.values(detail).flat()[0];
        setError(String(firstError) || 'Failed to submit feedback.');
      } else {
        setError(detail?.detail || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Share Your Feedback
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Help us improve DjangoQuest with your thoughts and suggestions.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Category */}
        {activeStep === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${feedbackTypes.length}, 1fr)` }, gap: 2 }}>
            {feedbackTypes.map((type) => (
              <Card
                key={type.value}
                elevation={0}
                sx={{
                  border: '2px solid',
                  borderColor: formData.feedback_type === type.value ? type.color : '#e2e8f0',
                  borderRadius: 3,
                  bgcolor: formData.feedback_type === type.value ? alpha(type.color, 0.08) : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <CardActionArea
                  onClick={() => setFormData({ ...formData, feedback_type: type.value })}
                  sx={{ py: 3, textAlign: 'center' }}
                >
                  <CardContent>
                    <Box sx={{ color: formData.feedback_type === type.value ? type.color : '#94a3b8', mb: 1 }}>
                      {type.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{type.label}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}

        {/* Step 2: Rating */}
        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              How would you rate your experience?
            </Typography>
            <Rating
              value={formData.rating}
              onChange={(_e, newValue) => setFormData({ ...formData, rating: newValue || 0 })}
              size="large"
              icon={<StarIcon sx={{ fontSize: 48, color: '#fbbf24' }} />}
              emptyIcon={<StarIcon sx={{ fontSize: 48, color: '#e2e8f0' }} />}
            />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {formData.rating > 0 ? `${formData.rating} / 5` : 'Tap a star to rate'}
            </Typography>
          </Box>
        )}

        {/* Step 3: Details */}
        {activeStep === 2 && (
          <Box>
            <TextField
              label="Your Feedback"
              multiline
              rows={4}
              fullWidth
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Share your thoughts, suggestions, or issues..."
              sx={{ mb: 2.5 }}
            />

            {/* Teacher extras */}
            {isTeacher && formData.feedback_type === 'game' && (
              <>
                <TextField
                  label="Game Level (optional)"
                  fullWidth
                  value={formData.game_level}
                  onChange={(e) => setFormData({ ...formData, game_level: e.target.value })}
                  placeholder="e.g. Level 3: Views & URLs"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <FormLabel sx={{ fontSize: '0.875rem', mb: 0.5, display: 'block' }}>
                    Curriculum Relevance (optional)
                  </FormLabel>
                  <Rating
                    value={formData.curriculum_relevance_rating}
                    onChange={(_e, v) => setFormData({ ...formData, curriculum_relevance_rating: v || 0 })}
                  />
                </Box>
              </>
            )}
            {isTeacher && formData.feedback_type === 'website' && (
              <TextField
                label="Usability Notes (optional)"
                multiline
                rows={3}
                fullWidth
                value={formData.website_usability_notes}
                onChange={(e) => setFormData({ ...formData, website_usability_notes: e.target.value })}
                placeholder="Any notes on navigation, layout, or features..."
                sx={{ mb: 2 }}
              />
            )}
            {isTeacher && teacherClassrooms.length > 1 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Which classroom relates to this?</InputLabel>
                <Select
                  value={formData.classroom_id}
                  label="Which classroom relates to this?"
                  onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value as number })}
                >
                  {teacherClassrooms.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} sx={{ textTransform: 'none' }}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitLoading}
              startIcon={submitLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              sx={{ textTransform: 'none' }}
            >
              {submitLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSuccess(false)} severity="success" variant="filled">
          Thank you for your feedback! We appreciate your input.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Feedback;