// src/pages/admin/AdminUsersPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, Skeleton,
  Alert, alpha, InputAdornment, Paper, Select, MenuItem, FormControl, InputLabel,
  Snackbar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BanIcon,
  CheckCircle as UnbanIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  getAdminUsers, deleteAdminUser, toggleUserActive, createAdminUser,
  editAdminUser, resetAdminUserPassword, downloadExport, AdminUser,
} from '../../api/admin';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Create form
  const [cEmail, setCEmail] = useState('');
  const [cUsername, setCUsername] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cFirst, setCFirst] = useState('');
  const [cLast, setCLast] = useState('');
  const [cRole, setCRole] = useState('student');
  const [cSubmitting, setCSubmitting] = useState(false);

  // Edit form
  const [eFirst, setEFirst] = useState('');
  const [eLast, setELast] = useState('');
  const [eRole, setERole] = useState('student');
  const [eActive, setEActive] = useState(true);
  const [eSubmitting, setESubmitting] = useState(false);

  // Reset password
  const [rpPassword, setRpPassword] = useState('');
  const [rpSubmitting, setRpSubmitting] = useState(false);

  const fetchUsers = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUsers(query);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search || undefined), 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setActionLoading(deleteDialog.id);
    try {
      await deleteAdminUser(deleteDialog.id);
      setDeleteDialog(null);
      setSnackbar('User deleted permanently.');
      await fetchUsers(search || undefined);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user.');
    } finally { setActionLoading(null); }
  };

  const handleToggleBan = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      await toggleUserActive(user.id, !user.is_active);
      setSnackbar(user.is_active ? 'User banned.' : 'User unbanned.');
      await fetchUsers(search || undefined);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status.');
    } finally { setActionLoading(null); }
  };

  const handleCreate = async () => {
    setCSubmitting(true);
    try {
      await createAdminUser({ email: cEmail, username: cUsername, password: cPassword, first_name: cFirst, last_name: cLast, role: cRole });
      setCreateOpen(false);
      setCEmail(''); setCUsername(''); setCPassword(''); setCFirst(''); setCLast(''); setCRole('student');
      setSnackbar('User created successfully.');
      await fetchUsers(search || undefined);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user.');
    } finally { setCSubmitting(false); }
  };

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setEFirst(u.first_name);
    setELast(u.last_name);
    setERole(u.is_staff ? 'admin' : u.is_teacher ? 'teacher' : 'student');
    setEActive(u.is_active);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setESubmitting(true);
    try {
      await editAdminUser(editTarget.id, { first_name: eFirst, last_name: eLast, role: eRole, is_active: eActive });
      setEditTarget(null);
      setSnackbar('User updated.');
      await fetchUsers(search || undefined);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user.');
    } finally { setESubmitting(false); }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setRpSubmitting(true);
    try {
      await resetAdminUserPassword(resetTarget.id, rpPassword);
      setResetTarget(null); setRpPassword('');
      setSnackbar('Password reset successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally { setRpSubmitting(false); }
  };

  const getRoleChip = (user: AdminUser) => {
    if (user.is_staff) return <Chip label="Admin" size="small" sx={{ bgcolor: alpha('#a78bfa', 0.2), color: '#a78bfa', fontWeight: 600, fontSize: '0.7rem' }} />;
    if (user.is_teacher) return <Chip label="Teacher" size="small" sx={{ bgcolor: alpha('#2dd4bf', 0.2), color: '#2dd4bf', fontWeight: 600, fontSize: '0.7rem' }} />;
    return <Chip label="Student" size="small" sx={{ bgcolor: alpha('#60a5fa', 0.2), color: '#60a5fa', fontWeight: 600, fontSize: '0.7rem' }} />;
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const cellSx = { color: '#cbd5e1', borderColor: '#1e293b', py: 1.5 };
  const headerSx = { color: '#64748b', borderColor: '#1e293b', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' as const };
  const dialogPaper = { bgcolor: '#1e293b', color: '#e2e8f0', borderRadius: 3, border: '1px solid #334155' };
  const fieldSx = { '& .MuiInputBase-root': { bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 2 }, '& fieldset': { borderColor: '#334155' }, '& .MuiInputLabel-root': { color: '#64748b' } };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600 }}>User Management</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Create, edit roles, reset passwords, and manage all platform users.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<DownloadIcon />} size="small" onClick={() => downloadExport('users')}
            sx={{ color: '#94a3b8', borderColor: '#334155', textTransform: 'none' }} variant="outlined">
            Export CSV
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setCreateOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', borderRadius: 2 }}>
            Create User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, mt: 2, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      <TextField placeholder="Search by name, email, or username..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }} /></InputAdornment> }}
        sx={{ my: 2.5, '& .MuiOutlinedInput-root': { bgcolor: '#1e293b', borderRadius: 2, color: '#e2e8f0', '& fieldset': { borderColor: '#334155' } } }}
      />

      <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>Email</TableCell>
              <TableCell sx={headerSx}>Full Name</TableCell>
              <TableCell sx={headerSx}>Role</TableCell>
              <TableCell sx={headerSx}>Status</TableCell>
              <TableCell sx={headerSx}>Joined</TableCell>
              <TableCell sx={headerSx} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j} sx={cellSx}><Skeleton variant="text" sx={{ bgcolor: '#334155' }} width={j === 0 ? 180 : 100} /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ ...cellSx, textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: '#475569' }}>No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: alpha('#818cf8', 0.03) }, transition: 'background-color 0.15s ease' }}>
                  <TableCell sx={cellSx}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>@{user.username}</Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>{`${user.first_name} ${user.last_name}`.trim() || '—'}</TableCell>
                  <TableCell sx={cellSx}>{getRoleChip(user)}</TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={user.is_active ? 'Active' : 'Banned'} size="small"
                      sx={{ bgcolor: user.is_active ? alpha('#22c55e', 0.15) : alpha('#ef4444', 0.15), color: user.is_active ? '#4ade80' : '#f87171', fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell sx={cellSx}>{formatDate(user.date_joined)}</TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Tooltip title="Edit User"><IconButton size="small" onClick={() => openEdit(user)} disabled={user.is_staff && user.id === users[0]?.id} sx={{ color: '#818cf8', mr: 0.5 }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Reset Password"><IconButton size="small" onClick={() => setResetTarget(user)} sx={{ color: '#fbbf24', mr: 0.5 }}><KeyIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title={user.is_active ? 'Ban User' : 'Unban User'}>
                      <IconButton size="small" onClick={() => handleToggleBan(user)} disabled={actionLoading === user.id || user.is_staff} sx={{ color: user.is_active ? '#f59e0b' : '#22c55e', mr: 0.5 }}>
                        {user.is_active ? <BanIcon fontSize="small" /> : <UnbanIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton size="small" onClick={() => setDeleteDialog(user)} disabled={actionLoading === user.id || user.is_staff} sx={{ color: '#ef4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Create User Dialog ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="First Name" value={cFirst} onChange={(e) => setCFirst(e.target.value)} fullWidth size="small" sx={fieldSx} />
            <TextField label="Last Name" value={cLast} onChange={(e) => setCLast(e.target.value)} fullWidth size="small" sx={fieldSx} />
          </Box>
          <TextField label="Email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} fullWidth size="small" sx={fieldSx} />
          <TextField label="Username" value={cUsername} onChange={(e) => setCUsername(e.target.value)} fullWidth size="small" sx={fieldSx} />
          <TextField label="Password" type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} fullWidth size="small" sx={fieldSx} />
          <FormControl size="small" sx={fieldSx}>
            <InputLabel>Role</InputLabel>
            <Select value={cRole} label="Role" onChange={(e) => setCRole(e.target.value)}>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={cSubmitting || !cEmail || !cUsername || !cPassword}
            sx={{ textTransform: 'none', fontWeight: 600, background: 'linear-gradient(90deg, #818cf8, #a78bfa)' }}>
            {cSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit User — {editTarget?.email}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="First Name" value={eFirst} onChange={(e) => setEFirst(e.target.value)} fullWidth size="small" sx={fieldSx} />
            <TextField label="Last Name" value={eLast} onChange={(e) => setELast(e.target.value)} fullWidth size="small" sx={fieldSx} />
          </Box>
          <FormControl size="small" sx={fieldSx}>
            <InputLabel>Role</InputLabel>
            <Select value={eRole} label="Role" onChange={(e) => setERole(e.target.value)}>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={fieldSx}>
            <InputLabel>Status</InputLabel>
            <Select value={eActive ? 'active' : 'banned'} label="Status" onChange={(e) => setEActive(e.target.value === 'active')}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="banned">Banned</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={eSubmitting}
            sx={{ textTransform: 'none', fontWeight: 600, background: 'linear-gradient(90deg, #818cf8, #a78bfa)' }}>
            {eSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reset Password Dialog ── */}
      <Dialog open={!!resetTarget} onClose={() => { setResetTarget(null); setRpPassword(''); }} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon sx={{ color: '#fbbf24' }} /> Reset Password
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8', mb: 2 }}>
            Set a new password for <strong style={{ color: '#e2e8f0' }}>{resetTarget?.email}</strong>.
          </DialogContentText>
          <TextField label="New Password" type="password" value={rpPassword} onChange={(e) => setRpPassword(e.target.value)}
            fullWidth size="small" sx={fieldSx} autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setResetTarget(null); setRpPassword(''); }} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={rpSubmitting || rpPassword.length < 3}
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#fbbf24', color: '#0f172a', '&:hover': { bgcolor: '#f59e0b' } }}>
            {rpSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete User?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8' }}>
            Are you sure you want to permanently delete <strong style={{ color: '#e2e8f0' }}>{deleteDialog?.email}</strong>?
            This action cannot be undone and all their data will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" disabled={actionLoading === deleteDialog?.id}
            sx={{ bgcolor: '#ef4444', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#dc2626' } }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
};

export default AdminUsersPage;
