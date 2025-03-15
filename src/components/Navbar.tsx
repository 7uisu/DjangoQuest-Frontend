import { AppBar, Toolbar, Button, Box, Typography, IconButton, Drawer, List, ListItemButton, ListItemText, Divider, useMediaQuery, useTheme } from "@mui/material";
import "../styles/Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/DQUESTLOGO.svg";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

interface NavbarProps {
  setCurrentSection: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setCurrentSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { isAuthenticated, logout, user } = useAuth();

  const handleNavigation = (section: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        setCurrentSection(section);
      }, 100);
    } else {
      setCurrentSection(section);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setCurrentSection('home');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar position="fixed" className="navbar">
        <Toolbar>
          {/* LEFT - Logo */}
          <Box className="navbar-logo">
            <Button onClick={() => handleNavigation("home")} className="logo-button">
              <img src={logo} alt="DjangoQuest Logo" />
            </Button>
          </Box>

          {/* CENTER - Navigation Links (Desktop only) */}
          {!isMobile && (
            <Box className="navbar-links">
              <Button color="inherit" onClick={() => handleNavigation("home")}>Home</Button>
              <Button color="inherit" onClick={() => handleNavigation("about")}>About</Button>
              <Button color="inherit" onClick={() => handleNavigation("gallery")}>Gallery</Button>
              <Button color="inherit" onClick={() => handleNavigation("download")}>Download</Button>
              <Button color="inherit" component={Link} to="/tutorials">Tutorials</Button>
              {isAuthenticated && (
                <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
              )}
            </Box>
          )}

          {/* Mobile menu button - Only shown on mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileMenu}
              sx={{ ml: 'auto', mr: 2, color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* RIGHT - Sign In/Out, XP, & Feedback - Only shown on desktop */}
          {!isMobile && (
            <Box className="navbar-actions">
              {isAuthenticated ? (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      padding: "5px 15px",
                      border: "1px solid #ccc",
                      borderRadius: "20px",
                      backgroundColor: "white",
                      color: "black",
                      fontSize: "14px",
                      marginRight: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    XP: {user?.profile?.total_xp || 0}
                  </Typography>
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
                </>
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
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="mobile-drawer"
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: '#1e1e1e', // Dark background
            color: '#ffffff', // White text
            width: 250,
          }
        }}
      >
        <Box className="mobile-drawer-content">
          <Box className="mobile-drawer-header">
            <Box className="mobile-drawer-logo">
              <img src={logo} alt="DjangoQuest Logo" />
            </Box>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#ffffff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List>
            <ListItemButton onClick={() => handleNavigation("home")}>
              <ListItemText primary="Home" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
            </ListItemButton>
            <ListItemButton onClick={() => handleNavigation("about")}>
              <ListItemText primary="About" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
            </ListItemButton>
            <ListItemButton onClick={() => handleNavigation("gallery")}>
              <ListItemText primary="Gallery" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
            </ListItemButton>
            <ListItemButton onClick={() => handleNavigation("download")}>
              <ListItemText primary="Download" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/tutorials" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="Tutorials" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
            </ListItemButton>
            {isAuthenticated && (
              <ListItemButton component={Link} to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary="Dashboard" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
              </ListItemButton>
            )}
          </List>
          
          <Divider sx={{ backgroundColor: '#444' }} /> {/* Darker divider */}
          
          <List>
            {isAuthenticated ? (
              <>
                <ListItemButton sx={{ backgroundColor: "transparent", cursor: "default" }}>
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                    XP: {user?.profile?.total_xp || 0}
                  </Typography>
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Logout" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
                </ListItemButton>
              </>
            ) : (
              <ListItemButton component={Link} to="/login" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary="Sign In" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
              </ListItemButton>
            )}
            <ListItemButton component={Link} to="/feedback" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="Feedback" sx={{ '& .MuiListItemText-primary': { color: '#ffffff' } }} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;