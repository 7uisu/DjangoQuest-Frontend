// src/pages/admin/AdminAnnouncementsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Skeleton, Alert, alpha, IconButton, Snackbar,
  Tabs, Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { editAdminAnnouncement } from '../../api/admin';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

interface Announcement {
  id: number;
  author_name: string;
  author_email: string;
  announcement_type: string;
  title: string;
  body: string;
  target_classrooms: { id: number; name: string }[];
  created_at: string;
  updated_at: string;
}

const timeAgo = (dateStr: string): string => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Edit state
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [tabIndex, setTabIndex] = useState(0); // 0: Platform, 1: Classroom

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements/');
      setAnnouncements(res.data);
    } catch {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/announcements/', {
        announcement_type: 'platform',
        title: title.trim(),
        body: body.trim(),
      });
      setDialogOpen(false);
      setTitle('');
      setBody('');
      setSnackbar('Platform announcement published!');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/announcements/${id}/`);
      setSnackbar('Announcement deleted.');
      fetchAnnouncements();
    } catch {
      setError('Failed to delete announcement.');
    }
  };

  const openEdit = (a: Announcement) => {
    setEditTarget(a);
    setEditTitle(a.title);
    setEditBody(a.body);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      await editAdminAnnouncement(editTarget.id, { title: editTitle, body: editBody });
      setEditTarget(null);
      setSnackbar('Announcement updated.');
      fetchAnnouncements();
    } catch {
      setError('Failed to update announcement.');
    } finally { setEditSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Announcements</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Manage platform-wide and classroom announcements.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: '#818cf8', textTransform: 'none', fontWeight: 600, borderRadius: 2,
            '&:hover': { bgcolor: '#6366f1' },
          }}
        >
          New Platform Announcement
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: '#334155', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontWeight: 600 }, '& .Mui-selected': { color: '#818cf8 !important' }, '& .MuiTabs-indicator': { bgcolor: '#818cf8' } }}>
          <Tab label={`Platform Announcements (${announcements.filter(a => a.announcement_type === 'platform').length})`} />
          <Tab label={`Classroom Announcements (${announcements.filter(a => a.announcement_type === 'classroom').length})`} />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Paper key={i} sx={{ p: 2.5, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155' }}>
              <Skeleton variant="text" width={250} sx={{ bgcolor: '#334155' }} />
              <Skeleton variant="text" width="90%" sx={{ bgcolor: '#334155', mt: 1 }} />
            </Paper>
          ))
        ) : announcements.length === 0 ? (
          <Paper sx={{ p: 4, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155', textAlign: 'center' }}>
            <CampaignIcon sx={{ fontSize: 48, color: '#334155', mb: 1 }} />
            <Typography sx={{ color: '#475569' }}>No announcements yet.</Typography>
          </Paper>
        ) : (
          announcements.filter(a => tabIndex === 0 ? a.announcement_type === 'platform' : a.announcement_type === 'classroom').map((a) => (
            <Paper
              key={a.id}
              sx={{
                p: 2.5, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155',
                '&:hover': { borderColor: '#475569' }, transition: 'border-color 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={a.announcement_type === 'platform' ? 'Platform' : 'Classroom'}
                      size="small"
                      sx={{
                        bgcolor: a.announcement_type === 'platform' ? alpha('#818cf8', 0.2) : alpha('#2dd4bf', 0.2),
                        color: a.announcement_type === 'platform' ? '#818cf8' : '#2dd4bf',
                        fontWeight: 600, fontSize: '0.7rem',
                      }}
                    />
                    {a.target_classrooms.map((c) => (
                      <Chip
                        key={c.id} label={c.name} size="small"
                        sx={{ bgcolor: alpha('#2dd4bf', 0.1), color: '#2dd4bf', fontSize: '0.65rem' }}
                      />
                    ))}
                    <Typography variant="caption" sx={{ color: '#475569' }}>{timeAgo(a.created_at)}</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ color: '#e2e8f0', fontWeight: 600 }}>{a.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>{a.body}</Typography>
                  <Typography variant="caption" sx={{ color: '#475569', mt: 1, display: 'block' }}>
                    by {a.author_name} ({a.author_email})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton onClick={() => openEdit(a)} size="small"
                    sx={{ color: '#64748b', '&:hover': { color: '#818cf8', bgcolor: alpha('#818cf8', 0.1) } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(a.id)} size="small"
                    sx={{ color: '#64748b', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>New Platform Announcement</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 1, mb: 2, '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#0f172a' }, '& label': { color: '#64748b' }, '& fieldset': { borderColor: '#334155' } }}
          />
          <TextField
            fullWidth multiline rows={4} label="Body" value={body} onChange={(e) => setBody(e.target.value)}
            sx={{ '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#0f172a' }, '& label': { color: '#64748b' }, '& fieldset': { borderColor: '#334155' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={submitting || !title.trim() || !body.trim()}
            sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' }, textTransform: 'none' }}
          >
            {submitting ? 'Publishing…' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Announcement</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1, mb: 2, '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#0f172a' }, '& label': { color: '#64748b' }, '& fieldset': { borderColor: '#334155' } }} />
          <TextField fullWidth multiline rows={4} label="Body" value={editBody} onChange={(e) => setEditBody(e.target.value)}
            sx={{ '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#0f172a' }, '& label': { color: '#64748b' }, '& fieldset': { borderColor: '#334155' } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={editSubmitting || !editTitle.trim()}
            sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' }, textTransform: 'none' }}>
            {editSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
};

export default AdminAnnouncementsPage;
