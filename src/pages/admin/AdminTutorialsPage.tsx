import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/axios';
import {
  Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Snackbar, Alert, CircularProgress, Chip,
  Grid, Card, CardMedia, CardContent, CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ListAlt as ListIcon
} from '@mui/icons-material';interface Tutorial {
  id: number;
  title: string;
  description: string;
  video_url: string;
  tutorial_type: 'interactive' | 'video';
  file_types: string[];
  order: number;
  is_active: boolean;
  step_count: number;
}

const AdminTutorialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const apiBase = '/video-tutorials';

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get(`${apiBase}/`);
      setTutorials(response.data);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      showSnackbar('Failed to load tutorials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenModal = (tutorial?: Tutorial) => {
    if (tutorial) {
      setEditingId(tutorial.id);
      setTitle(tutorial.title);
      setDescription(tutorial.description || '');
      setVideoUrl(tutorial.video_url || '');
      setOrder(tutorial.order);
      setIsActive(tutorial.is_active);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setOrder(tutorials.length + 1);
      setIsActive(true);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }

    const payload = {
      title,
      description,
      video_url: videoUrl,
      order,
      is_active: isActive
    };

    try {
      if (editingId) {
        await adminApi.put(`${apiBase}/${editingId}/`, payload);
        showSnackbar('Tutorial updated successfully', 'success');
      } else {
        await adminApi.post(`${apiBase}/`, payload);
        showSnackbar('Tutorial created successfully', 'success');
      }
      handleCloseModal();
      fetchTutorials();
    } catch (error) {
      console.error('Error saving tutorial:', error);
      showSnackbar('Failed to save tutorial', 'error');
    }
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await adminApi.delete(`${apiBase}/${deleteTargetId}/`);
      showSnackbar('Tutorial deleted successfully', 'success');
      setTutorials(prev => prev.filter(t => t.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      showSnackbar('Failed to delete tutorial', 'error');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` : null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
          Manage Video Tutorials
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}
        >
          New Tutorial
        </Button>
      </Box>

      {tutorials.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#1e293b', border: '1px dashed #334155' }}>
          <Typography sx={{ color: '#64748b' }}>No tutorials found.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tutorials.map((tutorial) => {
            const thumbnailUrl = getYoutubeThumbnail(tutorial.video_url);
            return (
              <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                <Card sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {thumbnailUrl ? (
                    <CardMedia component="img" height="160" image={thumbnailUrl} alt={tutorial.title} sx={{ borderBottom: '1px solid #334155' }} />
                  ) : (
                    <Box sx={{ height: 160, bgcolor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #334155' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>No Thumbnail</Typography>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2 }}>
                        {tutorial.title}
                      </Typography>
                      <Chip label={tutorial.is_active ? 'Active' : 'Draft'} color={tutorial.is_active ? 'success' : 'default'} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tutorial.description || 'No description provided.'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                      Steps: {tutorial.step_count}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      startIcon={<ListIcon />}
                      variant="outlined"
                      sx={{ borderColor: '#3b82f6', color: '#3b82f6', textTransform: 'none' }}
                      onClick={() => navigate(`/admin-dashboard${apiBase}/${tutorial.id}`)}
                    >
                      Manage Steps
                    </Button>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenModal(tutorial)} sx={{ color: '#818cf8', mr: 0.5 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(tutorial.id)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Tutorial Edit/Create Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
        <DialogTitle>{editingId ? 'Edit Tutorial' : 'New Tutorial'}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            sx={{ input: { color: '#e2e8f0' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' } } }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            sx={{ textarea: { color: '#e2e8f0' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' } } }}
          />
          <TextField
            fullWidth
            label="YouTube URL (Optional)"
            placeholder="e.g. https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            sx={{ input: { color: '#e2e8f0' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' } } }}
          />
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
            label="Active"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
            {editingId ? 'Save Changes' : 'Create Tutorial'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <Typography sx={{ color: '#94a3b8' }}>
            Are you sure you want to delete this tutorial? All its steps will also be deleted permanently.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTargetId(null)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={executeDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTutorialsPage;
