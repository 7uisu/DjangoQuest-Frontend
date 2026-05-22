import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  Grid,
  Grow,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import StarIcon from '@mui/icons-material/Star';
import { Link, useParams } from 'react-router-dom';
import { resolveBaseUrl } from '../api/axios';
import { getMyClassroomDetail, getMyClassrooms, StudentClassroomSummaryData, StudentCurrentClassroomData } from '../api/dashboard';
import { getLeaderboard } from '../api/leaderboard';
import LoadingSpinner from '../components/LoadingSpinner';

interface AnnouncementItem {
  id: number;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
  target_classrooms?: { id: number; name: string }[];
}

interface LeaderboardItem {
  rank: number;
  username: string;
  total_xp: number;
  story_progress: number;
  achievements_count: number;
  is_self: boolean;
}

/* ─── Styled Components (matching Dashboard.tsx aesthetic) ─── */
const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.18)} 100%)`,
  backdropFilter: 'blur(12px)',
  borderRadius: theme.shape.borderRadius * 2.5,
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.25)}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.35)}`,
  },
}));

const ClassroomCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    transform: 'translateY(-6px) scale(1.01)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.25)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const medals = ['🥇', '🥈', '🥉'];
const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

const MyClassroom: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams();
  const classroomId = id ? Number(id) : null;
  const [classrooms, setClassrooms] = useState<StudentClassroomSummaryData[]>([]);
  const [classroom, setClassroom] = useState<StudentCurrentClassroomData | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [classroomList, classroomData, leaderboardData, announcementResponse] = await Promise.all([
          getMyClassrooms(),
          classroomId ? getMyClassroomDetail(classroomId) : Promise.resolve(null),
          classroomId ? getLeaderboard('classroom', classroomId) : Promise.resolve({ entries: [] }),
          fetch(resolveBaseUrl('/api/announcements/'), {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
            },
          }),
        ]);

        setClassrooms(classroomList);
        setClassroom(classroomData);
        setLeaderboard(leaderboardData.entries || []);
        if (announcementResponse.ok) {
          const data = await announcementResponse.json();
          const items = data.results ?? data ?? [];
          setAnnouncements(classroomId ? items.filter((a: AnnouncementItem) => a.target_classrooms?.some((c) => c.id === classroomId)) : items);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'You are not enrolled in a classroom yet.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classroomId]);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)` }}>
        <LoadingSpinner size={90} message="Loading Classrooms..." />
      </Box>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
        <ClassIcon sx={{ fontSize: 80, color: alpha(theme.palette.common.white, 0.15) }} />
        <Typography variant="h5" sx={{ color: alpha(theme.palette.common.white, 0.6), fontWeight: 600 }}>
          {error || 'You are not enrolled in a classroom yet.'}
        </Typography>
        <Button component={Link} to="/dashboard" variant="outlined" sx={{ color: '#fff', borderColor: alpha('#fff', 0.3), borderRadius: 8, textTransform: 'none' }}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  /* ══════════════════════════════════════════════════════════
     VIEW 1: CLASSROOM LIST (/my-classrooms)
     ══════════════════════════════════════════════════════════ */
  if (!classroomId) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100vw', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, backgroundAttachment: 'fixed', pt: 10, pb: 8 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Fade in timeout={600}>
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}>
                  <ClassIcon sx={{ fontSize: 32, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, letterSpacing: -0.5, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    My Classrooms
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: alpha(theme.palette.common.white, 0.6) }}>
                    Select a classroom to view classmates, leaderboard, and announcements
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>

          {classrooms.length === 0 ? (
            <Fade in timeout={800}>
              <GlassCard sx={{ p: 6, textAlign: 'center' }}>
                <ClassIcon sx={{ fontSize: 72, color: alpha(theme.palette.common.white, 0.12), mb: 2 }} />
                <Typography variant="h5" sx={{ color: alpha(theme.palette.common.white, 0.5), fontWeight: 600, mb: 1 }}>
                  No Classrooms Yet
                </Typography>
                <Typography sx={{ color: alpha(theme.palette.common.white, 0.35) }}>
                  Enroll in a classroom through the game or your dashboard to get started.
                </Typography>
              </GlassCard>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {classrooms.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Grow in timeout={600 + idx * 150}>
                    <ClassroomCard>
                      <CardActionArea
                        component={Link}
                        to={`/my-classrooms/${item.id}`}
                        sx={{ height: '100%' }}
                      >
                        <CardContent sx={{ p: 3, pt: 3.5 }}>
                          {/* Classroom Icon */}
                          <Box sx={{
                            width: 48, height: 48, borderRadius: 2.5, mb: 2,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <SchoolIcon sx={{ color: theme.palette.primary.light, fontSize: 26 }} />
                          </Box>

                          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 1.5, lineHeight: 1.2 }}>
                            {item.name}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip
                              icon={<PersonIcon sx={{ fontSize: 16 }} />}
                              label={item.teacher_name}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.15),
                                color: theme.palette.info.light,
                                fontWeight: 600,
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                '& .MuiChip-icon': { color: theme.palette.info.light },
                              }}
                            />
                            <Chip
                              icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                              label={`${item.student_count} students`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.15),
                                color: theme.palette.success.light,
                                fontWeight: 600,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                '& .MuiChip-icon': { color: theme.palette.success.light },
                              }}
                            />
                          </Box>

                          {/* Subtle "Open" indicator */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: alpha(theme.palette.common.white, 0.35), mt: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                              Open Classroom →
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </ClassroomCard>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    );
  }

  /* ══════════════════════════════════════════════════════════
     VIEW 2: CLASSROOM DETAIL (/my-classrooms/:id)
     ══════════════════════════════════════════════════════════ */
  if (!classroom) {
    return (
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
        <ClassIcon sx={{ fontSize: 80, color: alpha(theme.palette.common.white, 0.15) }} />
        <Typography variant="h5" sx={{ color: alpha(theme.palette.common.white, 0.5), fontWeight: 600 }}>
          Classroom not found
        </Typography>
        <Button component={Link} to="/my-classrooms" variant="outlined" startIcon={<ArrowBackIcon />} sx={{ color: '#fff', borderColor: alpha('#fff', 0.3), borderRadius: 8, textTransform: 'none' }}>
          Back to Classrooms
        </Button>
      </Box>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`, backgroundAttachment: 'fixed', pt: 10, pb: 8 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 5 }}>
            <Button
              component={Link}
              to="/my-classrooms"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: alpha(theme.palette.common.white, 0.6), mb: 2, borderRadius: 6, textTransform: 'none',
                '&:hover': { color: '#fff', bgcolor: alpha(theme.palette.common.white, 0.05) },
              }}
            >
              Back to My Classrooms
            </Button>

            {/* Classroom Title Banner */}
            <GlassCard sx={{ p: 3, mb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
                  flexShrink: 0,
                }}>
                  <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.1 }}>
                    {classroom.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                    <Chip
                      icon={<PersonIcon />}
                      label={`Teacher: ${classroom.teacher_name}`}
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.15),
                        color: theme.palette.info.light,
                        fontWeight: 600,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        '& .MuiChip-icon': { color: theme.palette.info.light },
                      }}
                    />
                    <Chip
                      icon={<GroupsIcon />}
                      label={`${classroom.student_count} students`}
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.15),
                        color: theme.palette.success.light,
                        fontWeight: 600,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        '& .MuiChip-icon': { color: theme.palette.success.light },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        <Grid container spacing={3}>

          {/* ── Classmates Panel ── */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={800}>
              <GlassCard sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <GroupsIcon sx={{ color: theme.palette.primary.light }} />
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
                    Classmates
                  </Typography>
                  <Chip
                    label={classroom.classmates.length}
                    size="small"
                    sx={{ ml: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.light, fontWeight: 'bold' }}
                  />
                </Box>

                <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.06), mb: 1 }} />

                <List sx={{ maxHeight: 400, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.common.white, 0.15), borderRadius: 3 } }}>
                  {classroom.classmates.map((mate, idx) => (
                    <ListItem
                      key={mate.id}
                      sx={{
                        px: 1.5, py: 1, borderRadius: 2, mb: 0.5,
                        bgcolor: mate.is_self ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                        border: mate.is_self ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}` : '1px solid transparent',
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.04) },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 40, height: 40,
                          bgcolor: mate.is_self
                            ? alpha(theme.palette.primary.main, 0.3)
                            : alpha(theme.palette.common.white, 0.08),
                          color: mate.is_self ? theme.palette.primary.light : alpha(theme.palette.common.white, 0.7),
                          fontWeight: 700, fontSize: 16,
                          border: mate.is_self ? `2px solid ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                        }}>
                          {mate.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ color: '#fff', fontWeight: mate.is_self ? 700 : 500, fontSize: '0.95rem' }}>
                              {mate.username}
                            </Typography>
                            {mate.is_self && (
                              <Chip label="You" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.primary.main, 0.3), color: theme.palette.primary.light }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.45) }}>
                            {mate.total_xp} XP
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </GlassCard>
            </Grow>
          </Grid>

          {/* ── Leaderboard Panel ── */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1000}>
              <GlassCard sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: '#FFD700' }} />
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
                    Classroom Leaderboard
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.06), mb: 2 }} />

                {leaderboard.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <EmojiEventsIcon sx={{ fontSize: 56, color: alpha(theme.palette.common.white, 0.1), mb: 1 }} />
                    <Typography sx={{ color: alpha(theme.palette.common.white, 0.4) }}>
                      No leaderboard entries yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Mini Podium */}
                    {topThree.length > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 1, mb: 3, height: 140 }}>
                        {/* 2nd place */}
                        {topThree.length > 1 && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{medals[1]}</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center', mb: 0.5 }}>{topThree[1].username}</Typography>
                            <Chip label={`${topThree[1].total_xp} XP`} size="small" sx={{ bgcolor: alpha('#C0C0C0', 0.2), color: '#C0C0C0', fontWeight: 'bold', fontSize: '0.7rem', border: `1px solid ${alpha('#C0C0C0', 0.3)}` }} />
                            <Box sx={{ width: '100%', height: 50, bgcolor: alpha('#C0C0C0', 0.6), borderRadius: '6px 6px 0 0', mt: 1, boxShadow: `0 -6px 20px ${alpha('#C0C0C0', 0.2)}` }} />
                          </Box>
                        )}
                        {/* 1st place */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <Typography sx={{ fontSize: '1.6rem', mb: 0.5 }}>{medals[0]}</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', mb: 0.5 }}>{topThree[0].username}</Typography>
                          <Chip label={`${topThree[0].total_xp} XP`} size="small" sx={{ bgcolor: alpha('#FFD700', 0.2), color: '#FFD700', fontWeight: 'bold', fontSize: '0.7rem', border: `1px solid ${alpha('#FFD700', 0.35)}` }} />
                          <Box sx={{ width: '100%', height: 70, bgcolor: alpha('#FFD700', 0.65), borderRadius: '6px 6px 0 0', mt: 1, boxShadow: `0 -8px 30px ${alpha('#FFD700', 0.25)}` }} />
                        </Box>
                        {/* 3rd place */}
                        {topThree.length > 2 && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <Typography sx={{ fontSize: '1.3rem', mb: 0.5 }}>{medals[2]}</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center', mb: 0.5 }}>{topThree[2].username}</Typography>
                            <Chip label={`${topThree[2].total_xp} XP`} size="small" sx={{ bgcolor: alpha('#CD7F32', 0.2), color: '#CD7F32', fontWeight: 'bold', fontSize: '0.7rem', border: `1px solid ${alpha('#CD7F32', 0.3)}` }} />
                            <Box sx={{ width: '100%', height: 35, bgcolor: alpha('#CD7F32', 0.6), borderRadius: '6px 6px 0 0', mt: 1, boxShadow: `0 -4px 16px ${alpha('#CD7F32', 0.2)}` }} />
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Rest of leaderboard */}
                    {restList.length > 0 && (
                      <Box sx={{ maxHeight: 220, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.common.white, 0.15), borderRadius: 3 } }}>
                        {restList.map((entry) => (
                          <Box
                            key={entry.rank}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, borderRadius: 2, mb: 0.5,
                              bgcolor: entry.is_self ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                              border: entry.is_self ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}` : '1px solid transparent',
                              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.03) },
                            }}
                          >
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem', minWidth: 32, textAlign: 'center', color: alpha(theme.palette.common.white, 0.45) }}>
                              #{entry.rank}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: entry.is_self ? 700 : 500, color: '#fff', fontSize: '0.85rem' }}>
                                {entry.username}
                                {entry.is_self && <Chip label="You" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem', bgcolor: alpha(theme.palette.primary.main, 0.3), color: theme.palette.primary.light }} />}
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.4) }}>
                                {entry.story_progress.toFixed(0)}% • {entry.achievements_count} badges
                              </Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: alpha(theme.palette.common.white, 0.6) }}>
                              {entry.total_xp} XP
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </GlassCard>
            </Grow>
          </Grid>

          {/* ── Announcements Panel ── */}
          <Grid item xs={12}>
            <Grow in timeout={1200}>
              <GlassCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CampaignIcon sx={{ color: theme.palette.warning.light }} />
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
                    Announcements
                  </Typography>
                  {announcements.length > 0 && (
                    <Chip
                      label={announcements.length}
                      size="small"
                      sx={{ ml: 1, bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.light, fontWeight: 'bold' }}
                    />
                  )}
                </Box>

                <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.06), mb: 2 }} />

                {announcements.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <CampaignIcon sx={{ fontSize: 48, color: alpha(theme.palette.common.white, 0.1), mb: 1 }} />
                    <Typography sx={{ color: alpha(theme.palette.common.white, 0.4) }}>
                      No announcements for this classroom yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {announcements.map((announcement) => (
                      <Paper
                        key={announcement.id}
                        sx={{
                          p: 2.5, borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.common.white, 0.03),
                          border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
                          transition: 'border-color 0.2s, background 0.2s',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.common.white, 0.05),
                            borderColor: alpha(theme.palette.warning.main, 0.2),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2, flexShrink: 0, mt: 0.5,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.warning.dark, 0.15)})`,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CampaignIcon sx={{ fontSize: 20, color: theme.palette.warning.light }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                              {announcement.title}
                            </Typography>
                            <Typography sx={{ color: alpha(theme.palette.common.white, 0.7), whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>
                              {announcement.body}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1.5, alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.35) }}>
                                By {announcement.author_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.25) }}>
                                {new Date(announcement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </GlassCard>
            </Grow>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyClassroom;
