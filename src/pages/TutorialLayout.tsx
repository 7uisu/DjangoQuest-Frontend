import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Collapse,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronRight,
  ChevronLeft,
  Refresh,
  PlayArrow,
  Lightbulb,
  LightbulbOutlined,
  VisibilityOutlined,
  ArrowBack,
} from '@mui/icons-material';
import sanitizeHtml from 'sanitize-html';
import { useAuth } from '../hooks/useAuth';
import { tutorialApi } from '../api/axios';
import { User } from '../hooks/AuthContext';

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface Step {
  id: number;
  title: string;
  content: string;
  initialCode: string;
  solutionCode: string;
  expectedElements: string[];
  fileType: string;
  order: number;
  trivia?: string;
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, getUserProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStepOrder, setCurrentStepOrder] = useState<number | null>(null);
  const [code, setCode] = useState<string>(''); // Combined code for saving/checking
  const [htmlCode, setHtmlCode] = useState<string>(''); // HTML editor content
  const [cssCode, setCssCode] = useState<string>(''); // CSS editor content
  const [activeTab, setActiveTab] = useState(0); // 0 for HTML, 1 for CSS
  const [showHint, setShowHint] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [renderedOutput, setRenderedOutput] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [checkLoading, setCheckLoading] = useState(false);
  const [trivia, setTrivia] = useState<string>('');

  useEffect(() => {
    const fetchTutorialsAndProgress = async () => {
      try {
        setLoading(true);
        const tutorialResponse = await tutorialApi.get<Tutorial[]>('/tutorials/');
        console.log('Tutorials fetched:', tutorialResponse.data);
        const tutorialsData = tutorialResponse.data;
        setTutorials(tutorialsData);

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
          const stepIndex = firstStepIndex !== -1 ? firstStepIndex : 0;
          setCurrentStepIndex(stepIndex);
          setCurrentStepOrder(selectedTutorial.steps[stepIndex].order);
          const initialCode = progressData?.savedCode || selectedTutorial.steps[stepIndex].initialCode;
          setCode(initialCode);
          if (selectedTutorial.steps[stepIndex].fileType === 'html+css') {
            const [htmlPart, cssPart] = initialCode.split('\nstyles.css:');
            setHtmlCode(htmlPart?.replace('index.html:', '') || '');
            setCssCode(cssPart || '');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tutorials or progress:', error);
        setOutput('Failed to load tutorials. Please try again.');
        setLoading(false);
      }
    };

    fetchTutorialsAndProgress();
  }, [isAuthenticated, user, id]);

  useEffect(() => {
    if (!currentTutorial || !currentTutorial.steps[currentStepIndex]) return;

    const fileType = currentTutorial.steps[currentStepIndex].fileType;
    if (fileType === 'html+css') {
      const bodyMatch = htmlCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : '';
      // Allow broader tags and ensure styles apply
      setRenderedOutput(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${sanitizeHtml(bodyContent, {
        allowedTags: ['h1', 'p', 'div', 'span'],
        allowedAttributes: { '*': ['class'] }
      })}
        </body>
        </html>
      `);
    } else if (fileType === 'html') {
      const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : '';
      setRenderedOutput(sanitizeHtml(bodyContent, { allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'], allowedAttributes: { '*': ['style', 'class'] } }));
    } else if (fileType === 'css') {
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
    } else {
      setRenderedOutput('');
    }
  }, [code, htmlCode, cssCode, currentTutorial, currentStepIndex]);

  const handleCodeChange = (value: string | undefined, file: 'html' | 'css' | 'single') => {
    if (value === undefined) return;

    setSaveStatus('saving');
    if (file === 'html') {
      setHtmlCode(value);
      const combined = `index.html:${value}\nstyles.css:${cssCode}`;
      setCode(combined);
      debouncedSaveProgress(combined);
    } else if (file === 'css') {
      setCssCode(value);
      const combined = `index.html:${htmlCode}\nstyles.css:${value}`;
      setCode(combined);
      debouncedSaveProgress(combined);
    } else {
      setCode(value);
      debouncedSaveProgress(value);
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

  const debouncedSaveProgress = useRef(debounce(saveProgress, 2000)).current;

  const checkCode = async () => {
    if (!currentTutorial || !isAuthenticated) return;
    setCheckLoading(true);
    try {
      const codeToCheck = currentTutorial.steps[currentStepIndex].fileType === 'html+css'
        ? `index.html:${htmlCode}\nstyles.css:${cssCode}`
        : code;
      const response = await tutorialApi.post<{ success: boolean; output: string }>('/check-code/', {
        tutorialId: currentTutorial.id,
        stepIndex: currentStepOrder,
        code: codeToCheck,
      });
      const result = response.data;
      setOutput(result.output);
      setIsSuccess(result.success);
      if (result.success) {
        const updatedProfile = await getUserProfile();
        await saveProgress(codeToCheck);
        setOutput(`${result.output} | New XP: ${updatedProfile.profile.total_xp}`);
        setTrivia(currentTutorial.steps[currentStepIndex].trivia || 'No trivia available.');
      } else {
        setTrivia('');
      }
    } catch (error) {
      console.error('Error checking code:', error);
      setOutput('Error checking your code. Please try again.');
      setTrivia('');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleNext = () => {
    if (!currentTutorial || !isSuccess) return;
    if (currentStepIndex === currentTutorial.steps.length - 1) {
      completeCurrentTutorial();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setCurrentStepOrder(currentTutorial.steps[nextIndex].order);
      const nextCode = currentTutorial.steps[nextIndex].initialCode;
      setCode(nextCode);
      if (currentTutorial.steps[nextIndex].fileType === 'html+css') {
        const [htmlPart, cssPart] = nextCode.split('\nstyles.css:');
        setHtmlCode(htmlPart?.replace('index.html:', '') || '');
        setCssCode(cssPart || '');
      } else {
        setHtmlCode('');
        setCssCode('');
      }
      setActiveTab(0); // Reset to first tab
      setIsSolutionVisible(false);
      setShowHint(false);
      setOutput('');
      setIsSuccess(false);
      setTrivia('');
    }
  };

  const completeCurrentTutorial = async () => {
    if (!currentTutorial || !isAuthenticated) return;
    try {
      const codeToSave = currentTutorial.steps[currentStepIndex].fileType === 'html+css'
        ? `index.html:${htmlCode}\nstyles.css:${cssCode}`
        : code;
      const response = await tutorialApi.post<{ nextTutorial: number | null }>(
        `/tutorials/${currentTutorial.id}/complete/`
      );
      const result = response.data;
      const updatedProfile = await getUserProfile();
      if (result.nextTutorial) {
        const nextTutorial = tutorials.find((t) => t.id === result.nextTutorial);
        if (nextTutorial) {
          setTimeout(() => {
            navigate(`/tutorials/${nextTutorial.id}`);
            setCurrentTutorial(nextTutorial);
            setCurrentStepIndex(0);
            setCurrentStepOrder(nextTutorial.steps[0].order);
            const initialCode = nextTutorial.steps[0].initialCode;
            setCode(initialCode);
            if (nextTutorial.steps[0].fileType === 'html+css') {
              const [htmlPart, cssPart] = initialCode.split('\nstyles.css:');
              setHtmlCode(htmlPart?.replace('index.html:', '') || '');
              setCssCode(cssPart || '');
            } else {
              setHtmlCode('');
              setCssCode('');
            }
            setActiveTab(0);
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
    const solutionCode = currentTutorial.steps[currentStepIndex].solutionCode;
    setCode(solutionCode);
    if (currentTutorial.steps[currentStepIndex].fileType === 'html+css') {
      const [htmlPart, cssPart] = solutionCode.split('\nstyles.css:');
      setHtmlCode(htmlPart?.replace('index.html:', '') || '');
      setCssCode(cssPart || '');
    }
  };

  const resetCode = () => {
    if (!currentTutorial) return;
    const initialCode = currentTutorial.steps[currentStepIndex].initialCode;
    setCode(initialCode);
    setIsSolutionVisible(false);
    if (currentTutorial.steps[currentStepIndex].fileType === 'html+css') {
      const [htmlPart, cssPart] = initialCode.split('\nstyles.css:');
      setHtmlCode(htmlPart?.replace('index.html:', '') || '');
      setCssCode(cssPart || '');
    }
  };

  const navigateToStep = (index: number) => {
    if (!currentTutorial || index < 0 || index >= currentTutorial.steps.length) return;
    setCurrentStepIndex(index);
    setCurrentStepOrder(currentTutorial.steps[index].order);
    const initialCode = currentTutorial.steps[index].initialCode || '';
    setCode(initialCode);
    if (currentTutorial.steps[index].fileType === 'html+css') {
      const [htmlPart, cssPart] = initialCode.split('\nstyles.css:');
      setHtmlCode(htmlPart?.replace('index.html:', '') || '');
      setCssCode(cssPart || '');
    } else {
      setHtmlCode('');
      setCssCode('');
    }
    setActiveTab(0); // Reset to first tab
    setShowHint(false);
    setIsSolutionVisible(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/tutorials')} sx={{ mt: 2 }}>
          Back to Tutorials
        </Button>
      </Box>
    );
  }

  const currentStep = currentTutorial.steps[currentStepIndex];
  const fileType = currentStep.fileType || 'python';
  const totalXp = user?.profile?.total_xp || 0;

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on' as const,
    automaticLayout: true,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', width: '100vw', paddingTop: "64px", boxSizing: "border-box", backgroundColor: '#1e1e1e' }}>
      {/* Left Section - Tutorial Instructions */}
      <Paper elevation={3} sx={{ width: isMobile ? '100%' : '30%', maxHeight: isMobile ? '40vh' : 'none', display: 'flex', flexDirection: 'column', backgroundColor: '#252526', color: '#cccccc', borderRight: '1px solid #333', overflow: 'hidden' }}>
        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/tutorials')} sx={{ mr: 2, color: '#cccccc', borderColor: '#555', '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
              Back
            </Button>
            <Typography variant="h5" sx={{ color: '#e0e0e0' }}>
              {currentTutorial.title} <Typography variant="subtitle2" component="span" sx={{ color: '#4fc3f7' }}>(XP: {totalXp})</Typography>
            </Typography>
          </Box>
          <Stepper activeStep={currentStepIndex} orientation="horizontal" sx={{ mb: 2, '& .MuiStepLabel-label': { color: '#999' }, '& .MuiStepLabel-label.Mui-active': { color: '#fff' }, '& .MuiStepLabel-label.Mui-completed': { color: '#4caf50' }, '& .MuiStepIcon-root': { color: '#555' }, '& .MuiStepIcon-root.Mui-active': { color: '#1976d2' }, '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' } }}>
            {currentTutorial.steps.map((step, index) => (
              <Step key={step.id} completed={index < currentStepIndex}>
                <StepLabel onClick={() => index <= currentStepIndex && navigateToStep(index)} sx={{ cursor: index <= currentStepIndex ? 'pointer' : 'not-allowed', opacity: index > currentStepIndex ? 0.5 : 1 }}>
                  {index + 1}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography variant="h6" sx={{ mt: 2, color: '#e0e0e0' }}>{currentStep.title}</Typography>
          <Box sx={{ mt: 2, mb: 2, color: '#cccccc', '& a': { color: '#4fc3f7' }, '& code': { backgroundColor: '#333', padding: '2px 6px', borderRadius: '3px', color: '#ce9178' } }} dangerouslySetInnerHTML={{ __html: currentStep.content }} />
          {trivia && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#2d2d2d', borderRadius: 1, borderLeft: '3px solid #4fc3f7' }}>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                <strong style={{ color: '#4fc3f7' }}>Trivia:</strong> {trivia}
              </Typography>
            </Box>
          )}
        </Box>
        {/* Fixed bottom action bar — always visible */}
        <Box sx={{ borderTop: '1px solid #444', backgroundColor: '#2d2d2d', p: 1.5, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={showHint ? <Lightbulb /> : <LightbulbOutlined />}
              onClick={() => setShowHint(!showHint)}
              sx={{ color: '#cccccc', borderColor: '#555', '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' } }}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
          </Box>
          <Collapse in={showHint}>
            <Stack spacing={1} sx={{ mb: 1 }}>
              <Button variant="outlined" size="small" startIcon={<VisibilityOutlined />} onClick={showSolution} disabled={isSolutionVisible} fullWidth sx={{ color: '#cccccc', borderColor: '#555', '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                Show Solution
              </Button>
              <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={resetCode} fullWidth sx={{ color: '#cccccc', borderColor: '#555', '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                Reset Code
              </Button>
            </Stack>
          </Collapse>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" size="small" startIcon={<ChevronLeft />} disabled={currentStepIndex === 0} onClick={() => navigateToStep(currentStepIndex - 1)}>
              Previous
            </Button>
            <Button variant="contained" size="small" endIcon={<ChevronRight />} disabled={!isSuccess} onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Middle Section - Code Editors with Tabs */}
      <Box sx={{ width: isMobile ? '100%' : '40%', minHeight: isMobile ? '300px' : 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{ p: 1, backgroundColor: '#1e1e1e', color: 'white', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="body2">
            {fileType === 'html+css' ? (activeTab === 0 ? 'index.html' : 'styles.css') : fileType === 'html' ? 'index.html' : fileType === 'css' ? 'styles.css' : fileType === 'js' ? 'script.js' : 'models.py'}
          </Typography>
          {saveStatus === 'saving' && <Typography variant="caption">Saving...</Typography>}
          {saveStatus === 'saved' && <Typography variant="caption">Saved</Typography>}
          {saveStatus === 'error' && <Typography variant="caption" color="error">Error saving</Typography>}
        </Paper>
        {fileType === 'html+css' && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              backgroundColor: '#252526',
              borderBottom: '1px solid #333',
              '& .MuiTab-root': {
                color: 'white',
                padding: '6px 16px',
                minWidth: '100px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#333',
                },
              },
              '& .Mui-selected': {
                color: '#fff',
                backgroundColor: '#1e1e1e',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2', // Primary color
              },
            }}
          >
            <Tab label="index.html" />
            <Tab label="styles.css" />
          </Tabs>
        )}
        <Box sx={{ flex: 1 }}>
          {fileType === 'html+css' ? (
            <>
              {activeTab === 0 && (
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={htmlCode}
                  onChange={(value) => handleCodeChange(value, 'html')}
                  theme="vs-dark"
                  options={editorOptions}
                />
              )}
              {activeTab === 1 && (
                <Editor
                  height="100%"
                  defaultLanguage="css"
                  value={cssCode}
                  onChange={(value) => handleCodeChange(value, 'css')}
                  theme="vs-dark"
                  options={editorOptions}
                />
              )}
            </>
          ) : (
            <Editor
              height="100%"
              defaultLanguage={fileType}
              value={code}
              onChange={(value) => handleCodeChange(value, 'single')}
              theme="vs-dark"
              options={editorOptions}
            />
          )}
        </Box>
        <Paper
          elevation={0}
          sx={{ p: 1, borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: 1, backgroundColor: '#1e1e1e' }}
        >
          <Button variant="outlined" color="error" startIcon={<Refresh />} onClick={resetCode} size="small">
            Reset
          </Button>
          <Button variant="contained" color="primary" startIcon={<PlayArrow />} onClick={checkCode} size="small" disabled={checkLoading}>
            {checkLoading ? 'Checking...' : fileType === 'html' || fileType === 'css' || fileType === 'html+css' ? 'Check Code' : 'Run Code'}
          </Button>
        </Paper>
      </Box>

      {/* Right Section - Output/Fake Browser */}
      <Paper elevation={3} sx={{ width: isMobile ? '100%' : '30%', minHeight: isMobile ? '300px' : 'auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#1e1e1e', borderLeft: '1px solid #333' }}>
        <Box sx={{ p: 1, backgroundColor: '#2d2d2d', borderBottom: '1px solid #444', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
          </Box>
          <Box sx={{ flex: 1, backgroundColor: '#3c3c3c', borderRadius: 1, px: 1, py: 0.5, fontSize: '0.75rem', color: '#999' }}>
            http://localhost:8000/
          </Box>
        </Box>
        <Box sx={{ flex: 1, backgroundColor: '#ffffffff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {(fileType === 'html' || fileType === 'css' || fileType === 'html+css') ? (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <iframe title="output" srcDoc={renderedOutput} sandbox="allow-same-origin" style={{ width: '100%', height: '100%', border: 'none' }} />
            </Box>
          ) : output ? (
            <Box sx={{ p: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflow: 'auto', backgroundColor: isSuccess ? '#1b3a1b' : '#3a1b1b', color: '#cccccc', flex: 1 }}>
              <pre style={{ margin: 0, color: 'inherit' }}>{output}</pre>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#666' }}>
              <Typography variant="body2">Run your code to see the output here</Typography>
            </Box>
          )}
          {output && (
            <Alert severity={isSuccess ? 'success' : 'error'} sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: 0 }}>
              {output}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TutorialLayout;