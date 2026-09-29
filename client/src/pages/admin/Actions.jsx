import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, Select, FormControl,
  InputLabel, Button, Chip, Skeleton, Snackbar, Alert as MuiAlert,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import adminApi from '../../api/admin';

const severityConfig = {
  critical: { icon: <ErrorIcon />, color: '#C62828', bg: '#FFCDD2', label: 'Critical' },
  warning: { icon: <WarningAmberIcon />, color: '#E65100', bg: '#FFF3E0', label: 'Warning' },
  info: { icon: <InfoIcon />, color: '#1565C0', bg: '#E3F2FD', label: 'Info' },
};

const typeLabels = {
  high_dropout: 'High Dropout',
  failing_course: 'Failing Course',
  chronic_unemployment: 'Chronic Unemployment',
  low_attendance: 'Low Attendance',
  other: 'Other',
};

function StatCard({ title, value, color, loading }) {
  return (
    <Card sx={{ flex: 1, minWidth: 140 }}>
      <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Actions() {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, critical: 0, pending: 0, resolved: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAlerts({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
      });
      setAlerts(data.alerts);
      setCounts(data.counts);
    } catch {
      setSnack({ open: true, message: 'Failed to load alerts', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleAction = async (id, status) => {
    try {
      await adminApi.updateAlert(id, status);
      setSnack({ open: true, message: `Alert ${status}`, severity: 'success' });
      fetchAlerts();
    } catch {
      setSnack({ open: true, message: 'Action failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <NotificationsActiveIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Action Center</Typography>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard title="Total Alerts" value={counts.total} color="text.primary" loading={loading} />
        <StatCard title="Critical" value={counts.critical} color="#C62828" loading={loading} />
        <StatCard title="Pending" value={counts.pending} color="#E65100" loading={loading} />
        <StatCard title="Resolved" value={counts.resolved} color="#2E7D32" loading={loading} />
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="dismissed">Dismissed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Severity</InputLabel>
            <Select value={severityFilter} label="Severity" onChange={(e) => setSeverityFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Alert list */}
      {loading ? (
        [...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
        ))
      ) : alerts.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="h6">All clear!</Typography>
          <Typography variant="body2" color="text.secondary">No alerts match your filters.</Typography>
        </Card>
      ) : (
        alerts.map((alert) => {
          const sev = severityConfig[alert.severity] || severityConfig.info;
          return (
            <Card
              key={alert._id}
              sx={{
                mb: 2,
                borderLeft: `4px solid ${sev.color}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(31,45,46,0.12)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        icon={sev.icon}
                        label={sev.label}
                        size="small"
                        sx={{ bgcolor: sev.bg, color: sev.color, fontWeight: 600 }}
                      />
                      <Chip label={typeLabels[alert.type] || alert.type} size="small" variant="outlined" />
                      {alert.targetName && (
                        <Typography variant="body2" color="text.secondary">
                          • {alert.targetName}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>{alert.message}</Typography>
                    {alert.suggestedAction && (
                      <Typography variant="body2" sx={{ color: 'primary.dark', fontStyle: 'italic' }}>
                        💡 Suggested: {alert.suggestedAction}
                      </Typography>
                    )}
                  </Box>

                  {alert.status === 'pending' ? (
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleAction(alert._id, 'approved')}
                        sx={{ minWidth: 100 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleAction(alert._id, 'dismissed')}
                        sx={{ minWidth: 100 }}
                      >
                        Dismiss
                      </Button>
                    </Box>
                  ) : (
                    <Chip
                      label={alert.status}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        bgcolor: alert.status === 'approved' ? '#C8E6C9' : '#FFECB3',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </CardContent>
            </Card>
          );
        })
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <MuiAlert severity={snack.severity}>{snack.message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
