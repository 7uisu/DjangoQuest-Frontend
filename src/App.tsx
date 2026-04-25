import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/AuthProvider';
import PrivateRoutes from "./routes/PrivateRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassroomStudents from "./pages/ClassroomStudents";
import Profile from "./pages/Profile";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import Feedback from "./pages/Feedback";
import TutorialList from "./pages/TutorialList";
import TutorialLayout from "./pages/TutorialLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import AdminClassroomsPage from "./pages/admin/AdminClassroomsPage";
import AdminClassroomDetailPage from "./pages/admin/AdminClassroomDetailPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import { Box } from '@mui/material';

const App = () => {
  const [currentSection, setCurrentSection] = useState('home');

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Admin dashboard — completely separate layout (no Navbar/Footer) */}
          <Route
            path="/admin-dashboard/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="feedback" element={<AdminFeedbackPage />} />
            <Route path="announcements" element={<AdminAnnouncementsPage />} />
            <Route path="classrooms" element={<AdminClassroomsPage />} />
            <Route path="classrooms/:id" element={<AdminClassroomDetailPage />} />
            <Route path="activity-log" element={<AdminAuditLogPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Regular site — with Navbar and Footer */}
          <Route
            path="*"
            element={
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar setCurrentSection={setCurrentSection} />
                <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Routes>
                    <Route path="/" element={<Home currentSection={currentSection} setCurrentSection={setCurrentSection} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/tutorials" element={<TutorialList />} />
                    <Route path="/tutorials/:id" element={<TutorialLayout />} />
                    <Route element={<PrivateRoutes />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                      <Route path="/teacher-dashboard/class/:id" element={<ClassroomStudents />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Routes>
                </Box>
                <Footer />
              </Box>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;