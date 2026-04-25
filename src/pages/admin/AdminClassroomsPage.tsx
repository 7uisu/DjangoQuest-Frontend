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
          <Typography variant="h5" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Classrooms</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Browse all classrooms across the platform.</Typography>
        </Box>
        <Button startIcon={<SearchIcon />} size="small" onClick={() => downloadExport('classrooms')}
          variant="outlined" sx={{ color: '#94a3b8', borderColor: '#334155', textTransform: 'none' }}>
          Export CSV
        </Button>
      </Box>

      <TextField
        placeholder="Search classrooms or teachers..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }} /></InputAdornment>,
        }}
        sx={{
          mb: 3, width: 350,
          '& .MuiInputBase-root': { color: '#e2e8f0', bgcolor: '#1e293b', borderRadius: 2 },
          '& fieldset': { borderColor: '#334155' },
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
            <Paper key={i} sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155' }}>
              <Skeleton variant="text" width={180} sx={{ bgcolor: '#334155' }} />
              <Skeleton variant="text" width={120} sx={{ bgcolor: '#334155', mt: 1 }} />
            </Paper>
          ))
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 4, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155', textAlign: 'center', gridColumn: '1 / -1' }}>
            <SchoolIcon sx={{ fontSize: 48, color: '#334155', mb: 1 }} />
            <Typography sx={{ color: '#475569' }}>No classrooms found.</Typography>
          </Paper>
        ) : (
          filtered.map((c) => (
            <Paper
              key={c.id}
              onClick={() => navigate(`/admin-dashboard/classrooms/${c.id}`)}
              sx={{
                p: 2.5, bgcolor: '#1e293b', borderRadius: 2, border: '1px solid #334155',
                cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': { borderColor: '#818cf8', transform: 'translateY(-2px)', boxShadow: `0 4px 15px ${alpha('#818cf8', 0.15)}` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha('#fbbf24', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SchoolIcon sx={{ color: '#fbbf24', fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>{c.teacher_name}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    icon={<GroupIcon sx={{ fontSize: 14, color: '#2dd4bf !important' }} />}
                    label={c.student_count}
                    size="small"
                    sx={{ bgcolor: alpha('#2dd4bf', 0.15), color: '#2dd4bf', fontWeight: 600, fontSize: '0.7rem' }}
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
