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
} from '@mui/icons-material';
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

  // Fetch classrooms
  useEffect(() => {
    fetchClassrooms();
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

        {/* Classroom List View */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {classrooms.length === 0 ? (
              <Grow in timeout={600}>
                <GradientPaper sx={{ p: 4, gridColumn: '1 / -1', textAlign: 'center' }}>
                  <ClassIcon sx={{ fontSize: 60, color: alpha(theme.palette.common.white, 0.3), mb: 2 }} />
                  <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    No classrooms yet. Create your first one!
                  </Typography>
                </GradientPaper>
              </Grow>
            ) : (
              classrooms.map((classroom, idx) => (
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
      </Box>
  );
};

export default TeacherDashboard;
