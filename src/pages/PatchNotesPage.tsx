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
    <Box sx={{ minHeight: '100vh', backgroundColor: "background.default", color: "text.primary", pt: 12, pb: 8 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h3" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
            Patch Notes
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: 'text.secondary', mb: 6 }}>
            What's new in DjangoQuest
          </Typography>
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notes.length === 0 ? (
          <Paper sx={{ bgcolor: 'background.paper', p: 5, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography color="text.secondary">No patch notes published yet. Check back later!</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Paper sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: '4px solid #256d4f',
                  borderRadius: 2,
                  p: 3,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={`v${note.version}`} size="small" sx={{ bgcolor: 'rgba(68, 183, 139, 0.2)', color: '#256d4f', fontWeight: 'bold' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--mui-palette-text-primary)' }}>{note.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', ml: 'auto' }}>
                      {new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
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
