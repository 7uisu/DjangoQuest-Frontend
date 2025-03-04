// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import Home from '../pages/Home';
import DownloadPage from '../pages/DownloadPage';
import Dashboard from '../pages/Dashboard';
import Feedback from '../pages/Feedback';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';

// Import route protection
import PrivateRoutes from './PrivateRoutes';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<Feedback />} />
        {/* Add more protected routes here */}
      </Route>
      
      {/* Fallback route - 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;