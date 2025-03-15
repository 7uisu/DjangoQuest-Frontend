import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/AuthProvider';
import PrivateRoutes from "./routes/PrivateRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import Feedback from "./pages/Feedback";
import TutorialList from "./pages/TutorialList";
import TutorialLayout from "./pages/TutorialLayout";
import { Box } from '@mui/material';

const App = () => {
  const [currentSection, setCurrentSection] = useState('home');

  return (
    <Router>
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar setCurrentSection={setCurrentSection} />
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home currentSection={currentSection} setCurrentSection={setCurrentSection} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/tutorials" element={<TutorialList />} /> {/* Tutorial list */}
              <Route path="/tutorials/:id" element={<TutorialLayout />} /> {/* Specific tutorial */}
              <Route element={<PrivateRoutes />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </Box>
          <Footer setCurrentSection={setCurrentSection} />
        </Box>
      </AuthProvider>
    </Router>
  );
};

export default App;