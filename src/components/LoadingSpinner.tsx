import React from 'react';
import '../styles/LoadingSpinner.css';
import { Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = 60,
  fullScreen = false
}) => {
  const content = (
    <Box className="custom-spinner-container">
      <div className="spinner-wrapper" style={{ width: size, height: size }}>
        <img src="/DQUESTLOGO.svg" alt="DjangoQuest Logo" className="spinner-logo" />
        <div className="spinner-ring" style={{ width: size, height: size }}></div>
      </div>
      {message && (
        <Typography variant="body2" className="spinner-text" sx={{ mt: 2, color: '#44b78b', letterSpacing: '1px' }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: '80px', // Offset for navbar
        boxSizing: 'border-box'
      }}>
        {content}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, width: '100%' }}>
      {content}
    </Box>
  );
};

export default LoadingSpinner;
