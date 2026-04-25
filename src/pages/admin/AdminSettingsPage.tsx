// src/pages/admin/AdminSettingsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, IconButton, Chip, Alert,
  alpha, Snackbar, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  VpnKey as KeyIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import axios from 'axios';

const api = axios.create({ baseURL: '/api/admin', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

interface InviteCode {
  id: number;
  code: string;
  is_active: boolean;
  created_at: string;
}

const AdminSettingsPage: React.FC = () => {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<InviteCode | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invite-codes/');
      setCodes(res.data);
    } catch {
      setError('Failed to load invite codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async () => {
    if (!newCode.trim()) return;
    setCreating(true);
    try {
      await api.post('/invite-codes/', { code: newCode.trim() });
      setCreateOpen(false);
      setNewCode('');
      setSnackbar('Invite code created!');
      fetchCodes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create code.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (code: InviteCode) => {
    try {
      await api.patch('/invite-codes/', { id: code.id, is_active: !code.is_active });
      setSnackbar(`Code ${!code.is_active ? 'activated' : 'deactivated'}.`);
      fetchCodes();
    } catch {
      setError('Failed to update code.');
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !editCode.trim()) return;
    setEditing(true);
    try {
      await api.patch('/invite-codes/', { id: editTarget.id, code: editCode.trim() });
      setEditTarget(null);
      setSnackbar('Invite code updated!');
      fetchCodes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update code.');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/invite-codes/?id=${id}`);
      setSnackbar('Invite code deleted.');
      fetchCodes();
    } catch {
      setError('Failed to delete code.');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbar('Code copied to clipboard!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Settings</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Manage teacher registration invite codes.</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      {/* Invite Codes Section */}
      <Paper sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <KeyIcon sx={{ color: '#818cf8', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Teacher Invite Codes</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Teachers must enter one of these codes when registering on the public signup page.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
            sx={{ bgcolor: '#818cf8', textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#6366f1' } }}
          >
            Add Code
          </Button>
        </Box>

        {loading ? (
          <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>Loading...</Typography>
        ) : codes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <KeyIcon sx={{ fontSize: 48, color: '#334155', mb: 1 }} />
            <Typography sx={{ color: '#475569' }}>No invite codes yet. Create one to allow teachers to register.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {codes.map((c) => (
              <Paper
                key={c.id}
                sx={{
                  p: 2, bgcolor: '#0f172a', borderRadius: 2,
                  border: `1px solid ${c.is_active ? alpha('#818cf8', 0.3) : '#334155'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: c.is_active ? '#e2e8f0' : '#475569',
                      fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2,
                      textDecoration: c.is_active ? 'none' : 'line-through',
                    }}
                  >
                    {c.code}
                  </Typography>
                  <Chip
                    label={c.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      bgcolor: c.is_active ? alpha('#22c55e', 0.2) : alpha('#ef4444', 0.2),
                      color: c.is_active ? '#22c55e' : '#ef4444',
                      fontWeight: 600, fontSize: '0.7rem',
                    }}
                  />
                  <IconButton onClick={() => copyToClipboard(c.code)} size="small"
                    sx={{ color: '#64748b', '&:hover': { color: '#818cf8' } }}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={c.is_active}
                    onChange={() => handleToggleActive(c)}
                    size="small"
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#818cf8' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#818cf8' } }}
                  />
                  <IconButton onClick={() => { setEditTarget(c); setEditCode(c.code); }} size="small"
                    sx={{ color: '#64748b', '&:hover': { color: '#818cf8', bgcolor: alpha('#818cf8', 0.1) } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(c.id)} size="small"
                    sx={{ color: '#64748b', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Create Invite Code</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
            Enter a code that teachers will use during registration. It will be automatically converted to uppercase.
          </Typography>
          <TextField
            autoFocus fullWidth label="Invite Code" value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="e.g. CAPSTONE-2026"
            sx={{ '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#0f172a', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 }, '& label': { color: '#64748b' }, '& fieldset': { borderColor: '#334155' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating || !newCode.trim()}
            sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' }, textTransform: 'none' }}>
            {creating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Invite Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Invite Code" value={editCode}
            onChange={(e) => setEditCode(e.target.value.toUpperCase())}
            sx={{ mt: 1, '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#0f172a', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 }, '& label': { color: '#64748b' }, '& fieldset': { borderColor: '#334155' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={editing || !editCode.trim()}
            sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' }, textTransform: 'none' }}>
            {editing ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
};

export default AdminSettingsPage;
