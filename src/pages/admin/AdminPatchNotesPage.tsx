// src/pages/admin/AdminPatchNotesPage.tsx
import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Skeleton, Alert, alpha, IconButton, Snackbar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  NewReleases as ReleaseIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { resolveBaseUrl } from '../../api/axios';

const api = axios.create({ baseURL: resolveBaseUrl('/api/admin'), headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

interface PatchNote {
  id: number;
  version: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface DownloadLink {
  id: number;
  platform: string;
  url: string;
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

const AdminPatchNotesPage = () => {
  // Patch Notes state
  const [notes, setNotes] = useState<PatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<PatchNote | null>(null);
  const [editVersion, setEditVersion] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Download Links state
  const [links, setLinks] = useState<DownloadLink[]>([]);
  const [winUrl, setWinUrl] = useState('');
  const [macUrl, setMacUrl] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patchnotes/');
      setNotes(res.data);
    } catch {
      setError('Failed to load patch notes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await api.get('/download-links/');
      setLinks(res.data);
      const win = res.data.find((l: DownloadLink) => l.platform === 'windows');
      const mac = res.data.find((l: DownloadLink) => l.platform === 'macos');
      if (win) setWinUrl(win.url);
      if (mac) setMacUrl(mac.url);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchNotes(); fetchLinks(); }, []);

  const handleCreate = async () => {
    if (!version.trim() || !title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/patchnotes/', { version, title, body });
      setDialogOpen(false);
      setVersion(''); setTitle(''); setBody('');
      setSnackbar('Patch note created!');
      fetchNotes();
    } catch {
      setSnackbar('Failed to create patch note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      await api.patch(`/patchnotes/${editTarget.id}/`, {
        version: editVersion,
        title: editTitle,
        body: editBody,
      });
      setEditTarget(null);
      setSnackbar('Patch note updated!');
      fetchNotes();
    } catch {
      setSnackbar('Failed to update patch note.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this patch note?')) return;
    try {
      await api.delete(`/patchnotes/${id}/`);
      setSnackbar('Patch note deleted.');
      fetchNotes();
    } catch {
      setSnackbar('Failed to delete patch note.');
    }
  };

  const handleSaveLink = async (platform: string) => {
    const url = platform === 'windows' ? winUrl : macUrl;
    if (!url.trim()) return;
    setLinkSaving(true);
    try {
      await api.post('/download-links/', { platform, url });
      setSnackbar(`${platform === 'windows' ? 'Windows' : 'macOS'} download link saved!`);
      fetchLinks();
    } catch {
      setSnackbar('Failed to save download link.');
    } finally {
      setLinkSaving(false);
    }
  };

  return (
    <Box>
      {/* ─── Download Links Section ─── */}
      <Typography variant="h6" sx={{ color: 'var(--mui-palette-text-primary)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon /> Download Links
      </Typography>
      <Paper sx={{ bgcolor: 'var(--mui-palette-background-paper)', p: 3, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label="Windows" size="small" sx={{ bgcolor: '#00a4ef', color: "text.primary", fontWeight: 'bold' }} />
            <TextField
              value={winUrl}
              onChange={(e) => setWinUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              size="small"
              fullWidth
              sx={{ flex: 1, minWidth: 300, input: { color: 'var(--mui-palette-text-primary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }}
            />
            <Button variant="contained" size="small" disabled={linkSaving} onClick={() => handleSaveLink('windows')}
              sx={{ bgcolor: '#256d4f', '&:hover': { bgcolor: '#174834' } }}>
              Save
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label="macOS" size="small" sx={{ bgcolor: '#a0aec0', color: 'var(--mui-palette-background-default)', fontWeight: 'bold' }} />
            <TextField
              value={macUrl}
              onChange={(e) => setMacUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              size="small"
              fullWidth
              sx={{ flex: 1, minWidth: 300, input: { color: 'var(--mui-palette-text-primary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }}
            />
            <Button variant="contained" size="small" disabled={linkSaving} onClick={() => handleSaveLink('macos')}
              sx={{ bgcolor: '#256d4f', '&:hover': { bgcolor: '#174834' } }}>
              Save
            </Button>
          </Box>
        </Box>
        {links.length > 0 && (
          <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', mt: 1, display: 'block' }}>
            Last updated: {timeAgo(links[0].updated_at)}
          </Typography>
        )}
      </Paper>

      {/* ─── Patch Notes Section ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'var(--mui-palette-text-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReleaseIcon /> Patch Notes
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#256d4f', '&:hover': { bgcolor: '#174834' } }}>
          New Patch Note
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ bgcolor: 'var(--mui-palette-background-paper)' }} />)}
        </Box>
      ) : notes.length === 0 ? (
        <Paper sx={{ bgcolor: 'var(--mui-palette-background-paper)', p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography sx={{ color: 'var(--mui-palette-text-secondary)' }}>No patch notes yet. Click "New Patch Note" to create one.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notes.map(note => (
            <Paper key={note.id} sx={{ bgcolor: 'var(--mui-palette-background-paper)', p: 3, borderRadius: 3, position: 'relative', borderLeft: '4px solid #256d4f' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Chip label={`v${note.version}`} size="small" sx={{ bgcolor: alpha('#256d4f', 0.2), color: '#256d4f', fontWeight: 'bold', mr: 1 }} />
                  <Typography component="span" sx={{ color: 'var(--mui-palette-text-primary)', fontWeight: 600 }}>{note.title}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => { setEditTarget(note); setEditVersion(note.version); setEditTitle(note.title); setEditBody(note.body); }}
                    sx={{ color: 'var(--mui-palette-text-secondary)', '&:hover': { color: '#256d4f' } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(note.id)}
                    sx={{ color: 'var(--mui-palette-text-secondary)', '&:hover': { color: '#ef4444' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--mui-palette-text-secondary)', whiteSpace: 'pre-wrap', mb: 1 }}>{note.body}</Typography>
              <Typography variant="caption" sx={{ color: '#475569' }}>{timeAgo(note.created_at)}</Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)' } }}>
        <DialogTitle>New Patch Note</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="Version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" size="small"
            sx={{ input: { color: 'var(--mui-palette-text-primary)' }, label: { color: 'var(--mui-palette-text-secondary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }} />
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Initial Release" size="small"
            sx={{ input: { color: 'var(--mui-palette-text-primary)' }, label: { color: 'var(--mui-palette-text-secondary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }} />
          <TextField label="Body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="- Added feature X..." multiline rows={6}
            sx={{ textarea: { color: 'var(--mui-palette-text-primary)' }, label: { color: 'var(--mui-palette-text-secondary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'var(--mui-palette-text-secondary)' }}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting} variant="contained" sx={{ bgcolor: '#256d4f' }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)' } }}>
        <DialogTitle>Edit Patch Note</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="Version" value={editVersion} onChange={(e) => setEditVersion(e.target.value)} size="small"
            sx={{ input: { color: 'var(--mui-palette-text-primary)' }, label: { color: 'var(--mui-palette-text-secondary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }} />
          <TextField label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} size="small"
            sx={{ input: { color: 'var(--mui-palette-text-primary)' }, label: { color: 'var(--mui-palette-text-secondary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }} />
          <TextField label="Body" value={editBody} onChange={(e) => setEditBody(e.target.value)} multiline rows={6}
            sx={{ textarea: { color: 'var(--mui-palette-text-primary)' }, label: { color: 'var(--mui-palette-text-secondary)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--mui-palette-divider)' } } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} sx={{ color: 'var(--mui-palette-text-secondary)' }}>Cancel</Button>
          <Button onClick={handleEdit} disabled={editSubmitting} variant="contained" sx={{ bgcolor: '#256d4f' }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
};

export default AdminPatchNotesPage;
