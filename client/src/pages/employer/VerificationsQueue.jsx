import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import verificationApi from '../../api/verification';

export default function EmployerVerificationsQueue() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await verificationApi.getVerificationsQueue();
      if (res.data.success) {
        setQueue(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch verification queue', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResend = async (id, contact) => {
    try {
      const res = await verificationApi.resendReminder(id);
      setSnackbar({ open: true, message: res.data.message || `Verification reminder resent to ${contact}!`, severity: 'success' });
      fetchQueue();
    } catch {
      setSnackbar({ open: true, message: 'Failed to resend reminder', severity: 'error' });
    }
  };

  const filteredQueue = queue.filter(
    (item) =>
      item.traineeName?.toLowerCase().includes(search.toLowerCase()) ||
      item.employerName?.toLowerCase().includes(search.toLowerCase()) ||
      item.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Employer Verification Audit Queue
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>
            Real-time audit log of external employer confirmations, verification links, and dispatch status.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchQueue}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
        >
          Refresh Queue
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ borderRadius: '14px', border: '1px solid #ECEEF4', mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            size="small"
            placeholder="Search by trainee, company, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Verification Queue Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B' }}>TRAINEE CANDIDATE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B' }}>REPORTED EMPLOYER & ROLE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B' }}>CLAIMED WAGE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton height={36} />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredQueue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
                  No verification claims in queue
                </TableCell>
              </TableRow>
            ) : (
              filteredQueue.map((item) => {
                const isVerified = item.status === 'verified';
                const isDisputed = item.status === 'disputed';

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>
                        {item.traineeName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {item.traineePhone || 'Outcome ID Verified'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>
                        {item.employerName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#6C5CE7', fontWeight: 600 }}>
                        {item.role}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Dispatch: {item.employerContact}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#10B981', fontSize: '0.88rem' }}>
                        {item.claimedWage}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                        From {item.claimedStartDate || 'Recent'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={
                          isVerified ? (
                            <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                          ) : isDisputed ? (
                            <WarningAmberIcon sx={{ fontSize: '14px !important' }} />
                          ) : (
                            <HourglassEmptyIcon sx={{ fontSize: '14px !important' }} />
                          )
                        }
                        label={item.status?.toUpperCase()}
                        size="small"
                        color={isVerified ? 'success' : isDisputed ? 'warning' : 'primary'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Open Single-Use Public Verification Page">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LaunchIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => window.open(`/verify/${item.verifyToken}`, '_blank')}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Verify Link
                          </Button>
                        </Tooltip>

                        {!isVerified && (
                          <Tooltip title="Resend Notification Link">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<SendIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => handleResend(item.id, item.employerContact)}
                              sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#6C5CE7' }}
                            >
                              Remind
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
