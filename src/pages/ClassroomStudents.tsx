import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ContentCopy as CopyIcon,
  ArrowBack as BackIcon,
  LockReset as ResetIcon,
  Group as GroupIcon,
  PersonRemove as KickIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  getClassroomDetail,
  resetStudentPassword,
  removeStudent,
  ClassroomDetailData,
} from '../api/dashboard';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
}));

const ClassroomStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  // State
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password reset
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: number; username: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  // Remove Student
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; username: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  // Detailed Grades and Search
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      handleViewClassroom(parseInt(id));
    }
  }, [id]);

  const handleViewClassroom = async (classId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await getClassroomDetail(classId);
      setSelectedClassroom(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classroom details.');
    } finally {
      setLoading(false);
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

  if (error && !selectedClassroom) {
    return (
      <Box sx={{ p: 4, height: '100vh', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)` }}>
        <Container maxWidth="lg">
            <Button startIcon={<BackIcon />} onClick={() => navigate('/teacher-dashboard')} sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 2 }}>
              Back to Dashboard
            </Button>
            <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!selectedClassroom) return null;

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, pt: 10, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Button startIcon={<BackIcon />} onClick={() => navigate('/teacher-dashboard')} sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1 }}>
                Back to Classrooms
              </Button>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <GroupIcon sx={{ mr: 1, fontSize: 40, verticalAlign: 'middle' }} />
                {selectedClassroom.name}
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                Enrollment Code: {selectedClassroom.enrollment_code}
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Classroom Detail View */}
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
              <Box>
                <TextField
                  fullWidth
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: alpha(theme.palette.common.white, 0.5), mr: 1 }} />,
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiInputBase-root': { bgcolor: alpha(theme.palette.common.white, 0.05), color: '#fff', borderRadius: 2 },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.common.white, 0.2) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.common.white, 0.4) },
                  }}
                />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Username</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Story Progress</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Challenges</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Learning</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Python History Quiz</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="center">Cumulative GWAs</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Email</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }}>Joined</TableCell>
                        <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), fontWeight: 'bold', borderColor: alpha(theme.palette.common.white, 0.1) }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClassroom.students.filter(s => s.username.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
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
                          <TableCell align="center" sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                              {(student.story_mode_gwa ?? 0) > 0 ? (
                                <Chip
                                  label={`Story: ${student.story_mode_gwa?.toFixed(2)}`}
                                  size="small"
                                  sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.light, fontWeight: 'bold', fontSize: '0.65rem' }}
                                />
                              ) : (
                                <Chip label="Story: N/A" size="small" sx={{ bgcolor: alpha(theme.palette.common.white, 0.1), color: alpha(theme.palette.common.white, 0.4), fontSize: '0.65rem' }} />
                              )}
                              {(student.learning_mode_gwa ?? 0) > 0 ? (
                                <Chip
                                  label={`Sandbox: ${student.learning_mode_gwa?.toFixed(2)}`}
                                  size="small"
                                  sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.light, fontWeight: 'bold', fontSize: '0.65rem' }}
                                />
                              ) : (
                                <Chip label="Sandbox: N/A" size="small" sx={{ bgcolor: alpha(theme.palette.common.white, 0.1), color: alpha(theme.palette.common.white, 0.4), fontSize: '0.65rem' }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: alpha(theme.palette.common.white, 0.8), borderColor: alpha(theme.palette.common.white, 0.1) }}>{student.email}</TableCell>
                          <TableCell sx={{ color: alpha(theme.palette.common.white, 0.7), borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            {new Date(student.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
                            <Tooltip title="View Detailed Grades">
                              <IconButton
                                size="small"
                                onClick={() => { setDetailsTarget(student); setDetailsDialogOpen(true); }}
                                sx={{ color: theme.palette.info.main }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
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
              </Box>
            )}
          </GradientPaper>
        </Fade>
      </Container>

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

      {/* View Detailed Grades Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: theme.palette.grey[800], color: '#fff', borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Detailed Grades for {detailsTarget?.username}</Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {detailsTarget?.detailed_grades && detailsTarget.detailed_grades.length > 0 && (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.secondary.light }}>Cumulative Grade Weighted Average</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>{(detailsTarget?.story_mode_gwa ?? 0).toFixed(2)}</Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }}>
          {/* ── Story Mode Grades Section ── */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.warning.light, mb: 2, borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`, pb: 1 }}>
            📖 Story Mode Grades
          </Typography>
          {detailsTarget?.detailed_grades && detailsTarget.detailed_grades.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {detailsTarget.detailed_grades.map((prof: any, idx: number) => (
                <Box key={idx} sx={{ p: 2, bgcolor: alpha(theme.palette.common.white, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.light, mb: 1 }}>{prof.professor}</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), display: 'block' }}>Final Grade</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: prof.grade === 'Not Attempted' ? alpha(theme.palette.common.white, 0.3) : '#fff' }}>{prof.grade}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), display: 'block' }}>Retakes</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: prof.retakes === 'Not Attempted' ? alpha(theme.palette.common.white, 0.3) : '#fff' }}>{prof.retakes}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), display: 'block' }}>Removal Passed</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: prof.removal_exam === 'Not Attempted' ? alpha(theme.palette.common.white, 0.3) : '#fff' }}>
                        {prof.removal_exam === true ? "Passed" : (prof.grade === 5.0 && prof.retakes > 0) ? "Failed" : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  {prof.professor === "Professor Query" && prof.ai_data && prof.grade !== 'Not Attempted' && (
                    <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
                      <Typography variant="caption" sx={{ color: theme.palette.info.light, fontWeight: 'bold', display: 'block', mb: 1 }}>
                        🤖 AI Relationship Minigame Status
                      </Typography>
                      {prof.ai_data.ai_fully_offline ? (
                        <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>❌ Fully Offline (All 3 Modules Skipped)</Typography>
                      ) : (prof.ai_data.ai_oto_skipped || prof.ai_data.ai_otm_skipped || prof.ai_data.ai_mtm_skipped) ? (
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>⚠️ Partial Connection (Some Modules Auto-Skipped)</Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>✅ Online — All Modules Completed</Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 3 }}>
              No story mode grades yet.
            </Typography>
          )}

          {/* ── Learning Mode Grades Section ── */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.light, mb: 2, borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.3)}`, pb: 1 }}>
            📚 Learning Mode Grades (Sandbox)
          </Typography>
          {detailsTarget?.learning_mode_detailed_grades && detailsTarget.learning_mode_detailed_grades.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {detailsTarget.learning_mode_detailed_grades.map((entry: any, idx: number) => (
                <Box key={idx} sx={{ p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.info.light, fontWeight: 'bold' }}>{entry.professor}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>{entry.grade}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: alpha(theme.palette.common.white, 0.7) }}>No learning mode grades yet.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ClassroomStudents;
