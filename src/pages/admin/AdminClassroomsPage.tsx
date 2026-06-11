// src/pages/admin/AdminClassroomsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Skeleton, Alert, alpha, TextField, InputAdornment, Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminClassrooms, AdminClassroom, downloadExport } from '../../api/admin';

const AdminClassroomsPage: React.FC = () => {
  const [classrooms, setClassrooms] = useState<AdminClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAdminClassrooms();
        setClassrooms(data);
      } catch {
        setError('Failed to load classrooms.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = classrooms.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'var(--mui-palette-text-primary)', fontWeight: 600 }}>Classrooms</Typography>
          <Typography variant="body2" sx={{ color: 'var(--mui-palette-text-secondary)' }}>Browse all classrooms across the platform.</Typography>
        </Box>
        <Button startIcon={<SearchIcon />} size="small" onClick={() => downloadExport('classrooms')}
          variant="outlined" sx={{ color: 'var(--mui-palette-text-secondary)', borderColor: 'var(--mui-palette-divider)', textTransform: 'none' }}>
          Export CSV
        </Button>
      </Box>

      <TextField
        placeholder="Search classrooms or teachers..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'var(--mui-palette-text-secondary)' }} /></InputAdornment>,
        }}
        sx={{
          mb: 3, width: 350,
          '& .MuiInputBase-root': { color: 'var(--mui-palette-text-primary)', bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2 },
          '& fieldset': { borderColor: 'var(--mui-palette-divider)' },
        }}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Paper key={i} sx={{ p: 3, bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)' }}>
              <Skeleton variant="text" width={180} sx={{ bgcolor: 'var(--mui-palette-divider)' }} />
              <Skeleton variant="text" width={120} sx={{ bgcolor: 'var(--mui-palette-divider)', mt: 1 }} />
            </Paper>
          ))
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 4, bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)', textAlign: 'center', gridColumn: '1 / -1' }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'var(--mui-palette-divider)', mb: 1 }} />
            <Typography sx={{ color: '#475569' }}>No classrooms found.</Typography>
          </Paper>
        ) : (
          filtered.map((c) => (
            <Paper
              key={c.id}
              onClick={() => navigate(`/admin-dashboard/classrooms/${c.id}`)}
              sx={{
                p: 2.5, bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 2, border: '1px solid var(--mui-palette-divider)',
                cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': { borderColor: '#256d4f', transform: 'translateY(-2px)', boxShadow: `0 4px 15px ${alpha('#256d4f', 0.15)}` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha('#fbbf24', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SchoolIcon sx={{ color: '#fbbf24', fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ color: 'var(--mui-palette-text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--mui-palette-text-secondary)' }}>{c.teacher_name}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    icon={<GroupIcon sx={{ fontSize: 14, color: '#256d4f !important' }} />}
                    label={c.student_count}
                    size="small"
                    sx={{ bgcolor: alpha('#256d4f', 0.15), color: '#256d4f', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                  <Chip
                    label={`${c.feedback_count} fb`}
                    size="small"
                    sx={{ bgcolor: alpha('#f97316', 0.15), color: '#f97316', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default AdminClassroomsPage;
