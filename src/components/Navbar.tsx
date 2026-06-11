import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
} from "@mui/material";
import "../styles/Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/DQUESTLOGO.svg";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useThemeMode } from "../styles/ThemeModeProvider";

interface NavbarProps {
  setCurrentSection: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setCurrentSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, logout, user } = useAuth();

  const handleNavigation = (section: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => setCurrentSection(section), 100);
    } else {
      setCurrentSection(section);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/");
      setCurrentSection("home");
      setMobileMenuOpen(false);
    }
  };

  const publicLinks = (
    <>

      {location.pathname === "/" && (
        <>
          <Button color="inherit" onClick={() => handleNavigation("about")}>
            About
          </Button>
          <Button color="inherit" onClick={() => handleNavigation("gallery")}>
            Screenshots
          </Button>
          <Button color="inherit" onClick={() => handleNavigation("download")}>
            Download
          </Button>
        </>
      )}
      <Button 
        color="inherit" 
        component={Link} 
        to="/tutorials"
        sx={{ fontWeight: location.pathname.startsWith('/tutorials') ? 800 : 400, color: location.pathname.startsWith('/tutorials') ? 'primary.main' : 'inherit' }}
      >
        Video Tutorials
      </Button>
      <Button 
        color="inherit" 
        component={Link} 
        to="/patch-notes"
        sx={{ fontWeight: location.pathname.startsWith('/patch-notes') ? 800 : 400, color: location.pathname.startsWith('/patch-notes') ? 'primary.main' : 'inherit' }}
      >
        Patch Notes
      </Button>
    </>
  );

  const accountLinks = (
    <>
      <Button 
        color="inherit" 
        component={Link} 
        to="/dashboard"
        sx={{ fontWeight: location.pathname === '/dashboard' ? 800 : 400, color: location.pathname === '/dashboard' ? 'primary.main' : 'inherit' }}
      >
        My Profile
      </Button>
      {user?.is_student && (
        <Button 
          color="inherit" 
          component={Link} 
          to="/my-classrooms"
          sx={{ fontWeight: location.pathname.startsWith('/my-classrooms') ? 800 : 400, color: location.pathname.startsWith('/my-classrooms') ? 'primary.main' : 'inherit' }}
        >
          My Classrooms
        </Button>
      )}
      {user?.is_teacher && (
        <Button 
          color="inherit" 
          component={Link} 
          to="/teacher-dashboard"
          sx={{ fontWeight: location.pathname.startsWith('/teacher-dashboard') ? 800 : 400, color: location.pathname.startsWith('/teacher-dashboard') ? 'primary.main' : 'inherit' }}
        >
          Teacher Dashboard
        </Button>
      )}
      {user?.is_staff && (
        <Button 
          color="inherit" 
          component={Link} 
          to="/admin-dashboard"
          sx={{ fontWeight: location.pathname.startsWith('/admin-dashboard') ? 800 : 400, color: location.pathname.startsWith('/admin-dashboard') ? 'primary.main' : 'inherit' }}
        >
          Admin Dashboard
        </Button>
      )}
    </>
  );

  const renderMobileLink = (
    label: string,
    onClick?: () => void,
    to?: string
  ) => {
    const isActive = to ? (to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(to)) : false;
    return (
      <ListItemButton
        component={to ? Link : "button"}
        to={to as any}
        onClick={onClick ?? (() => setMobileMenuOpen(false))}
        sx={{
          bgcolor: isActive ? 'action.selected' : 'transparent',
          color: isActive ? 'primary.main' : 'inherit',
          '& .MuiListItemText-primary': {
            fontWeight: isActive ? 600 : 400,
          }
        }}
      >
        <ListItemText primary={label} />
      </ListItemButton>
    );
  };

  return (
    <>
      <AppBar position="fixed" className="navbar" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          <Box className="navbar-logo">
            <Button onClick={() => handleNavigation("home")} className="logo-button">
              <img src={logo} alt="DjangoQuest Logo" />
              <Box className="brand-text">
                <Typography variant="subtitle1">DjangoQuest</Typography>
                <Typography variant="caption">Learning Portal</Typography>
              </Box>
            </Button>
          </Box>

          {!isMobile && (
            <Box className="navbar-links">
              {publicLinks}
              {isAuthenticated && accountLinks}
            </Box>
          )}

          {isMobile && (
            <IconButton
              color="primary"
              aria-label="open navigation"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ ml: "auto", mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <Box className="navbar-actions">
              {isAuthenticated ? (
                <>
                  <Typography variant="body2" className="xp-chip">
                    XP: {user?.profile?.total_xp || 0}
                  </Typography>
                  <Button
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  variant="outlined"
                  size="small"
                >
                  Sign In
                </Button>
              )}

              <Button component={Link} to="/feedback" variant="contained" size="small">
                Feedback
              </Button>
              <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                <IconButton color="primary" onClick={toggleMode} aria-label="toggle theme mode">
                  {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="mobile-drawer"
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "background.paper",
            color: "text.primary",
            width: 280,
          },
        }}
      >
        <Box className="mobile-drawer-content">
          <Box className="mobile-drawer-header">
            <Box className="mobile-drawer-logo">
              <img src={logo} alt="DjangoQuest Logo" />
              <Typography variant="subtitle2">DjangoQuest</Typography>
            </Box>
            <IconButton onClick={() => setMobileMenuOpen(false)} color="primary">
              <CloseIcon />
            </IconButton>
          </Box>

          <List>

            {location.pathname === "/" && (
              <>
                {renderMobileLink("About", () => handleNavigation("about"))}
                {renderMobileLink("Screenshots", () => handleNavigation("gallery"))}
                {renderMobileLink("Download", () => handleNavigation("download"))}
              </>
            )}
            {renderMobileLink("Video Tutorials", undefined, "/tutorials")}
            {renderMobileLink("Patch Notes", undefined, "/patch-notes")}
            {isAuthenticated && (
              <>
                {renderMobileLink("My Profile", undefined, "/dashboard")}
                {user?.is_student && renderMobileLink("My Classrooms", undefined, "/my-classrooms")}
                {user?.is_teacher && renderMobileLink("Teacher Dashboard", undefined, "/teacher-dashboard")}
                {user?.is_staff && renderMobileLink("Admin Dashboard", undefined, "/admin-dashboard")}
              </>
            )}
          </List>

          <Divider />

          <List>
            {isAuthenticated ? (
              <>
                <ListItemButton sx={{ cursor: "default" }}>
                  <Chip size="small" label={`XP: ${user?.profile?.total_xp || 0}`} variant="outlined" />
                </ListItemButton>
                {renderMobileLink(mode === "light" ? "Dark Mode" : "Light Mode", toggleMode)}
                {renderMobileLink("Logout", handleLogout)}
              </>
            ) : (
              <>
                {renderMobileLink("Sign In", undefined, "/login")}
                {renderMobileLink(mode === "light" ? "Dark Mode" : "Light Mode", toggleMode)}
              </>
            )}
            {renderMobileLink("Feedback", undefined, "/feedback")}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
