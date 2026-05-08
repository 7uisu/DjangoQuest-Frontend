import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/axios';
import {
  Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';

interface TutorialStep {
  id: number;
  tutorial_id: number;
  title: string;
  content: string;
  order: number;
  file_type: string;
  initial_code: string;
  solution_code: string;
  trivia: string;
  expected_elements: string;
  checkpoint_xp: number;
  base_template: string;
  preview_context: string;
}



const AdminTutorialStepsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [tutorialTitle, setTutorialTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const apiBase = '/video-tutorials';
  
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<TutorialStep>>({
    title: '', content: '', order: 1
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await adminApi.get(`${apiBase}/${id}/`);
      setTutorialTitle(resp.data.title);
      // We will sort and set the steps
      const stepsList = resp.data.steps || [];
      // To get full info on steps, we need to iterate or rely on the overview. Actually, resp.data.steps might only be a summary.
      // Let's call the step detail for the first step to check if it's full data.
      // Or we can just call it full data by relying on a separate endpoint if needed, but our AdminTutorialDetailView already returns basic step info.
      // Wait, AdminTutorialDetailView returns: id, title, order, file_type. We need full details to edit.
      // We will fetch full details ONLY when "Edit" is clicked.
      setSteps(stepsList);
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      showSnackbar('Failed to load tutorial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const handleOpenModal = async (stepId?: number) => {
    if (stepId) {
      try {
        const resp = await adminApi.get(`${apiBase}/steps/${stepId}/`);
        setEditingId(stepId);
        setFormData(resp.data);
        setOpenModal(true);
      } catch (e) {
        showSnackbar('Failed to fetch step details', 'error');
      }
    } else {
      setEditingId(null);
      setFormData({
        title: '', content: '', order: steps.length + 1
      });
      setOpenModal(true);
    }
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    if (!formData.title) return showSnackbar('Title is required', 'error');

    try {
      if (editingId) {
        await adminApi.put(`${apiBase}/steps/${editingId}/`, formData);
        showSnackbar('Step updated successfully', 'success');
        setOpenModal(false);
      } else {
        await adminApi.post(`${apiBase}/${id}/steps/`, formData);
        showSnackbar('Step created successfully', 'success');
        if (addAnother) {
           setFormData({ title: '', content: '', order: (formData.order || steps.length) + 1 });
        } else {
           setOpenModal(false);
        }
      }
      fetchData();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to save step', 'error');
    }
  };

  const handleDelete = (stepId: number) => {
    setDeleteTargetId(stepId);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await adminApi.delete(`${apiBase}/steps/${deleteTargetId}/`);
      showSnackbar('Step deleted', 'success');
      setSteps(prev => prev.filter(s => String(s.id) !== String(deleteTargetId)));
      setDeleteTargetId(null);
    } catch (e) {
      showSnackbar('Failed to delete step', 'error');
    }
  };

  const handleChange = (field: keyof TutorialStep, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><LoadingSpinner size={50} message="Loading Steps..." /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/admin-dashboard/video-tutorials`)} sx={{ mr: 2, color: '#94a3b8' }}>Back</Button>
        <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600, flexGrow: 1 }}>
          Steps for: <Typography component="span" variant="h5" sx={{ color: '#818cf8', fontWeight: 700 }}>{tutorialTitle}</Typography>
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
          New Step
        </Button>
      </Box>

      <Paper sx={{ bgcolor: '#1e293b', border: '1px solid #334155' }}>
        {steps.length === 0 ? (
          <Typography sx={{ p: 4, color: '#64748b', textAlign: 'center' }}>No steps created yet.</Typography>
        ) : (
          <List disablePadding>
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <ListItem sx={{ py: 2 }}>
                  <ListItemText
                    primary={<Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>{step.order}. {step.title}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Log Order: {step.order}</Typography>}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleOpenModal(step.id)} sx={{ color: '#818cf8', mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(step.id)} sx={{ color: '#ef4444' }}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {idx < steps.length - 1 && <Divider sx={{ borderColor: '#334155' }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Editor Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
        <DialogTitle>{editingId ? 'Edit Step' : 'New Step'}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' } }, input: { color: '#e2e8f0' } }}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              label="Title"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
            />

          </Box>

          <TextField
            label="Log Content (Details of what is happening in the video)"
            multiline rows={6}
            value={formData.content}
            onChange={e => handleChange('content', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' } }, textarea: { color: '#e2e8f0' } }}
            InputLabelProps={{ style: { color: '#94a3b8' } }}
          />


        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          {!editingId && (
            <Button onClick={() => handleSubmit(true)} variant="outlined" sx={{ color: '#818cf8', borderColor: '#818cf8', '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.1)' } }}>
              Save & Add Another
            </Button>
          )}
          <Button onClick={() => handleSubmit(false)} variant="contained" sx={{ bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
            {editingId ? 'Save Step' : 'Create Step'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#334155' }}>
          <Typography sx={{ color: '#94a3b8' }}>
            Are you sure you want to delete this step completely? This action cannot be undone.
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
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTutorialStepsPage;
