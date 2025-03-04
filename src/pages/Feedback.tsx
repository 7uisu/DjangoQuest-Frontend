// src/pages/Feedback.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Rating, 
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Feedback as FeedbackIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

interface FeedbackData {
  rating: number;
  category: string;
  message: string;
}

const Feedback: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState<FeedbackData>({
    rating: 0,
    category: '',
    message: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null) => {
    setFormData({ ...formData, rating: newValue || 0 });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, category: event.target.value });
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, message: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formData.rating === 0) {
      setError('Please provide a rating');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    if (formData.message.trim().length < 10) {
      setError('Please provide more detailed feedback (at least 10 characters)');
      return;
    }
    
    setSubmitLoading(true);
    setError(null);
    
    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API call - replace with actual call
      /*
      await api.post('/feedback/', {
        user_id: user?.id,
        rating: formData.rating,
        category: formData.category,
        message: formData.message
      });
      */
      
      // Reset form
      setFormData({
        rating: 0,
        category: '',
        message: ''
      });
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FeedbackIcon fontSize="large" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            We Value Your Feedback
          </Typography>
        </Box>
        
        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
          Your feedback helps us improve our services. Please take a moment to share your thoughts and experiences.
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>How would you rate your overall experience?</FormLabel>
            <Rating
              name="rating"
              value={formData.rating}
              onChange={handleRatingChange}
              size="large"
              precision={0.5}
              sx={{ fontSize: '2rem' }}
            />
          </Box>
          
          <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
            <FormLabel component="legend">What area would you like to give feedback on?</FormLabel>
            <RadioGroup
              aria-label="feedback-category"
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
            >
              <FormControlLabel value="user-interface" control={<Radio />} label="User Interface" />
              <FormControlLabel value="performance" control={<Radio />} label="Performance" />
              <FormControlLabel value="features" control={<Radio />} label="Features" />
              <FormControlLabel value="support" control={<Radio />} label="Customer Support" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
          
          <TextField
            label="Your Feedback"
            multiline
            rows={4}
            fullWidth
            value={formData.message}
            onChange={handleMessageChange}
            variant="outlined"
            placeholder="Please share your thoughts, suggestions, or issues you've encountered..."
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={submitLoading}
          >
            {submitLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
        
        {/* Success Snackbar */}
        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
            Thank you for your feedback! We appreciate your input.
          </Alert>
        </Snackbar>
        
        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Feedback;