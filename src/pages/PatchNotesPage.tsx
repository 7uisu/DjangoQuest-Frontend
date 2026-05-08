// src/pages/PatchNotesPage.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Container, Chip, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

interface PatchNote {
  id: number;
  version: string;
  title: string;
  body: string;
  created_at: string;
}

const PatchNotesPage = () => {
  const [notes, setNotes] = useState<PatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Patch Notes — DjangoQuest';
    const fetchNotes = async () => {
      try {
        const res = await axios.get('/api/patchnotes/');
        // Handle paginated or flat responses
        setNotes(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch {
        setError('Could not load patch notes.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f19 0%, #1a2333 100%)', color: 'white', pt: 12, pb: 8 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h3" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
            Patch Notes
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: '#a0aec0', mb: 6 }}>
            What's new in DjangoQuest
          </Typography>
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notes.length === 0 ? (
          <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 5, textAlign: 'center', borderRadius: 4 }}>
            <Typography sx={{ color: '#a0aec0' }}>No patch notes published yet. Check back later!</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Paper sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: '4px solid #44b78b',
                  borderRadius: 3,
                  p: 3,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={`v${note.version}`} size="small" sx={{ bgcolor: 'rgba(68, 183, 139, 0.2)', color: '#44b78b', fontWeight: 'bold' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#e2e8f0' }}>{note.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>
                      {new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#a0aec0', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {note.body}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PatchNotesPage;
