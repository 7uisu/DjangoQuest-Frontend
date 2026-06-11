import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorialApi } from '../api/axios';
import { Box, Typography, Button, Container, Paper, Alert, Chip, Divider } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <LoadingSpinner size={80} message="Loading Video Guide..." />
      </Box>
    );
  }

  if (error || !tutorial) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: { xs: '96px', md: '112px' }, pb: 8 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tutorials')}
          sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', '&:hover': { color: "text.primary" } }}
        >
          Back to Tutorials
        </Button>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Chip label="Video Tutorial" color="secondary" variant="outlined" sx={{ mb: 2 }} />
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}>
            {tutorial.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
            {tutorial.description}
          </Typography>
          <Divider />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            {tutorial.steps.length} guide {tutorial.steps.length === 1 ? 'topic' : 'topics'} included
          </Typography>
        </Paper>

        {embedUrl && (
          <Paper elevation={0} sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden', mb: 5, bgcolor: '#000', border: '1px solid', borderColor: 'divider' }}>
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </Paper>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Written Guide</Typography>
          <Typography variant="body2" color="text.secondary">
            Use these notes as a quick reference while watching the tutorial or playing DjangoQuest.
          </Typography>
        </Box>

        {tutorial.steps.map((step, index) => (
          <Paper key={step.id} elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ color: 'primary.main', mb: 2, fontWeight: 600 }}>
              Step {index + 1}: {step.title}
            </Typography>

            <Box sx={{ 
              color: 'text.primary', mb: 3, typography: 'body1', 
              '& h1, & h2, & h3, & h4': { color: "text.primary", mt: 3, mb: 1.5, fontWeight: 600 },
              '& p': { mb: 1.5, lineHeight: 1.6 },
              '& ul, & ol': { mb: 2, pl: 3 },
              '& li': { mb: 1 },
              '& pre': { bgcolor: 'background.default', p: 2, borderRadius: 2, overflowX: 'auto', mb: 2, border: '1px solid', borderColor: 'divider' },
              '& code': { bgcolor: 'background.default', px: 0.8, py: 0.3, borderRadius: 1, color: 'primary.main', fontFamily: 'monospace', fontSize: '0.9em' },
              '& pre code': { bgcolor: 'transparent', p: 0, color: 'text.primary' },
              '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }
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
                        customStyle={{ margin: 0, borderRadius: '8px', border: '1px solid var(--mui-palette-divider)' }}
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
                  <CodeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Expected Code</Typography>
                </Box>
                <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, overflowX: 'auto', border: '1px solid', borderColor: 'divider' }}>
                  <Typography component="pre" sx={{ color: 'text.primary', fontFamily: 'monospace', fontSize: '0.875rem', m: 0 }}>
                    {step.solutionCode}
                  </Typography>
                </Paper>
              </Box>
            )}

            {step.trivia && (
              <Alert severity="info" sx={{ mt: 3 }}>
                {step.trivia}
              </Alert>
            )}
          </Paper>
        ))}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h5" sx={{ color: "text.primary", mb: 2 }}>You've finished the guide!</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/tutorials')} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Return to Tutorials
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TutorialVideoLayout;
