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
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  disabled?: boolean;
  phase?: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/admin-dashboard' },
  { label: 'Users', icon: <PeopleIcon />, path: '/admin-dashboard/users' },
  { label: 'Feedback', icon: <FeedbackIcon />, path: '/admin-dashboard/feedback' },
  { label: 'Announcements', icon: <CampaignIcon />, path: '/admin-dashboard/announcements' },
  { label: 'Classrooms', icon: <SchoolIcon />, path: '/admin-dashboard/classrooms' },
  { label: 'Activity Log', icon: <HistoryIcon />, path: '/admin-dashboard/activity-log' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/admin-dashboard/settings' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
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
        <AdminIcon sx={{ color: '#818cf8', fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#e2e8f0', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.5px' }}>
            DjangoQuest
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Admin Panel
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto', color: '#64748b' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              disabled={item.disabled}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.2,
                px: 2,
                bgcolor: isActive ? alpha('#818cf8', 0.15) : 'transparent',
                color: isActive ? '#818cf8' : item.disabled ? '#475569' : '#94a3b8',
                '&:hover': {
                  bgcolor: isActive ? alpha('#818cf8', 0.2) : alpha('#e2e8f0', 0.05),
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
                    bgcolor: alpha('#475569', 0.3),
                    color: '#475569',
                    border: '1px solid',
                    borderColor: alpha('#475569', 0.2),
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* Footer: Admin email + Logout */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
          Signed in as
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, mb: 1.5, fontSize: '0.8rem', wordBreak: 'break-all' }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
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
              bgcolor: '#0f0f1a',
              borderRight: '1px solid #1e293b',
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
              bgcolor: '#0f0f1a',
              borderRight: '1px solid #1e293b',
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
            bgcolor: '#0f172a',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important' }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: '#94a3b8' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1.1rem' }}>
              {currentTitle}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              sx={{ color: '#94a3b8', borderColor: '#334155', textTransform: 'none', '&:hover': { borderColor: '#475569', color: '#e2e8f0', bgcolor: alpha('#818cf8', 0.1) } }}
            >
              Return to Site
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
