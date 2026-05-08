import { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import WindowIcon from '@mui/icons-material/Window';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DownloadLink {
  platform: string;
  url: string;
}

const DownloadPage = () => {
  const [links, setLinks] = useState<DownloadLink[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Download — DjangoQuest';
    axios.get('/api/patchnotes/downloads/').then(res => {
      setLinks(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  const getLink = (platform: string) => links.find(l => l.platform === platform)?.url;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b0f19 0%, #1a2333 100%)', color: 'white', pt: 12, pb: 8 }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h2" align="center" sx={{ fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Download <span style={{ color: '#44b78b' }}>DjangoQuest</span>
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 8, color: '#a0aec0' }}>
            Choose your platform and begin your coding adventure today.
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {/* Windows Download */}
          <Grid item xs={12} md={5}>
            <motion.div whileHover={{ translateY: -10 }} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <CardContent sx={{ p: 5, textAlign: 'center' }}>
                  <WindowIcon sx={{ fontSize: 80, color: '#00a4ef', mb: 3 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>Windows</Typography>
                  <Typography variant="body1" sx={{ color: '#a0aec0', mb: 4 }}>
                    Windows 10 or 11 (64-bit)<br/>Requires 2GB RAM and 500MB storage.
                  </Typography>
                  {getLink('windows') ? (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      component="a"
                      href={getLink('windows') || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ backgroundColor: '#44b78b', color: '#1a2333', fontWeight: 'bold', py: 1.5, '&:hover': { backgroundColor: '#3da57d' }, textDecoration: 'none' }}
                    >
                      Download for Windows
                    </Button>
                  ) : (
                    <Button variant="outlined" size="large" fullWidth disabled
                      sx={{ borderColor: '#334155', color: '#64748b', py: 1.5 }}>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* MacOS Download */}
          <Grid item xs={12} md={5}>
            <motion.div whileHover={{ translateY: -10 }} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <CardContent sx={{ p: 5, textAlign: 'center' }}>
                  <AppleIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>macOS</Typography>
                  <Typography variant="body1" sx={{ color: '#a0aec0', mb: 4 }}>
                    macOS 10.15+ (Intel & Apple Silicon)<br/>Requires 2GB RAM and 500MB storage.
                  </Typography>
                  {getLink('macos') ? (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      component="a"
                      href={getLink('macos') || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ backgroundColor: '#44b78b', color: '#1a2333', fontWeight: 'bold', py: 1.5, '&:hover': { backgroundColor: '#3da57d' }, textDecoration: 'none' }}
                    >
                      Download for macOS
                    </Button>
                  ) : (
                    <Button variant="outlined" size="large" fullWidth disabled
                      sx={{ borderColor: '#334155', color: '#64748b', py: 1.5 }}>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
          <Box sx={{ mt: 10, textAlign: 'center', p: 4, background: 'rgba(68, 183, 139, 0.1)', borderRadius: 4, border: '1px dashed #44b78b' }}>
            <Typography variant="h6" sx={{ color: '#44b78b', mb: 1 }}>How to Play</Typography>
            <Typography variant="body2" sx={{ color: '#a0aec0', maxWidth: 600, mx: 'auto', mb: 2 }}>
              Once downloaded, extract the ZIP archive and run the executable.
              The game manages its own sync and local saves, interacting securely with your dashboard account!
            </Typography>
            <Button variant="text" onClick={() => navigate('/patch-notes')} sx={{ color: '#818cf8', textTransform: 'none' }}>
              View Patch Notes →
            </Button>
          </Box>
        </motion.div>

      </Container>
    </Box>
  );
};

export default DownloadPage;
