import { useState, Component, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ─── Global Error Boundary ────────────────────────────────────────────────────
// Catches any render-time crash in a child component tree and displays a
// graceful fallback instead of a permanent White Screen of Death.
interface ErrorBoundaryState { hasError: boolean; }
class GlobalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production you'd send this to Sentry / your logging service
    console.error('[GlobalErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif',
                      gap: '1rem', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem' }}>⚠️ Something went wrong</h1>
          <p style={{ color: '#555', maxWidth: 480 }}>
            A dashboard module failed to load. This is usually caused by unexpected data
            from the server. Please refresh the page — if the problem persists, contact support.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: '0.6rem 1.4rem', fontSize: '1rem', cursor: 'pointer',
                     borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
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
import Leaderboard from "./pages/Leaderboard";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import Feedback from "./pages/Feedback";
import TutorialList from "./pages/TutorialList";
import TutorialVideoLayout from "./pages/TutorialVideoLayout";
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
import AdminTutorialsPage from "./pages/admin/AdminTutorialsPage";
import AdminTutorialStepsPage from "./pages/admin/AdminTutorialStepsPage";
import { Box } from '@mui/material';

const App = () => {
  const [currentSection, setCurrentSection] = useState('home');

  return (
    <Router>
      <AuthProvider>
        <GlobalErrorBoundary>
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
            <Route path="video-tutorials" element={<AdminTutorialsPage />} />
            <Route path="video-tutorials/:id" element={<AdminTutorialStepsPage />} />
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
                    <Route path="/tutorials/:id/video" element={<TutorialVideoLayout />} />
                    <Route element={<PrivateRoutes />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                      <Route path="/teacher-dashboard/class/:id" element={<ClassroomStudents />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                    </Route>
                  </Routes>
                </Box>
                <Footer />
              </Box>
            }
          />
        </Routes>
        </GlobalErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;