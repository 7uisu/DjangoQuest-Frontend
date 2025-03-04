import { AppBar, Toolbar, Button, Box } from "@mui/material";
import "../styles/Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/DQUESTLOGO.svg";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect } from "react";
// Import the proper auth context
import { useAuth } from '../hooks/useAuth';

// Add this interface for the props
interface NavbarProps {
  setCurrentSection: (section: string) => void;
}

// Add the type annotation to the component
const Navbar: React.FC<NavbarProps> = ({ setCurrentSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the auth context instead of local state
  const { isAuthenticated, logout } = useAuth();

  // Add type for the section parameter
  const handleNavigation = (section: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        setCurrentSection(section);
      }, 100);
    } else {
      setCurrentSection(section);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setCurrentSection('home');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  // In your Navbar
console.log("Navbar rendering, isAuthenticated:", isAuthenticated);

  return (
    <AppBar position="fixed" className="navbar">
      <Toolbar>
        {/* LEFT - Logo */}
        <Box className="navbar-logo">
          <Button onClick={() => handleNavigation("home")} className="logo-button">
            <img src={logo} alt="DjangoQuest Logo" />
          </Button>
        </Box>

        {/* CENTER - Navigation Links */}
        <Box className="navbar-links">
          <Button color="inherit" onClick={() => handleNavigation("home")}>Home</Button>
          <Button color="inherit" onClick={() => handleNavigation("about")}>About</Button>
          <Button color="inherit" onClick={() => handleNavigation("gallery")}>Gallery</Button>
          <Button color="inherit" onClick={() => handleNavigation("download")}>Download</Button>
          {isAuthenticated && (
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          )}
        </Box>

        {/* RIGHT - Sign In/Out & Feedback */}
        <Box className="navbar-actions">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                padding: "5px 15px",
                border: "1px solid #ccc",
                borderRadius: "20px",
                backgroundColor: "white",
                color: "black",
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: "#f8d7da",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
              sx={{
                padding: "5px 15px",
                border: "1px solid #ccc",
                borderRadius: "20px",
                backgroundColor: "white",
                color: "black",
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: "#f1f1f1",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              Sign In
            </Button>
          )}

          <Button 
            component={Link} 
            to="/feedback"
            sx={{
              padding: "8px 20px",
              borderRadius: "20px",
              backgroundColor: "#7FD8D4",
              color: "black",
              fontSize: "14px",
              "&:hover": {
                backgroundColor: "#5ac8a5",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }
            }}
          >
            Feedback
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    
  );
};

export default Navbar;