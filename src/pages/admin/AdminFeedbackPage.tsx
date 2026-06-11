// src/pages/admin/AdminFeedbackPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Rating, Select, MenuItem,
  FormControl, InputLabel, Skeleton, Alert, alpha, Collapse, Button, TextField,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { deleteAdminFeedback, downloadExport } from '../../api/admin';
import { resolveBaseUrl } from '../../api/axios';

interface FeedbackItem {
  id: number;
  user_email: string;
  role_snapshot: string;
  feedback_type: string;
  rating: number;
  comments: string;
  created_at: string;
  classroom_name: string | null;
  game_level: string;
  curriculum_relevance_rating: number | null;
  website_usability_notes: string;
}

// Admin feedback API
import axios from 'axios';
const adminApi = axios.create({
  baseURL: resolveBaseUrl('/api/admin'),
  headers: { 'Content-Type': 'application/json' },
});
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const typeColors: Record<string, string> = {
  game: '#256d4f',
  website: '#256d4f',
  classroom: '#fbbf24',
};

const AdminFeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (typeFilter) params.type = typeFilter;
        if (roleFilter) params.role = roleFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const res = await adminApi.get('/feedback/', { params });
        setFeedback(res.data.results ?? res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load feedback.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [typeFilter, roleFilter, dateFrom, dateTo]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'var(--mui-palette-text-primary)', fontWeight: 600 }}>Feedback</Typography>
          <Typography variant="body2" sx={{ color: 'var(--mui-palette-text-secondary)' }}>View and moderate all user feedback.</Typography>
        </Box>
        <Button startIcon={<DownloadIcon />} size="small" onClick={() => downloadExport('feedback')}
          variant="outlined" sx={{ color: 'var(--mui-palette-text-secondary)', borderColor: 'var(--mui-palette-divider)', textTransform: 'none' }}>
          Export CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: 'var(--mui-palette-text-secondary)' }}>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{
              bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)', borderRadius: 2,
              '& fieldset': { borderColor: 'var(--mui-palette-divider)' },
              '&:hover fieldset': { borderColor: '#475569' },
              '& .MuiSvgIcon-root': { color: 'var(--mui-palette-text-secondary)' },
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="game">Game</MenuItem>
            <MenuItem value="website">Website</MenuItem>
            <MenuItem value="classroom">Classroom</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: 'var(--mui-palette-text-secondary)' }}>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{
              bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)', borderRadius: 2,
              '& fieldset': { borderColor: 'var(--mui-palette-divider)' },
              '&:hover fieldset': { borderColor: '#475569' },
              '& .MuiSvgIcon-root': { color: 'var(--mui-palette-text-secondary)' },
            }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="date" size="small" label="From" value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true, sx: { color: 'var(--mui-palette-text-secondary)' } }}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)', borderRadius: 2 }, '& fieldset': { borderColor: 'var(--mui-palette-divider)' } }}
        />
        <TextField
          type="date" size="small" label="To" value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true, sx: { color: 'var(--mui-palette-text-secondary)' } }}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)', borderRadius: 2 }, '& fieldset': { borderColor: 'var(--mui-palette-divider)' } }}
        />
        {(typeFilter || roleFilter || dateFrom || dateTo) && (
          <Button
            size="small" onClick={() => { setTypeFilter(''); setRoleFilter(''); setDateFrom(''); setDateTo(''); }}
            sx={{ color: 'var(--mui-palette-text-secondary)', textTransform: 'none', '&:hover': { color: 'var(--mui-palette-text-primary)' } }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Feed */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Paper key={i} sx={{ p: 2.5, bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)' }}>
              <Skeleton variant="text" width={200} sx={{ bgcolor: 'var(--mui-palette-divider)' }} />
              <Skeleton variant="text" width="80%" sx={{ bgcolor: 'var(--mui-palette-divider)', mt: 1 }} />
              <Skeleton variant="text" width="60%" sx={{ bgcolor: 'var(--mui-palette-divider)' }} />
            </Paper>
          ))
        ) : feedback.length === 0 ? (
          <Paper sx={{ p: 4, bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)', textAlign: 'center' }}>
            <Typography sx={{ color: '#475569' }}>No feedback submitted yet.</Typography>
          </Paper>
        ) : (
          feedback.map((item) => {
            const hasTeacherContext = item.role_snapshot === 'teacher' && (item.classroom_name || item.game_level || item.curriculum_relevance_rating || item.website_usability_notes);
            return (
              <Paper
                key={item.id}
                sx={{
                  p: 2.5, bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2,
                  border: '1px solid var(--mui-palette-divider)',
                  transition: 'border-color 0.2s ease',
                  '&:hover': { borderColor: '#475569' },
                }}
              >
                {/* Header row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={item.role_snapshot === 'student' ? 'Student' : 'Teacher'}
                    size="small"
                    sx={{
                      bgcolor: item.role_snapshot === 'student' ? alpha('#315a7d', 0.2) : alpha('#256d4f', 0.2),
                      color: item.role_snapshot === 'student' ? '#315a7d' : '#256d4f',
                      fontWeight: 600, fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={item.feedback_type.charAt(0).toUpperCase() + item.feedback_type.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: alpha(typeColors[item.feedback_type] || 'var(--mui-palette-text-secondary)', 0.2),
                      color: typeColors[item.feedback_type] || 'var(--mui-palette-text-secondary)',
                      fontWeight: 600, fontSize: '0.7rem',
                    }}
                  />
                  <Rating value={item.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }} />
                  <Typography variant="caption" sx={{ color: '#475569', ml: 'auto' }}>
                    {timeAgo(item.created_at)}
                  </Typography>
                  <Tooltip title="Delete feedback">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id); }} sx={{ color: '#ef4444', ml: 0.5 }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* User email */}
                <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', display: 'block', mb: 0.5 }}>
                  {item.user_email}
                </Typography>

                {/* Comments */}
                {item.comments && (
                  <Typography variant="body2" sx={{ color: 'var(--mui-palette-text-primary)', mt: 1 }}>
                    {item.comments}
                  </Typography>
                )}

                {/* Teacher context */}
                {hasTeacherContext && (
                  <>
                    <Button
                      size="small"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      endIcon={expandedId === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{ color: 'var(--mui-palette-text-secondary)', textTransform: 'none', mt: 1, p: 0 }}
                    >
                      Teacher Context
                    </Button>
                    <Collapse in={expandedId === item.id}>
                      <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid var(--mui-palette-divider)' }}>
                        {item.classroom_name && (
                          <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', display: 'block' }}>
                            Classroom: {item.classroom_name}
                          </Typography>
                        )}
                        {item.game_level && (
                          <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', display: 'block' }}>
                            Game Level: {item.game_level}
                          </Typography>
                        )}
                        {item.curriculum_relevance_rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)' }}>Curriculum Relevance:</Typography>
                            <Rating value={item.curriculum_relevance_rating} readOnly size="small" />
                          </Box>
                        )}
                        {item.website_usability_notes && (
                          <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', display: 'block' }}>
                            Usability: {item.website_usability_notes}
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </>
                )}
              </Paper>
            );
          })
        )}
      </Box>

      {/* Delete Feedback Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { bgcolor: 'var(--mui-palette-background-paper)', color: 'var(--mui-palette-text-primary)', borderRadius: 3, border: '1px solid var(--mui-palette-divider)' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Feedback?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--mui-palette-text-secondary)' }}>This feedback entry will be permanently deleted.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: 'var(--mui-palette-text-secondary)', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={async () => {
            if (!deleteTarget) return;
            try { await deleteAdminFeedback(deleteTarget); setDeleteTarget(null); setSnackbar('Feedback deleted.'); setFeedback(f => f.filter(x => x.id !== deleteTarget)); }
            catch { setError('Failed to delete feedback.'); }
          }} variant="contained" sx={{ bgcolor: '#ef4444', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#dc2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
};

export default AdminFeedbackPage;
