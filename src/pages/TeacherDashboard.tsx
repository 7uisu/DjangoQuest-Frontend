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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  styled,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  ContentCopy as CopyIcon,
  ArrowBack as BackIcon,
  LockReset as ResetIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonRemove as KickIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getClassroomDetail,
  resetStudentPassword,
  removeStudent,
  ClassroomData,
  ClassroomDetailData,
} from '../api/dashboard';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
}));

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // State
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomDetailData | null>(null);
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

  // Password reset
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: number; username: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  // Remove Student
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; username: string } | null>(null);
  const [removing, setRemoving] = useState(false);

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

  const handleViewClassroom = async (id: number) => {
    setError('');
    try {
      const data = await getClassroomDetail(id);
      setSelectedClassroom(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classroom details.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetting(true);
    setError('');
    try {
      const result = await resetStudentPassword(resetTarget.id);
      setResetDialogOpen(false);
      setSuccess(`Password for ${resetTarget.username} reset to: ${result.new_password}`);
      setResetTarget(null);
      setTimeout(() => setSuccess(''), 8000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
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

  const handleRemoveStudent = async () => {
    if (!removeTarget || !selectedClassroom) return;
    setRemoving(true);
    setError('');
    try {
      const result = await removeStudent(selectedClassroom.id, removeTarget.id);
      setRemoveDialogOpen(false);
      setSuccess(result.detail);
      setRemoveTarget(null);
      // Refresh classroom details
      await handleViewClassroom(selectedClassroom.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove student.');
    } finally {
      setRemoving(false);
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
              {selectedClassroom && (
                <Button startIcon={<BackIcon />} onClick={() => setSelectedClassroom(null)} sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1 }}>
                  Back to Classrooms
                </Button>
              )}
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 40, verticalAlign: 'middle' }} />
                {selectedClassroom ? selectedClassroom.name : 'Teacher Dashboard'}
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                {selectedClassroom
                  ? `Enrollment Code: ${selectedClassroom.enrollment_code}`
                  : `Welcome, ${user?.first_name || user?.username}! Manage your classrooms below.`}
              </Typography>
            </Box>
            {!selectedClassroom && (
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
            )}
          </Box>
        </Fade>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Classroom List View */}
        {!selectedClassroom && (
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
        )}

        {/* Classroom Detail View */}
        {selectedClassroom && (
          <Fade in timeout={500}>
            <GradientPaper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Enrolled Students ({selectedClassroom.students.length})
                </Typography>
                <Tooltip title="Copy enrollment code">
                  <Button
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(selectedClassroom.enrollment_code)}
                    sx={{ color: alpha(theme.palette.common.white, 0.8), textTransform: 'none' }}
                  >
                    {selectedClassroom.enrollment_code}
                  </Button>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.common.white, 0.15) }} />
              {selectedClassroom.students.length === 0 ? (
                <Typography sx={{ color: alpha(theme.palette.common.white, 0.6), py: 4, textAlign: 'center' }}>
                  No students enrolled yet. Share the enrollment code with your students!
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Username</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Story Progress</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Challenges</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Learning</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Ch1 Quiz</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Email</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Joined</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClassroom.students.map((student) => (
                        <TableRow key={student.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                          <TableCell sx={{ color: '#fff', borderColor: alpha(theme.palette.common.white, 0.1) }}>{student.username}</TableCell>
                          <TableCell sx={{ borderColor: alpha(theme.palette.common.white, 0.1), minWidth: 150 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={student.story_progress ?? 0}
                                sx={{
                                  flex: 1,
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.common.white, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.8), minWidth: 36, textAlign: 'right' }}>
                                {(student.story_progress ?? 0).toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            <Chip label={student.challenges_completed ?? 0} size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.light, fontWeight: 'bold' }} />
                          </TableCell>
                          <TableCell align="center" sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            <Chip label={`${student.learning_modules_completed ?? 0} / 7`} size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.light, fontWeight: 'bold' }} />
                          </TableCell>
                          <TableCell align="center" sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Chip
                                label={`${student.ch1_quiz_score ?? 0} / 5`}
                                size="small"
                                sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.light, fontWeight: 'bold' }}
                              />
                              {student.ch1_did_remedial && (
                                <Chip
                                  label={`Remedial: ${student.ch1_remedial_score ?? 0} / 5`}
                                  size="small"
                                  sx={{ bgcolor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.light, fontWeight: 'bold', fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: alpha(theme.palette.common.white, 0.8), borderColor: alpha(theme.palette.common.white, 0.1) }}>{student.email}</TableCell>
                          <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            {new Date(student.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            <Tooltip title="Reset password">
                              <IconButton
                                size="small"
                                onClick={() => { setResetTarget({ id: student.id, username: student.username }); setResetDialogOpen(true); }}
                                sx={{ color: theme.palette.warning.main }}
                              >
                                <ResetIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove student">
                              <IconButton
                                size="small"
                                onClick={() => { setRemoveTarget({ id: student.id, username: student.username }); setRemoveDialogOpen(true); }}
                                sx={{ color: theme.palette.error.main }}
                              >
                                <KickIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </GradientPaper>
          </Fade>
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

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
        <DialogTitle>Reset Student Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
            Are you sure you want to reset the password for <strong>{resetTarget?.username}</strong>? Their password will be set to the default: <code>DjangoQuest2026!</code>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} sx={{ color: '#fff' }} disabled={resetting}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="warning" disabled={resetting}>
            {resetting ? <CircularProgress size={24} /> : 'Reset Password'}
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
      
      {/* Remove Student Dialog */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)} PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
        <DialogTitle>Remove Student</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
            Are you sure you want to remove <strong>{removeTarget?.username}</strong> from this classroom?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)} sx={{ color: '#fff' }} disabled={removing}>Cancel</Button>
          <Button onClick={handleRemoveStudent} variant="contained" color="error" disabled={removing}>
            {removing ? <CircularProgress size={24} /> : 'Remove Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherDashboard;
