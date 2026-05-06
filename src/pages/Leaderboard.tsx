import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  alpha,
  useTheme,
  Chip,
  Fade,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { getLeaderboard, LeaderboardEntry } from '../api/leaderboard';

const PodiumStep = ({ 
  entry, 
  rank, 
  height, 
  color 
}: { 
  entry?: LeaderboardEntry, 
  rank: number, 
  height: number, 
  color: string 
}) => {
  const theme = useTheme();
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', minWidth: 100, flex: 1, mx: 0.5 }}>
      {entry ? (
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{medals[rank - 1]}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              {entry.username}
            </Typography>
            <Chip 
              label={`${entry.total_xp} XP`} 
              size="small" 
              sx={{ 
                mt: 1, 
                bgcolor: alpha(color, 0.2), 
                color: color, 
                fontWeight: 'bold',
                border: `1px solid ${alpha(color, 0.4)}`
              }} 
            />
          </Box>
        </Fade>
      ) : (
        <Box sx={{ mb: 4 }}><Typography sx={{ color: alpha(theme.palette.common.white, 0.3) }}>Unclaimed</Typography></Box>
      )}
      
      <Box 
        sx={{ 
          width: '100%', 
          height: `${height}px`, 
          bgcolor: alpha(color, 0.8),
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          pt: 1,
          boxShadow: `0 -10px 40px ${alpha(color, 0.3)}`,
          border: `2px solid ${color}`,
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', opacity: 0.5 }}>
          {rank}
        </Typography>
      </Box>
    </Box>
  );
};

export default function Leaderboard() {
  const theme = useTheme();
  const [scope, setScope] = useState<'classroom' | 'global'>('classroom');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(scope)
      .then(r => setEntries(r.entries))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scope]);

  const topThree = entries.slice(0, 3);
  // Pad with undefined if less than 3
  const rank1 = topThree[0];
  const rank2 = topThree[1];
  const rank3 = topThree[2];

  const restList = entries.slice(3);

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 6, minHeight: '100vh' }}>
      
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <TrophyIcon sx={{ fontSize: 60, color: '#FFD700', mb: 1, filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }} />
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>
          Hall of Fame
        </Typography>
        <Typography variant="subtitle1" sx={{ color: alpha(theme.palette.common.white, 0.6), mt: 1 }}>
          The top developers in DjangoQuest
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Tabs
            value={scope}
            onChange={(_, v) => setScope(v)}
            sx={{ 
              bgcolor: alpha(theme.palette.common.white, 0.05),
              borderRadius: 3,
              p: 0.5,
              '& .MuiTab-root': { borderRadius: 2, minHeight: 40 },
              '& .Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.2), color: '#fff !important' },
              '& .MuiTabs-indicator': { display: 'none' } 
            }}
          >
            <Tab label="My Classroom" value="classroom" />
            <Tab label="Global" value="global" />
          </Tabs>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : entries.length === 0 ? (
        <Typography sx={{ color: alpha(theme.palette.common.white, 0.5), textAlign: 'center', mt: 10 }}>
          {scope === 'classroom' ? 'Enroll in a classroom to see rankings.' : 'No data yet.'}
        </Typography>
      ) : (
        <Fade in timeout={800}>
          <Box>
            {/* Podium */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 280, mb: 6, px: 2 }}>
              <PodiumStep entry={rank2} rank={2} height={140} color="#C0C0C0" />
              <PodiumStep entry={rank1} rank={1} height={180} color="#FFD700" />
              <PodiumStep entry={rank3} rank={3} height={110} color="#CD7F32" />
            </Box>

            {/* List */}
            {restList.length > 0 && (
              <Paper 
                sx={{ 
                  bgcolor: alpha(theme.palette.background.paper, 0.6), 
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4, 
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  overflow: 'hidden'
                }}
              >
                {restList.map((entry, idx) => (
                  <Box
                    key={entry.rank}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      px: 3,
                      borderBottom: idx === restList.length - 1 ? 'none' : `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                      bgcolor: entry.is_self ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.03) }
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold', width: 40, color: alpha(theme.palette.common.white, 0.5) }}>
                      {entry.rank}
                    </Typography>
                    
                    <Box sx={{ flex: 1, ml: 2 }}>
                      <Typography sx={{ fontWeight: entry.is_self ? 'bold' : 'normal', color: entry.is_self ? theme.palette.primary.light : '#fff' }}>
                        {entry.username} {entry.is_self && <Chip label="You" size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem', bgcolor: alpha(theme.palette.primary.main, 0.3) }} />}
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.4) }}>
                        {entry.story_progress.toFixed(0)}% progress • {entry.achievements_count} badges
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 'bold', color: alpha(theme.palette.common.white, 0.8) }}>
                      {entry.total_xp} XP
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        </Fade>
      )}

    </Container>
  );
}
