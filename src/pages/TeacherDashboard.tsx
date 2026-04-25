import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Container,
  Fade,
  Grow,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  School as SchoolIcon,
  ContentCopy as CopyIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import {
  Snackbar, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import axios from 'axios';

// Announcements API helper
const announcementsApi = axios.create({ baseURL: '/api/announcements', headers: { 'Content-Type': 'application/json' } });
announcementsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Feedback API helper
const feedbackApi = axios.create({ baseURL: '/api/feedback', headers: { 'Content-Type': 'application/json' } });
feedbackApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

interface AnnouncementItem {
  id: number;
  title: string;
  body: string;
  announcement_type: string;
  target_classrooms: { id: number; name: string }[];
  created_at: string;
}
import { useAuth } from '../hooks/useAuth';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  ClassroomData,
} from '../api/dashboard';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
}));

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const navigate = useNavigate();

  // State
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create classroom
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit classroom
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete classroom
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [annEditId, setAnnEditId] = useState<number | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annSelectedClassrooms, setAnnSelectedClassrooms] = useState<number[]>([]);
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annDeleteId, setAnnDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [showAllTeacherAnn, setShowAllTeacherAnn] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState<number>(0);

  // Fetch classrooms + announcements
  useEffect(() => {
    fetchClassrooms();
    fetchAnnouncements();
    feedbackApi.get('/mine/').then(res => setFeedbackCount(res.data.count)).catch(() => {});
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClassrooms();
      setClassrooms(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementsApi.get('/');
      setAnnouncements(res.data.filter((a: AnnouncementItem) => a.announcement_type === 'classroom'));
    } catch { /* silent */ }
  };

  const handleAnnSubmit = async () => {
    if (!annTitle.trim() || !annBody.trim() || annSelectedClassrooms.length === 0) return;
    setAnnSubmitting(true);
    try {
      if (annEditId) {
        await announcementsApi.patch(`/${annEditId}/`, {
          title: annTitle.trim(), body: annBody.trim(),
          announcement_type: 'classroom', target_classrooms: annSelectedClassrooms,
        });
        setSnackbar('Announcement updated!');
      } else {
        await announcementsApi.post('/', {
          announcement_type: 'classroom', title: annTitle.trim(),
          body: annBody.trim(), target_classrooms: annSelectedClassrooms,
        });
        setSnackbar('Announcement published!');
      }
      setAnnDialogOpen(false); setAnnTitle(''); setAnnBody(''); setAnnSelectedClassrooms([]); setAnnEditId(null);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save announcement.');
    } finally { setAnnSubmitting(false); }
  };

  const handleAnnDelete = async () => {
    if (!annDeleteId) return;
    try {
      await announcementsApi.delete(`/${annDeleteId}/`);
      setSnackbar('Announcement deleted.');
      setAnnDeleteId(null);
      fetchAnnouncements();
    } catch { setError('Failed to delete announcement.'); }
  };

  const openAnnEdit = (a: AnnouncementItem) => {
    setAnnEditId(a.id); setAnnTitle(a.title); setAnnBody(a.body);
    setAnnSelectedClassrooms(a.target_classrooms.map(c => c.id));
    setAnnDialogOpen(true);
  };

  const handleCreateClassroom = async () => {
    if (!newClassName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await createClassroom(newClassName.trim());
      setCreateDialogOpen(false);
      setNewClassName('');
      setSuccess('Classroom created!');
      await fetchClassrooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create classroom.');
    } finally {
      setCreating(false);
    }
  };

  const handleViewClassroom = (id: number) => {
    navigate(`/teacher-dashboard/class/${id}`);
  };

  const handleEditClassroom = async () => {
    if (!editTargetId || !editClassName.trim()) return;
    setEditing(true);
    setError('');
    try {
      await updateClassroom(editTargetId, editClassName.trim());
      setEditDialogOpen(false);
      setEditTargetId(null);
      setSuccess('Classroom updated!');
      await fetchClassrooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update classroom.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError('');
    try {
      await deleteClassroom(deleteTargetId);
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      setSuccess('Classroom deleted!');
      await fetchClassrooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete classroom.');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Enrollment code copied!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)` }}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, pt: 10, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 40, verticalAlign: 'middle' }} />
                Teacher Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                Welcome, {user?.first_name || user?.username}! Manage your classrooms below.
              </Typography>
            </Box>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(0,0,0,0.3)' },
                  transition: 'all 0.2s ease',
                }}
              >
                Create Classroom
              </Button>
            </Box>
          </Fade>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Stats Banner */}
        {classrooms.length > 0 && (
          <Fade in timeout={600}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
              {[
                { label: 'Total Classrooms', value: classrooms.length, color: theme.palette.primary.main },
                { label: 'Total Students', value: classrooms.reduce((sum, c) => sum + c.student_count, 0), color: theme.palette.success.main },
                { label: 'Avg Class Size', value: (classrooms.reduce((sum, c) => sum + c.student_count, 0) / classrooms.length).toFixed(1), color: theme.palette.info.main },
                { label: 'Empty Classrooms', value: classrooms.filter(c => c.student_count === 0).length, color: theme.palette.warning.main },
              ].map((stat) => (
                <GradientPaper key={stat.label} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color }}>{stat.value}</Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>{stat.label}</Typography>
                </GradientPaper>
              ))}
            </Box>
          </Fade>
        )}

        {/* Search Bar */}
        <Fade in timeout={700}>
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search classrooms by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: alpha(theme.palette.common.white, 0.5), mr: 1 }} />,
                sx: { 
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                  color: '#fff',
                  borderRadius: 3,
                  '& fieldset': { borderColor: alpha(theme.palette.common.white, 0.2) },
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.light },
                }
              }}
            />
          </Box>
        </Fade>

        {/* Classroom List View */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {classrooms.length === 0 ? (
              <Grow in timeout={600}>
                <GradientPaper sx={{ p: 4, gridColumn: '1 / -1', textAlign: 'center' }}>
                  <ClassIcon sx={{ fontSize: 60, color: alpha(theme.palette.common.white, 0.3), mb: 2 }} />
                  <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    No classrooms found.
                  </Typography>
                </GradientPaper>
              </Grow>
            ) : (
              classrooms.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((classroom, idx) => (
                <Grow in timeout={600 + idx * 150} key={classroom.id}>
                  <Card sx={{
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.25)} 100%)`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.2)' },
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {classroom.name}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit Class">
                            <IconButton size="small" onClick={() => { setEditTargetId(classroom.id); setEditClassName(classroom.name); setEditDialogOpen(true); }} sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Class">
                            <IconButton size="small" onClick={() => { setDeleteTargetId(classroom.id); setDeleteDialogOpen(true); }} sx={{ color: theme.palette.error.main }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={classroom.enrollment_code}
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.3),
                            color: '#fff',
                          }}
                        />
                        <Tooltip title="Copy code">
                          <IconButton size="small" onClick={() => copyToClipboard(classroom.enrollment_code)} sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: alpha(theme.palette.common.white, 0.7) }}>
                        <GroupIcon fontSize="small" />
                        <Typography variant="body2">{classroom.student_count} student{classroom.student_count !== 1 ? 's' : ''}</Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewClassroom(classroom.id)}
                        sx={{ borderRadius: 2, color: '#fff', borderColor: alpha(theme.palette.common.white, 0.4), textTransform: 'none', '&:hover': { borderColor: '#fff' } }}
                      >
                        View Students
                      </Button>
                    </CardActions>
                  </Card>
                </Grow>
              ))
            )}
          </Box>
        </Container>

        {/* ── Announcements Section ── */}
        <Container maxWidth="lg" sx={{ mt: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignIcon sx={{ color: '#a78bfa', fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>Announcements</Typography>
              {announcements.length > 0 && (
                <Chip label={`${announcements.length} active`} size="small" sx={{ bgcolor: alpha('#a78bfa', 0.2), color: '#a78bfa', fontWeight: 600, fontSize: '0.7rem' }} />
              )}
            </Box>
            <Button
              variant="contained" startIcon={<AddIcon />}
              onClick={() => { setAnnEditId(null); setAnnTitle(''); setAnnBody(''); setAnnSelectedClassrooms([]); setAnnDialogOpen(true); }}
              disabled={classrooms.length === 0}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, background: `linear-gradient(90deg, #818cf8, #a78bfa)`, '&:hover': { transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              New Announcement
            </Button>
          </Box>

          {announcements.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.common.white, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
              <CampaignIcon sx={{ fontSize: 48, color: alpha(theme.palette.common.white, 0.2), mb: 1 }} />
              <Typography sx={{ color: alpha(theme.palette.common.white, 0.5) }}>No announcements yet. Create one to notify your students.</Typography>
            </Paper>
          ) : (
            <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(showAllTeacherAnn ? announcements : announcements.slice(0, 5)).map((a) => (
                <Grow in key={a.id} timeout={600}>
                  <Paper sx={{ p: 2.5, bgcolor: alpha(theme.palette.common.white, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, '&:hover': { borderColor: alpha('#a78bfa', 0.4) }, transition: 'all 0.2s' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                          {a.target_classrooms.map(c => (
                            <Chip key={c.id} label={c.name} size="small" sx={{ bgcolor: alpha('#2dd4bf', 0.15), color: '#2dd4bf', fontWeight: 600, fontSize: '0.7rem' }} />
                          ))}
                          <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.4) }}>
                            {new Date(a.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>{a.title}</Typography>
                        <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7), mt: 0.5 }}>{a.body}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openAnnEdit(a)} sx={{ color: alpha(theme.palette.common.white, 0.5), '&:hover': { color: '#818cf8' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setAnnDeleteId(a.id)} sx={{ color: alpha(theme.palette.common.white, 0.5), '&:hover': { color: '#ef4444' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                </Grow>
              ))}
            </Box>
            {announcements.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button onClick={() => setShowAllTeacherAnn(!showAllTeacherAnn)} sx={{ color: '#a78bfa', textTransform: 'none' }}>
                  {showAllTeacherAnn ? 'Show less' : `View all ${announcements.length} announcements`}
                </Button>
              </Box>
            )}
            </>
          )}
        </Container>

        {/* Create Classroom Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
          <DialogTitle>Create New Classroom</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 2 }}>
              Enter a name for your classroom. An enrollment code will be generated automatically.
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              label="Classroom Name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. CS101 — Intro to Programming"
              disabled={creating}
              sx={{ '& .MuiInputBase-root': { bgcolor: theme.palette.grey[700], color: '#fff' }, '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#fff' }} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreateClassroom} variant="contained" disabled={creating || !newClassName.trim()}>
              {creating ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Classroom Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
          <DialogTitle>Rename Classroom</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Classroom Name"
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
              disabled={editing}
              sx={{ '& .MuiInputBase-root': { bgcolor: theme.palette.grey[700], color: '#fff', mt: 1 }, '& .MuiInputLabel-root': { color: alpha(theme.palette.common.white, 0.7) } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} sx={{ color: '#fff' }} disabled={editing}>Cancel</Button>
            <Button onClick={handleEditClassroom} variant="contained" disabled={editing || !editClassName.trim()}>
              {editing ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Classroom Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
          <DialogTitle>Delete Classroom</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
              Are you sure you want to delete this classroom? This action cannot be undone. Enrolled students will automatically be unenrolled.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#fff' }} disabled={deleting}>Cancel</Button>
            <Button onClick={handleDeleteClassroom} variant="contained" color="error" disabled={deleting}>
              {deleting ? <CircularProgress size={24} /> : 'Delete Classroom'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Announcement Create/Edit Dialog */}
        <Dialog open={annDialogOpen} onClose={() => setAnnDialogOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}
        >
          <DialogTitle>{annEditId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus fullWidth label="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
              sx={{ mt: 1, mb: 2, '& .MuiInputBase-root': { color: '#fff', bgcolor: theme.palette.grey[700] }, '& label': { color: alpha(theme.palette.common.white, 0.7) } }}
            />
            <TextField
              fullWidth multiline rows={3} label="Body" value={annBody} onChange={(e) => setAnnBody(e.target.value)}
              sx={{ mb: 2, '& .MuiInputBase-root': { color: '#fff', bgcolor: theme.palette.grey[700] }, '& label': { color: alpha(theme.palette.common.white, 0.7) } }}
            />
            <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1 }}>Target Classrooms</Typography>
            <FormGroup>
              {classrooms.map((c) => (
                <FormControlLabel
                  key={c.id}
                  control={
                    <Checkbox
                      checked={annSelectedClassrooms.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setAnnSelectedClassrooms((prev) => [...prev, c.id]);
                        else setAnnSelectedClassrooms((prev) => prev.filter((id) => id !== c.id));
                      }}
                      sx={{ color: '#64748b', '&.Mui-checked': { color: '#818cf8' } }}
                    />
                  }
                  label={c.name}
                  sx={{ color: '#fff' }}
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAnnDialogOpen(false)} sx={{ color: '#fff' }}>Cancel</Button>
            <Button onClick={handleAnnSubmit} variant="contained" disabled={annSubmitting || !annTitle.trim() || !annBody.trim() || annSelectedClassrooms.length === 0}
              sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}
            >
              {annSubmitting ? <CircularProgress size={24} /> : annEditId ? 'Save' : 'Publish'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Announcement Delete Dialog */}
        <Dialog open={!!annDeleteId} onClose={() => setAnnDeleteId(null)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
          <DialogTitle>Delete Announcement</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.7) }}>Delete this announcement? Students will no longer see it.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAnnDeleteId(null)} sx={{ color: '#fff' }}>Cancel</Button>
            <Button onClick={handleAnnDelete} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Give Feedback CTA */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            href="/feedback"
            startIcon={<span role="img" aria-label="feedback">💬</span>}
            sx={{
              color: alpha(theme.palette.common.white, 0.7),
              borderColor: alpha(theme.palette.common.white, 0.2),
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                borderColor: alpha(theme.palette.common.white, 0.4),
                bgcolor: alpha(theme.palette.common.white, 0.05),
              },
            }}
          >
            Give Feedback
            {feedbackCount > 0 && (
              <Chip label={feedbackCount} size="small" sx={{ ml: 1, bgcolor: alpha(theme.palette.common.white, 0.15), color: '#fff', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
            )}
          </Button>
        </Box>

        <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
      </Box>
  );
};

export default TeacherDashboard;
