// src/pages/admin/AdminAuditLogPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Skeleton, Alert, alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as ClassroomIcon,
  Feedback as FeedbackIcon,
  Campaign as AnnouncementIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { getAuditLog, AuditLogEntry } from '../../api/admin';

const typeColors: Record<string, string> = {
  user: '#315a7d',
  classroom: '#256d4f',
  feedback: '#f97316',
  announcement: '#315a7d',
};

const typeIcons: Record<string, React.ReactNode> = {
  user: <PersonIcon sx={{ fontSize: 14 }} />,
  classroom: <ClassroomIcon sx={{ fontSize: 14 }} />,
  feedback: <FeedbackIcon sx={{ fontSize: 14 }} />,
  announcement: <AnnouncementIcon sx={{ fontSize: 14 }} />,
};

const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLog();
        setLogs(data);
      } catch {
        setError('Failed to load audit log.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const cellSx = { color: 'var(--mui-palette-text-primary)', borderColor: 'var(--mui-palette-background-paper)', py: 1.5 };
  const headerSx = { color: 'var(--mui-palette-text-secondary)', borderColor: 'var(--mui-palette-background-paper)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' as const };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: 'var(--mui-palette-text-primary)', fontWeight: 600, mb: 0.5 }}>Activity Log</Typography>
      <Typography variant="body2" sx={{ color: 'var(--mui-palette-text-secondary)', mb: 3 }}>
        Audit trail of all admin actions on the platform.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: alpha('#ef4444', 0.1), color: '#fca5a5', border: '1px solid', borderColor: alpha('#ef4444', 0.3) }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: 'var(--mui-palette-background-paper)', borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>Time</TableCell>
              <TableCell sx={headerSx}>Admin</TableCell>
              <TableCell sx={headerSx}>Action</TableCell>
              <TableCell sx={headerSx}>Target</TableCell>
              <TableCell sx={headerSx}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j} sx={cellSx}><Skeleton variant="text" sx={{ bgcolor: 'var(--mui-palette-divider)' }} width={j === 2 ? 220 : 120} /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ ...cellSx, textAlign: 'center', py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: 'var(--mui-palette-divider)', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ color: '#475569' }}>No admin actions recorded yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} sx={{ '&:hover': { bgcolor: alpha('#256d4f', 0.03) }, transition: 'background-color 0.15s ease' }}>
                  <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)' }}>{formatDate(log.timestamp)}</Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{log.admin_email}</Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography variant="body2">{log.action}</Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Chip
                      icon={typeIcons[log.target_type] as React.ReactElement || undefined}
                      label={log.target_type}
                      size="small"
                      sx={{
                        bgcolor: alpha(typeColors[log.target_type] || 'var(--mui-palette-text-secondary)', 0.15),
                        color: typeColors[log.target_type] || 'var(--mui-palette-text-secondary)',
                        fontWeight: 600, fontSize: '0.7rem', textTransform: 'capitalize',
                      }}
                    />
                    {log.target_id && (
                      <Typography variant="caption" sx={{ color: '#475569', ml: 0.5 }}>#{log.target_id}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)' }}>{log.details || '—'}</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminAuditLogPage;
