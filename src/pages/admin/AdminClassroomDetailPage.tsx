// src/pages/admin/AdminClassroomDetailPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Skeleton, Alert, alpha, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, Snackbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Feedback as FeedbackIcon,
  Campaign as CampaignIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonRemove as RemoveIcon,
  PersonAdd as AddIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAdminClassroomDetail, editAdminClassroom, deleteAdminClassroom,
  enrollStudent, unenrollStudent, getAdminUsers,
} from '../../api/admin';

interface TeacherOption { id: number; email: string; first_name: string; last_name: string; }
interface StudentRow { id: number; email: string; first_name: string; last_name: string; is_active: boolean; }
interface ClassroomDetail {
  id: number; name: string; enrollment_code: string;
  teacher: TeacherOption;
  students: StudentRow[];
  student_count: number; feedback_count: number; announcement_count: number;
  avg_classroom_rating: number | null;
  teachers: TeacherOption[];
}

const AdminClassroomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [eName, setEName] = useState('');
  const [eTeacherId, setETeacherId] = useState<number>(0);
  const [eSubmitting, setESubmitting] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Enroll dialog
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollResults, setEnrollResults] = useState<any[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Unenroll dialog
  const [unenrollTarget, setUnenrollTarget] = useState<StudentRow | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      const detail = await getAdminClassroomDetail(Number(id));
      setData(detail);
    } catch {
      setError('Failed to load classroom details.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openEdit = () => {
    if (!data) return;
    setEName(data.name);
    setETeacherId(data.teacher.id);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!data) return;
    setESubmitting(true);
    try {
      await editAdminClassroom(data.id, { name: eName, teacher_id: eTeacherId });
      setEditOpen(false);
      setSnackbar('Classroom updated.');
      setLoading(true);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update classroom.');
    } finally { setESubmitting(false); }
  };

  const handleDelete = async () => {
    if (!data) return;
    try {
      await deleteAdminClassroom(data.id);
      setSnackbar('Classroom deleted.');
      navigate('/admin-dashboard/classrooms');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete classroom.');
    }
  };

  const handleEnrollSearch = async () => {
    setEnrollLoading(true);
    try {
      const users = await getAdminUsers(enrollSearch);
      // Filter to students not already in this classroom
      const existing = new Set(data?.students.map(s => s.id) || []);
      setEnrollResults(users.filter(u => u.is_student && !existing.has(u.id)));
    } catch { setEnrollResults([]); }
    finally { setEnrollLoading(false); }
  };

  const handleEnroll = async (userId: number) => {
    if (!data) return;
    try {
      await enrollStudent(data.id, userId);
      setSnackbar('Student enrolled.');
      setEnrollOpen(false);
      setEnrollSearch('');
      setEnrollResults([]);
      setLoading(true);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to enroll student.');
    }
  };

  const handleUnenroll = async () => {
    if (!data || !unenrollTarget) return;
    try {
      await unenrollStudent(data.id, unenrollTarget.id);
      setUnenrollTarget(null);
      setSnackbar('Student removed.');
      setLoading(true);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove student.');
    }
  };

  if (loading) {
    return (<Box>
      <Skeleton variant="text" width={300} height={40} sx={{ bgcolor: '#334155' }} />
      <Skeleton variant="rectangular" height={200} sx={{ bgcolor: '#334155', mt: 2, borderRadius: 2 }} />
    </Box>);
  }

  if (error || !data) {
    return (<Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/admin-dashboard/classrooms')} sx={{ color: '#94a3b8', mb: 2, textTransform: 'none' }}>Back</Button>
      <Alert severity="error" sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>{error || 'Not found.'}</Alert>
    </Box>);
  }

  const stats = [
    { label: 'Students', value: data.student_count, icon: <GroupIcon />, color: '#2dd4bf' },
    { label: 'Feedback', value: data.feedback_count, icon: <FeedbackIcon />, color: '#f97316' },
    { label: 'Announcements', value: data.announcement_count, icon: <CampaignIcon />, color: '#a78bfa' },
    { label: 'Avg Rating', value: data.avg_classroom_rating ? `${data.avg_classroom_rating} ★` : 'N/A', icon: <StarIcon />, color: '#fbbf24' },
  ];

  const dialogPaper = { bgcolor: '#1e293b', color: '#e2e8f0', borderRadius: 3, border: '1px solid #334155' };
  const fieldSx = { '& .MuiInputBase-root': { bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 2 }, '& fieldset': { borderColor: '#334155' }, '& .MuiInputLabel-root': { color: '#64748b' } };

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/admin-dashboard/classrooms')} sx={{ color: '#94a3b8', mb: 2, textTransform: 'none' }}>Back to Classrooms</Button>

      {/* Header */}
      <Paper sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: alpha('#fbbf24', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SchoolIcon sx={{ color: '#fbbf24', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700 }}>{data.name}</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Teacher: {data.teacher.first_name} {data.teacher.last_name} ({data.teacher.email})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Code: {data.enrollment_code}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<EditIcon />} onClick={openEdit} variant="outlined"
              sx={{ color: '#818cf8', borderColor: '#334155', textTransform: 'none' }}>Edit</Button>
            <Button size="small" startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} variant="outlined"
              sx={{ color: '#ef4444', borderColor: '#334155', textTransform: 'none' }}>Delete</Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <Paper key={s.label} sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155', textAlign: 'center' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(s.color, 0.15), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: s.color, mb: 1 }}>{s.icon}</Box>
            <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 700 }}>{s.value}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Students Roster */}
      <Paper sx={{ bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Student Roster</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setEnrollOpen(true)}
            sx={{ textTransform: 'none', color: '#2dd4bf', borderColor: '#334155' }} variant="outlined">Add Student</Button>
        </Box>
        {data.students.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 48, color: '#334155', mb: 1 }} />
            <Typography sx={{ color: '#475569' }}>No students enrolled yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#64748b', borderBottom: '1px solid #334155', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: '#64748b', borderBottom: '1px solid #334155', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: '#64748b', borderBottom: '1px solid #334155', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#64748b', borderBottom: '1px solid #334155', fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.students.map((s) => (
                  <TableRow key={s.id} sx={{ '&:hover': { bgcolor: alpha('#818cf8', 0.05) } }}>
                    <TableCell sx={{ color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{s.first_name} {s.last_name}</TableCell>
                    <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>{s.email}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #1e293b' }}>
                      <Chip label={s.is_active ? 'Active' : 'Banned'} size="small"
                        sx={{ bgcolor: s.is_active ? alpha('#22c55e', 0.15) : alpha('#ef4444', 0.15), color: s.is_active ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #1e293b' }}>
                      <Tooltip title="Remove from classroom">
                        <IconButton size="small" onClick={() => setUnenrollTarget(s)} sx={{ color: '#ef4444' }}><RemoveIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Edit Classroom Dialog ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Classroom</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Classroom Name" value={eName} onChange={(e) => setEName(e.target.value)} fullWidth size="small" sx={fieldSx} />
          <FormControl size="small" sx={fieldSx}>
            <InputLabel>Assigned Teacher</InputLabel>
            <Select value={eTeacherId} label="Assigned Teacher" onChange={(e) => setETeacherId(Number(e.target.value))}>
              {data.teachers.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.email})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={eSubmitting || !eName}
            sx={{ textTransform: 'none', fontWeight: 600, background: 'linear-gradient(90deg, #818cf8, #a78bfa)' }}>
            {eSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Classroom Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600, color: '#ef4444' }}>Delete Classroom?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8' }}>
            This will permanently delete <strong style={{ color: '#e2e8f0' }}>{data.name}</strong> and unenroll all {data.student_count} students. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained"
            sx={{ bgcolor: '#ef4444', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#dc2626' } }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Enroll Student Dialog ── */}
      <Dialog open={enrollOpen} onClose={() => { setEnrollOpen(false); setEnrollSearch(''); setEnrollResults([]); }} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Student to Classroom</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField placeholder="Search student by name or email..." value={enrollSearch} onChange={(e) => setEnrollSearch(e.target.value)}
              fullWidth size="small" sx={fieldSx} onKeyDown={(e) => e.key === 'Enter' && handleEnrollSearch()} />
            <Button onClick={handleEnrollSearch} variant="contained" disabled={enrollLoading || !enrollSearch}
              sx={{ textTransform: 'none', bgcolor: '#818cf8', minWidth: 80 }}>Search</Button>
          </Box>
          {enrollResults.length > 0 && (
            <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              {enrollResults.map(u => (
                <Box key={u.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 1, borderBottom: '1px solid #334155', '&:hover': { bgcolor: alpha('#818cf8', 0.05) } }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{u.first_name} {u.last_name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{u.email}</Typography>
                  </Box>
                  <Button size="small" onClick={() => handleEnroll(u.id)} sx={{ color: '#2dd4bf', textTransform: 'none' }}>Enroll</Button>
                </Box>
              ))}
            </Box>
          )}
          {enrollResults.length === 0 && enrollSearch && !enrollLoading && (
            <Typography variant="body2" sx={{ color: '#475569', mt: 2, textAlign: 'center' }}>No students found.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Unenroll Student Dialog ── */}
      <Dialog open={!!unenrollTarget} onClose={() => setUnenrollTarget(null)} PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Remove Student?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8' }}>
            Remove <strong style={{ color: '#e2e8f0' }}>{unenrollTarget?.first_name} {unenrollTarget?.last_name}</strong> from this classroom?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUnenrollTarget(null)} sx={{ color: '#94a3b8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleUnenroll} variant="contained"
            sx={{ bgcolor: '#ef4444', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#dc2626' } }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
};

export default AdminClassroomDetailPage;
