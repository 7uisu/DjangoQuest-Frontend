import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import MarketingLanding, { LANDING_COMPLETE_KEY } from "./MarketingLanding";
import { Box } from "@mui/material";

interface LandingGateProps {
  forceShow?: boolean;
}

const LandingGate = ({ forceShow = false }: LandingGateProps) => {
  const { user, isLoading } = useAuth();
  const hasCompletedLanding = localStorage.getItem(LANDING_COMPLETE_KEY) === "true";

  if (forceShow || !hasCompletedLanding) {
    return <MarketingLanding />;
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <LoadingSpinner message="Opening DjangoQuest..." />
      </Box>
    );
  }

  if (user?.is_staff) return <Navigate to="/admin-dashboard" replace />;
  if (user?.is_teacher) return <Navigate to="/teacher-dashboard" replace />;
  if (user?.is_student) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default LandingGate;
