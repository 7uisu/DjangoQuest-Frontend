// src/layouts/AdminLayout.tsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, IconButton, AppBar, Toolbar, alpha, Chip,
  useMediaQuery, useTheme, Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Feedback as FeedbackIcon,
  Campaign as CampaignIcon,
  School as SchoolIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  VideoLibrary as VideoIcon,
  NewReleases as ReleaseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../styles/ThemeModeProvider';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  group: 'Overview' | 'People' | 'Content' | 'System';
  disabled?: boolean;
  phase?: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/admin-dashboard', group: 'Overview' },
  { label: 'Users', icon: <PeopleIcon />, path: '/admin-dashboard/users', group: 'People' },
  { label: 'Classrooms', icon: <SchoolIcon />, path: '/admin-dashboard/classrooms', group: 'People' },
  { label: 'Announcements', icon: <CampaignIcon />, path: '/admin-dashboard/announcements', group: 'Content' },
  { label: 'Video Tutorials', icon: <VideoIcon />, path: '/admin-dashboard/video-tutorials', group: 'Content' },
  { label: 'Patch Notes', icon: <ReleaseIcon />, path: '/admin-dashboard/patch-notes', group: 'Content' },
  { label: 'Feedback', icon: <FeedbackIcon />, path: '/admin-dashboard/feedback', group: 'System' },
  { label: 'Activity Log', icon: <HistoryIcon />, path: '/admin-dashboard/activity-log', group: 'System' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/admin-dashboard/settings', group: 'System' },
];

const navGroups: NavItem['group'][] = ['Overview', 'People', 'Content', 'System'];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const currentTitle = navItems.find(
    (item) => location.pathname === item.path || (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path))
  )?.label || 'Overview';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AdminIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 }}>
            DjangoQuest
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Admin Panel
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto', color: 'text.secondary' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navGroups.map((group) => (
          <Box key={group} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                py: 0.75,
                color: 'text.secondary',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {group}
            </Typography>
            {navItems.filter((item) => item.group === group).map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path));
              return (
                <ListItemButton
                  key={item.path}
                  disabled={item.disabled}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    py: 1.2,
                    px: 2,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: isActive ? 'primary.main' : item.disabled ? 'text.disabled' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.14) : alpha(theme.palette.primary.main, 0.06),
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
                  />
                  {item.phase && (
                    <Chip
                      label={item.phase}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        bgcolor: alpha(theme.palette.text.secondary, 0.12),
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Footer: Admin email + Logout */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
          Signed in as
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, mb: 1.5, fontSize: '0.8rem', wordBreak: 'break-all' }}>
          {user?.email || 'admin'}
        </Typography>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2, py: 1, px: 1.5,
            color: '#ef4444',
            '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important' }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: 'text.secondary' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1.1rem' }}>
              {currentTitle}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={toggleMode} color="primary" sx={{ mr: 1 }} aria-label="toggle theme mode">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => navigate('/download')}
              startIcon={<DownloadIcon />}
              sx={{ mr: 1, fontWeight: 'bold', textTransform: 'none' }}
            >
              Download Game
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/dashboard')}
              startIcon={<HomeIcon />}
              sx={{ color: 'text.secondary', borderColor: 'divider', textTransform: 'none', '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
            >
              My Profile
            </Button>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
