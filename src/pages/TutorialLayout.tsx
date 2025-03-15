import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Add useNavigate
import { Editor } from '@monaco-editor/react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Collapse,
  Alert,
} from '@mui/material';
import {
  ChevronRight,
  ChevronLeft,
  Refresh,
  PlayArrow,
  Lightbulb,
  LightbulbOutlined,
  VisibilityOutlined,
  ArrowBack, // Add this
} from '@mui/icons-material';
import sanitizeHtml from 'sanitize-html';
import { useAuth } from '../hooks/useAuth';
import { tutorialApi } from '../api/axios';
import { User } from '../hooks/AuthContext'; // Adjust if ProfileData is separate

interface Step {
  id: number;
  title: string;
  content: string;
  initialCode: string;
  solutionCode: string;
  expectedElements: string[];
  fileType: string;
  order: number;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  steps: Step[];
}

interface ProgressData {
  currentTutorial: number | null;
  currentStep: number | null;
  savedCode: string | null;
}

const TutorialLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get tutorial ID from URL
  const navigate = useNavigate(); // For navigation back to list
  const { user, isAuthenticated, getUserProfile } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStepOrder, setCurrentStepOrder] = useState<number | null>(null);
  const [code, setCode] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [renderedOutput, setRenderedOutput] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [checkLoading, setCheckLoading] = useState(false);

  useEffect(() => {
    const fetchTutorialsAndProgress = async () => {
      try {
        setLoading(true);
        const tutorialResponse = await tutorialApi.get<Tutorial[]>('/tutorials/');
        console.log('Tutorials fetched:', tutorialResponse.data);
        const tutorialsData = tutorialResponse.data;
        setTutorials(tutorialsData);

        // Select tutorial based on URL id
        const tutorialId = parseInt(id || '', 10);
        const selectedTutorial = tutorialsData.find(t => t.id === tutorialId);
        if (!selectedTutorial) {
          setOutput('Tutorial not found.');
          setLoading(false);
          return;
        }

        let progressData: ProgressData | null = null;
        if (isAuthenticated && user) {
          try {
            const progressResponse = await tutorialApi.get<ProgressData>('/user/progress/');
            console.log('Progress fetched:', progressResponse.data);
            progressData = progressResponse.data;
          } catch (err) {
            console.error('Progress fetch failed:', err);
          }
        }

        if (selectedTutorial) {
          setCurrentTutorial(selectedTutorial);
          const firstStepIndex = progressData?.currentStep
            ? selectedTutorial.steps.findIndex(s => s.order === progressData.currentStep)
            : 0;
          setCurrentStepIndex(firstStepIndex !== -1 ? firstStepIndex : 0);
          setCurrentStepOrder(selectedTutorial.steps[firstStepIndex !== -1 ? firstStepIndex : 0].order);
          setCode(progressData?.savedCode || selectedTutorial.steps[firstStepIndex !== -1 ? firstStepIndex : 0].initialCode);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tutorials or progress:', error);
        setOutput('Failed to load tutorials. Please try again.');
        setLoading(false);
      }
    };

    fetchTutorialsAndProgress();
  }, [isAuthenticated, user, id]); // Add id to dependencies

  useEffect(() => {
    if (currentTutorial && currentTutorial.steps[currentStepIndex]?.fileType === 'html') {
      const sanitized = sanitizeHtml(code, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['style']),
        allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['style', 'class'] },
      });
      setRenderedOutput(sanitized);
    } else if (currentTutorial && currentTutorial.steps[currentStepIndex]?.fileType === 'css') {
      setRenderedOutput(`
        <div class="css-preview">
          <style>${code}</style>
          <div class="example-elements">
            <h1>Example Heading</h1>
            <p>This is a paragraph to demonstrate your CSS.</p>
            <button>A Button</button>
            <div class="container">
              <div class="box">Box 1</div>
              <div class="box">Box 2</div>
              <div class="box">Box 3</div>
            </div>
          </div>
        </div>
      `);
    }
  }, [code, currentTutorial, currentStepIndex]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        saveProgress(value);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  const saveProgress = async (currentCode: string) => {
    if (!currentTutorial || !isAuthenticated) return;
    try {
      await tutorialApi.post('/user/progress/', {
        tutorialId: currentTutorial.id,
        stepIndex: currentStepOrder,
        code: currentCode,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save progress:', error);
      setSaveStatus('error');
    }
  };

  const checkCode = async () => {
    if (!currentTutorial || !isAuthenticated) return;
    setCheckLoading(true);
    try {
      const response = await tutorialApi.post<{ success: boolean; output: string }>('/check-code/', {
        tutorialId: currentTutorial.id,
        stepIndex: currentStepOrder,
        code,
      });
      const result = response.data;
      setOutput(result.output);
      setIsSuccess(result.success);
      if (result.success) {
        const updatedProfile = await getUserProfile();
        if (currentStepIndex === currentTutorial.steps.length - 1) {
          await completeCurrentTutorial();
        } else {
          setTimeout(() => {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setCurrentStepOrder(currentTutorial.steps[nextIndex].order);
            setCode(currentTutorial.steps[nextIndex].initialCode);
            setIsSolutionVisible(false);
            setShowHint(false);
          }, 1500);
        }
        setOutput(`${result.output} | New XP: ${updatedProfile.profile.total_xp}`);
      }
    } catch (error) {
      console.error('Error checking code:', error);
      setOutput('Error checking your code. Please try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  const completeCurrentTutorial = async () => {
    if (!currentTutorial || !isAuthenticated) return;
    try {
      const response = await tutorialApi.post<{ nextTutorial: number | null }>(
        `/tutorials/${currentTutorial.id}/complete/`
      );
      const result = response.data;
      const updatedProfile = await getUserProfile();
      if (result.nextTutorial) {
        const nextTutorial = tutorials.find((t) => t.id === result.nextTutorial);
        if (nextTutorial) {
          setTimeout(() => {
            navigate(`/tutorials/${nextTutorial.id}`); // Navigate to next tutorial
            setCurrentTutorial(nextTutorial);
            setCurrentStepIndex(0);
            setCurrentStepOrder(nextTutorial.steps[0].order);
            setCode(nextTutorial.steps[0].initialCode);
            setOutput(
              `Congratulations! You've completed ${currentTutorial.title}. Moving to the next tutorial... | New XP: ${updatedProfile.profile.total_xp}`
            );
            setIsSolutionVisible(false);
            setShowHint(false);
          }, 1500);
        }
      } else {
        setOutput(
          `Congratulations! You've completed ${currentTutorial.title}. No more tutorials available. | New XP: ${updatedProfile.profile.total_xp}`
        );
      }
    } catch (error) {
      console.error('Error completing tutorial:', error);
      setOutput('Error completing the tutorial. Please try again.');
    }
  };

  const showSolution = () => {
    if (!currentTutorial) return;
    setIsSolutionVisible(true);
    setCode(currentTutorial.steps[currentStepIndex].solutionCode);
  };

  const resetCode = () => {
    if (!currentTutorial) return;
    setCode(currentTutorial.steps[currentStepIndex].initialCode);
    setIsSolutionVisible(false);
  };

  const navigateToStep = (index: number) => {
    if (!currentTutorial || index < 0 || index >= currentTutorial.steps.length) return;
    setCurrentStepIndex(index);
    setCurrentStepOrder(currentTutorial.steps[index].order);
    setCode(currentTutorial.steps[index].initialCode || '');
    setShowHint(false);
    setIsSolutionVisible(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentTutorial) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Tutorial not found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tutorials')}
          sx={{ mt: 2 }}
        >
          Back to Tutorials
        </Button>
      </Box>
    );
  }

  const currentStep = currentTutorial.steps[currentStepIndex];
  const fileType = currentStep.fileType || 'python';
  const totalXp = user?.profile?.total_xp || 0;

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw',
      paddingTop: "64px",
      boxSizing: "border-box"
    }}>
      {/* Left Section - Tutorial Instructions */}
      <Paper
        elevation={3}
        sx={{
          width: '30%',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tutorials')}
            sx={{ mr: 2 }}
          >
            Back to Tutorials
          </Button>
          <Typography variant="h5">
            {currentTutorial.title} <Typography variant="subtitle2" component="span">(XP: {totalXp})</Typography>
          </Typography>
        </Box>
        <Stepper activeStep={currentStepIndex} orientation="horizontal" sx={{ mb: 2 }}>
          {currentTutorial.steps.map((step, index) => (
            <Step key={step.id} completed={index < currentStepIndex}>
              <StepLabel onClick={() => navigateToStep(index)} sx={{ cursor: 'pointer' }}>
                {index + 1}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {currentStep.title}
        </Typography>
        <Box sx={{ mt: 2, mb: 2 }} dangerouslySetInnerHTML={{ __html: currentStep.content }} />
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="outlined"
            color="primary"
            startIcon={showHint ? <Lightbulb /> : <LightbulbOutlined />}
            onClick={() => setShowHint(!showHint)}
            sx={{ mb: 1 }}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          <Collapse in={showHint}>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2">Need more help?</Typography>
              <Button
                variant="outlined"
                startIcon={<VisibilityOutlined />}
                onClick={showSolution}
                disabled={isSolutionVisible}
                fullWidth
              >
                Show Solution
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetCode}
                fullWidth
              >
                Reset Code
              </Button>
            </Stack>
          </Collapse>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<ChevronLeft />}
              disabled={currentStepIndex === 0}
              onClick={() => navigateToStep(currentStepIndex - 1)}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              endIcon={<ChevronRight />}
              disabled={currentStepIndex === currentTutorial.steps.length - 1}
              onClick={() => navigateToStep(currentStepIndex + 1)}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Middle Section - Code Editor */}
      <Box
        sx={{
          width: '40%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1,
            backgroundColor: '#1e1e1e',
            color: 'white',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">
            {fileType === 'html'
              ? 'index.html'
              : fileType === 'css'
              ? 'styles.css'
              : fileType === 'js'
              ? 'script.js'
              : 'models.py'}
          </Typography>
          {saveStatus === 'saving' && <Typography variant="caption">Saving...</Typography>}
          {saveStatus === 'saved' && <Typography variant="caption">Saved</Typography>}
          {saveStatus === 'error' && <Typography variant="caption" color="error">Error saving</Typography>}
        </Paper>
        <Box sx={{ flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage={fileType}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 1,
            borderTop: '1px solid #333',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            backgroundColor: '#1e1e1e',
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<Refresh />}
            onClick={resetCode}
            size="small"
          >
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrow />}
            onClick={checkCode}
            size="small"
            disabled={checkLoading}
          >
            {checkLoading ? 'Checking...' : fileType === 'html' || fileType === 'css' ? 'Check Code' : 'Run Code'}
          </Button>
        </Paper>
      </Box>

      {/* Right Section - Output/Fake Browser */}
      <Paper
        elevation={3}
        sx={{
          width: '30%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 1,
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
          </Box>
          <Box
            sx={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              color: '#777',
            }}
          >
            http://localhost:8000/
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {(fileType === 'html' || fileType === 'css') ? (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <iframe
                title="output"
                srcDoc={renderedOutput}
                sandbox="allow-same-origin"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </Box>
          ) : output ? (
            <Box
              sx={{
                p: 2,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                backgroundColor: isSuccess ? '#f0fff0' : '#fff0f0',
                flex: 1,
              }}
            >
              <pre>{output}</pre>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                color: '#777',
              }}
            >
              <Typography variant="body2">Run your code to see the output here</Typography>
            </Box>
          )}
          {output && (
            <Alert
              severity={isSuccess ? 'success' : 'error'}
              sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: 0 }}
            >
              {output}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TutorialLayout;