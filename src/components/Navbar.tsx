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
      <Button color="inherit" onClick={() => handleNavigation("home")}>
        Home
      </Button>
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
      <Button color="inherit" component={Link} to="/tutorials">
        Video Tutorials
      </Button>
      <Button color="inherit" component={Link} to="/patch-notes">
        Patch Notes
      </Button>
    </>
  );

  const accountLinks = (
    <>
      {user?.is_staff && (
        <Button color="inherit" component={Link} to="/admin-dashboard">
          Admin Dashboard
        </Button>
      )}
      {user?.is_teacher && (
        <Button color="inherit" component={Link} to="/teacher-dashboard">
          Teacher Dashboard
        </Button>
      )}
      {user?.is_student && (
        <Button color="inherit" component={Link} to="/my-classrooms">
          My Classrooms
        </Button>
      )}
      <Button color="inherit" component={Link} to="/dashboard">
        My Profile
      </Button>
    </>
  );

  const renderMobileLink = (
    label: string,
    onClick?: () => void,
    to?: string
  ) => (
    <ListItemButton
      component={to ? Link : "button"}
      to={to}
      onClick={onClick ?? (() => setMobileMenuOpen(false))}
    >
      <ListItemText primary={label} />
    </ListItemButton>
  );

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
            {renderMobileLink("Home", () => handleNavigation("home"))}
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
                {user?.is_staff && renderMobileLink("Admin Dashboard", undefined, "/admin-dashboard")}
                {user?.is_teacher && renderMobileLink("Teacher Dashboard", undefined, "/teacher-dashboard")}
                {user?.is_student && renderMobileLink("My Classrooms", undefined, "/my-classrooms")}
                {renderMobileLink("My Profile", undefined, "/dashboard")}
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
