// src/pages/admin/AdminOverviewPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Skeleton, Alert, alpha,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  School as SchoolIcon,
  MeetingRoom as ClassroomIcon,
  Feedback as FeedbackIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { getAdminStats, AdminStats } from '../../api/admin';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => (
  <Card
    sx={{
      bgcolor: '#1e293b',
      border: '1px solid',
      borderColor: '#334155',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: alpha(color, 0.5),
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
      },
    }}
  >
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: '#334155' }} />
          ) : (
            <Typography variant="h3" sx={{ color: '#e2e8f0', fontWeight: 700, mt: 0.5 }}>
              {value.toLocaleString()}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor: alpha(color, 0.15),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Students', value: stats?.total_students || 0, icon: <PeopleIcon />, color: '#818cf8' },
    { title: 'Total Teachers', value: stats?.total_teachers || 0, icon: <SchoolIcon />, color: '#2dd4bf' },
    { title: 'Total Classrooms', value: stats?.total_classrooms || 0, icon: <ClassroomIcon />, color: '#fbbf24' },
    { title: 'Total Feedback', value: stats?.total_feedback || 0, icon: <FeedbackIcon />, color: '#f97316' },
    { title: 'Total Announcements', value: stats?.total_announcements || 0, icon: <CampaignIcon />, color: '#a78bfa' },
  ];

  const totalTypeCount = (stats?.feedback_by_type?.game || 0) + (stats?.feedback_by_type?.website || 0) + (stats?.feedback_by_type?.classroom || 0) || 1;

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600, mb: 0.5 }}>
        Platform Overview
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        Key metrics across the DjangoQuest platform.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' },
          gap: 2.5,
        }}
      >
        {cards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </Box>

      {/* Analytics Row */}
      {stats && !loading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5, mt: 3 }}>
          {/* Feedback by Type */}
          <Card sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="overline" sx={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px' }}>Feedback by Type</Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { label: 'Game', value: stats.feedback_by_type?.game || 0, color: '#818cf8' },
                  { label: 'Website', value: stats.feedback_by_type?.website || 0, color: '#2dd4bf' },
                  { label: 'Classroom', value: stats.feedback_by_type?.classroom || 0, color: '#fbbf24' },
                ].map((item) => (
                  <Box key={item.label} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.8rem' }}>{item.value}</Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${(item.value / totalTypeCount) * 100}%`, bgcolor: item.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Average Ratings */}
          <Card sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="overline" sx={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px' }}>Average Ratings</Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Game', value: stats.avg_game_rating, color: '#818cf8' },
                  { label: 'Website', value: stats.avg_website_rating, color: '#2dd4bf' },
                  { label: 'Classroom', value: stats.avg_classroom_rating, color: '#fbbf24' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>{item.label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="h6" sx={{ color: item.color, fontWeight: 700 }}>{item.value || '—'}</Typography>
                      <Typography sx={{ color: '#fbbf24', fontSize: '1rem' }}>★</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Feedback by Role */}
          <Card sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="overline" sx={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px' }}>Feedback by Role</Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: alpha('#818cf8', 0.1), borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ color: '#818cf8', fontWeight: 700 }}>{stats.feedback_by_role?.student || 0}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Students</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: alpha('#2dd4bf', 0.1), borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ color: '#2dd4bf', fontWeight: 700 }}>{stats.feedback_by_role?.teacher || 0}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Teachers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AdminOverviewPage;
