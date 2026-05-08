import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorialApi } from '../api/axios';
import { Box, Typography, Button, Container, Paper, CircularProgress, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Code as CodeIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../components/LoadingSpinner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Step {
  id: number;
  title: string;
  content: string;
  order: number;
  fileType: string;
  solutionCode?: string;
  trivia?: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  steps: Step[];
}

const TutorialVideoLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const response = await tutorialApi.get<Tutorial[]>('/video/');
        const tutorialsData = response.data;
        const tutorialId = parseInt(id || '', 10);
        const selectedTutorial = tutorialsData.find(t => t.id === tutorialId);
        if (selectedTutorial) {
          setTutorial(selectedTutorial);
        } else {
          setError('Tutorial not found.');
        }
      } catch (err) {
        console.error('Failed to fetch tutorial:', err);
        setError('Failed to load this Video Guide.');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#121212' }}>
        <LoadingSpinner size={80} message="Loading Video Guide..." />
      </Box>
    );
  }

  if (error || !tutorial) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#121212', p: 3 }}>
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>{error || 'Tutorial not found'}</Alert>
      </Box>
    );
  }

  const embedUrl = (() => {
    if (!tutorial.videoUrl) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = tutorial.videoUrl.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : tutorial.videoUrl;
  })();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#121212', pt: { xs: '120px', md: '140px' }, pb: 8 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tutorials')}
          sx={{ mb: 4, color: '#999', textTransform: 'none', '&:hover': { color: '#fff' } }}
        >
          Back to Tutorials
        </Button>

        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
          {tutorial.title}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#aaa', mb: 4 }}>
          {tutorial.description}
        </Typography>

        {embedUrl && (
          <Paper elevation={4} sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 3, overflow: 'hidden', mb: 6, bgcolor: '#000' }}>
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </Paper>
        )}

        {tutorial.steps.map((step, index) => (
          <Paper key={step.id} sx={{ p: 4, mb: 4, bgcolor: '#1e1e1e', borderRadius: 2, border: '1px solid #333' }}>
            <Typography variant="h5" sx={{ color: '#4fc3f7', mb: 2, fontWeight: 600 }}>
              Step {index + 1}: {step.title}
            </Typography>

            <Box sx={{ 
              color: '#d4d4d4', mb: 3, typography: 'body1', 
              '& h1, & h2, & h3, & h4': { color: '#fff', mt: 3, mb: 1.5, fontWeight: 600 },
              '& p': { mb: 1.5, lineHeight: 1.6 },
              '& ul, & ol': { mb: 2, pl: 3 },
              '& li': { mb: 1 },
              '& pre': { bgcolor: '#0d0d0d', p: 2, borderRadius: 2, overflowX: 'auto', mb: 2, border: '1px solid #333' },
              '& code': { bgcolor: '#2d2d2d', px: 0.8, py: 0.3, borderRadius: 1, color: '#e06c75', fontFamily: 'monospace', fontSize: '0.9em' },
              '& pre code': { bgcolor: 'transparent', p: 0, color: '#98c379' },
              '& a': { color: '#4fc3f7', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }
            }}>
              <ReactMarkdown
                components={{
                  code(props) {
                    const { children, className, node, ref, ...rest } = props as any;
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        style={vscDarkPlus as any}
                        customStyle={{ margin: 0, borderRadius: '8px', border: '1px solid #333' }}
                      />
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {step.content}
              </ReactMarkdown>
            </Box>

            {step.solutionCode && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CodeIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ color: '#999' }}>Expected Code</Typography>
                </Box>
                <Paper sx={{ bgcolor: '#0d0d0d', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                  <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: '0.875rem', m: 0 }}>
                    {step.solutionCode}
                  </Typography>
                </Paper>
              </Box>
            )}

            {step.trivia && (
              <Alert severity="info" sx={{ mt: 3, bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#81d4fa', '& .MuiAlert-icon': { color: '#4fc3f7' } }}>
                {step.trivia}
              </Alert>
            )}
          </Paper>
        ))}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>You've finished the guide!</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/tutorials')} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Return to Tutorials
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TutorialVideoLayout;
