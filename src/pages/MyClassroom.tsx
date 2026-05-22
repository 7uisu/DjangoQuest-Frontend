import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useParams } from 'react-router-dom';
import { resolveBaseUrl } from '../api/axios';
import { getMyClassroomDetail, getMyClassrooms, StudentClassroomSummaryData, StudentCurrentClassroomData } from '../api/dashboard';
import { getLeaderboard } from '../api/leaderboard';

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

  if (loading) {
    return (
      <Container sx={{ py: 14, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 14 }}>
        <Alert severity="info">{error || 'You are not enrolled in a classroom yet.'}</Alert>
      </Container>
    );
  }

  if (!classroomId) {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
          My Classrooms
        </Typography>
        <Typography sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 4 }}>
          View the classrooms you are enrolled in, then open one to see classmates, announcements, and leaderboard.
        </Typography>

        {classrooms.length === 0 ? (
          <Alert severity="info">You are not enrolled in a classroom yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {classrooms.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ bgcolor: alpha(theme.palette.common.white, 0.06), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
                  <CardActionArea component={Link} to={`/my-classrooms/${item.id}`}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" icon={<SchoolIcon />} label={item.teacher_name} />
                        <Chip size="small" icon={<GroupsIcon />} label={`${item.student_count} students`} />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  }

  if (!classroom) {
    return (
      <Container sx={{ py: 14 }}>
        <Alert severity="info">Classroom not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Box sx={{ mb: 4 }}>
        <Button component={Link} to="/my-classrooms" startIcon={<ArrowBackIcon />} sx={{ color: alpha(theme.palette.common.white, 0.75), mb: 2 }}>
          Back to Classrooms
        </Button>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
          {classroom.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip icon={<SchoolIcon />} label={`Teacher: ${classroom.teacher_name}`} />
          <Chip icon={<GroupsIcon />} label={`${classroom.student_count} students`} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.common.white, 0.06), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              Classmates
            </Typography>
            <List dense>
              {classroom.classmates.map((mate) => (
                <ListItem key={mate.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar>{mate.username.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${mate.username}${mate.is_self ? ' (You)' : ''}`}
                    secondary={`${mate.total_xp} XP`}
                    primaryTypographyProps={{ color: '#fff', fontWeight: mate.is_self ? 700 : 500 }}
                    secondaryTypographyProps={{ color: alpha(theme.palette.common.white, 0.65) }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.common.white, 0.06), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Classroom Leaderboard
            </Typography>
            {leaderboard.length === 0 ? (
              <Typography sx={{ color: alpha(theme.palette.common.white, 0.65) }}>No leaderboard entries yet.</Typography>
            ) : (
              <List dense>
                {leaderboard.slice(0, 10).map((entry) => (
                  <ListItem key={entry.username} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`#${entry.rank} ${entry.username}${entry.is_self ? ' (You)' : ''}`}
                      secondary={`${entry.total_xp} XP · ${entry.story_progress.toFixed(0)}% progress · ${entry.achievements_count} badges`}
                      primaryTypographyProps={{ color: '#fff', fontWeight: entry.is_self ? 800 : 600 }}
                      secondaryTypographyProps={{ color: alpha(theme.palette.common.white, 0.65) }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.common.white, 0.06), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              <CampaignIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Announcements
            </Typography>
            {announcements.length === 0 ? (
              <Typography sx={{ color: alpha(theme.palette.common.white, 0.65) }}>No announcements yet.</Typography>
            ) : (
              announcements.map((announcement, idx) => (
                <Box key={announcement.id}>
                  {idx > 0 && <Divider sx={{ my: 2, borderColor: alpha(theme.palette.common.white, 0.1) }} />}
                  <Typography sx={{ color: '#fff', fontWeight: 700 }}>{announcement.title}</Typography>
                  <Typography sx={{ color: alpha(theme.palette.common.white, 0.75), whiteSpace: 'pre-wrap' }}>{announcement.body}</Typography>
                  <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.45) }}>
                    Posted by {announcement.author_name}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MyClassroom;
