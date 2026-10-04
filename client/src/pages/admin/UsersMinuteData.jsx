import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';

import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useColorMode } from '../../context/ThemeContext';

function formatMinute(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

const ROLE_COLORS = {
  admin: { bg: 'rgba(235, 77, 75, 0.12)', text: '#D63031', border: '#FF7675' },
  manager: { bg: 'rgba(108, 92, 231, 0.12)', text: '#6C5CE7', border: '#A29BFE' },
  supervisor: { bg: 'rgba(9, 132, 227, 0.12)', text: '#0984E3', border: '#74B9FF' },
  employer: { bg: 'rgba(0, 184, 148, 0.12)', text: '#00B894', border: '#55EFC4' },
  provider: { bg: 'rgba(253, 203, 110, 0.18)', text: '#E17055', border: '#FDCB6E' },
  trainee: { bg: 'rgba(113, 201, 206, 0.15)', text: '#1E6F73', border: '#71C9CE' },
};

const STATUS_COLORS = {
  active: { bg: '#E6F4EA', text: '#137333' },
  pending_approval: { bg: '#FEF7E0', text: '#B06000' },
  suspended: { bg: '#FCE8E6', text: '#C5221F' },
  inactive: { bg: '#F1F3F4', text: '#5F6368' },
};

export default function UsersMinuteData() {
  const { user: currentUser } = useAuth();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleCounts, setRoleCounts] = useState({});
  const [pendingCount, setPendingCount] = useState(0);

  // Filters
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Pending Approvals, 2: Activity Log
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Minute Inspector Dialog
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);

  // Action status
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const isSuperAdmin = currentUser?.role === 'admin';

  /* ── Fetch Users ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let activeStatus = statusFilter;
      if (tabValue === 1) {
        activeStatus = 'pending_approval';
      }

      const params = {
        page,
        limit: 50,
        role: roleFilter,
        status: activeStatus,
        search: search.trim() || undefined,
      };

      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setPendingCount(res.data.pendingCount || 0);
      setRoleCounts(res.data.countsByRole || {});
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to fetch users audit data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, tabValue, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ── Inspect granular minute data ── */
  const handleInspectUser = async (userId) => {
    setInspectorOpen(true);
    setInspectorLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/details`);
      setInspectorData(res.data);
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to load user granular details',
        severity: 'error',
      });
      setInspectorOpen(false);
    } finally {
      setInspectorLoading(false);
    }
  };

  /* ── Update user role (Super Admin only) ── */
  const handleRoleChange = async (userId, newRole) => {
    setActionLoadingId(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSnack({
        open: true,
        message: res.data.message || `Role updated to ${newRole}`,
        severity: 'success',
      });
      fetchUsers();
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to update role',
        severity: 'error',
      });
    } finally {
      setActionLoadingId('');
    }
  };

  /* ── Approve or Suspend user ── */
  const handleStatusChange = async (userId, newStatus) => {
    setActionLoadingId(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setSnack({
        open: true,
        message: res.data.message || `Status updated to ${newStatus}`,
        severity: 'success',
      });
      await fetchUsers();
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to update status',
        severity: 'error',
      });
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ManageAccountsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              User Directory & Minute Data Audit
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Minute-by-minute activity logs, user verification queue, and role access governance.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {pendingCount > 0 && (
            <Chip
              icon={<HourglassEmptyIcon style={{ fontSize: 16 }} />}
              label={`${pendingCount} Pending Approval`}
              color="warning"
              onClick={() => setTabValue(1)}
              sx={{ fontWeight: 700, cursor: 'pointer' }}
            />
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            size="small"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* ── Stat Cards Summary ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Users', count: total, icon: <PeopleAltIcon />, color: '#6C5CE7' },
          { label: 'Trainees', count: roleCounts.trainee || 0, icon: <PersonIcon />, color: '#71C9CE' },
          { label: 'Employers', count: roleCounts.employer || 0, icon: <BusinessIcon />, color: '#00B894' },
          { label: 'Providers', count: roleCounts.provider || 0, icon: <SchoolIcon />, color: '#E17055' },
          { label: 'Managers / Supervisors', count: (roleCounts.manager || 0) + (roleCounts.supervisor || 0), icon: <SupervisorAccountIcon />, color: '#0984E3' },
          { label: 'Pending Approvals', count: pendingCount, icon: <HourglassEmptyIcon />, color: '#D63031', alert: pendingCount > 0 },
        ].map((card, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                border: card.alert ? '1.5px solid #FF7675' : `1px solid ${isDark ? 'rgba(203,241,245,0.08)' : '#ECEEF4'}`,
                boxShadow: card.alert ? '0 4px 14px rgba(214,48,49,0.15)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  {card.label}
                </Typography>
                <Box sx={{ color: card.color, display: 'flex' }}>{card.icon}</Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: card.alert ? '#D63031' : 'text.primary' }}>
                {card.count}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Tabs & Search Filter Bar ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 2,
          mb: 3,
          bgcolor: isDark ? '#111B1E' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(203,241,245,0.08)' : '#ECEEF4'}`,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, val) => {
              setTabValue(val);
              setPage(1);
            }}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' },
            }}
          >
            <Tab label="All Users Directory" />
            <Tab
              label={
                <Badge badgeContent={pendingCount} color="error" sx={{ pr: 1 }}>
                  Pending Approvals
                </Badge>
              }
            />
            <Tab label="Minute Activity & Login Audit" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name, email, phone, outcome ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            sx={{ flexGrow: 1, minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {tabValue !== 1 && (
            <>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Super Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="employer">Employer</MenuItem>
                  <MenuItem value="provider">Provider</MenuItem>
                  <MenuItem value="trainee">Trainee</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending_approval">Pending Approval</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <Button
            variant="contained"
            size="medium"
            onClick={fetchUsers}
            sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
          >
            Apply
          </Button>
        </Box>
      </Paper>

      {/* ── Users Data Table ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: isDark ? '#111B1E' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(203,241,245,0.08)' : '#ECEEF4'}`,
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>USER / IDENTIFIER</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>ROLE</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>REGISTERED MINUTE</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>LAST LOGIN MINUTE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Retrieving real-time user minute logs...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      No users match the selected filters
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting the search query or role/status filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.trainee;
                  const statusStyle = STATUS_COLORS[u.status] || STATUS_COLORS.active;
                  const isActionBusy = actionLoadingId === u._id;

                  return (
                    <TableRow
                      key={u._id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: u.status === 'pending_approval' ? (isDark ? 'rgba(254,247,224,0.04)' : '#FFFEFA') : 'inherit',
                      }}
                    >
                      {/* Name & Contact */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: roleStyle.bg,
                              color: roleStyle.text,
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              border: `1px solid ${roleStyle.border}`,
                            }}
                          >
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {u.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {u.email !== '—' ? u.email : u.phone}
                            </Typography>
                            {u.outcomeId && u.outcomeId !== '—' && (
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.68rem' }}>
                                Outcome ID: {u.outcomeId}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Role Selector / Display */}
                      <TableCell>
                        {isSuperAdmin && u.email !== 'admin@sih.in' ? (
                          <Select
                            size="small"
                            value={u.role}
                            disabled={isActionBusy}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            sx={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              height: 30,
                              bgcolor: roleStyle.bg,
                              color: roleStyle.text,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: roleStyle.border,
                              },
                            }}
                          >
                            <MenuItem value="admin">Super Admin</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="supervisor">Supervisor</MenuItem>
                            <MenuItem value="employer">Employer</MenuItem>
                            <MenuItem value="provider">Provider</MenuItem>
                            <MenuItem value="trainee">Trainee</MenuItem>
                          </Select>
                        ) : (
                          <Chip
                            label={u.role === 'admin' ? 'SUPER ADMIN' : u.role.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              bgcolor: roleStyle.bg,
                              color: roleStyle.text,
                              border: `1px solid ${roleStyle.border}`,
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={(u.status || 'active').replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            bgcolor: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        />
                      </TableCell>

                      {/* Registered Minute */}
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          {formatMinute(u.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Last Login Minute */}
                      <TableCell>
                        <Typography variant="caption" sx={{ color: u.lastLoginAt ? 'text.primary' : 'text.secondary', fontWeight: u.lastLoginAt ? 600 : 400 }}>
                          {formatMinute(u.lastLoginAt)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          {/* Approve Pending */}
                          {u.status === 'pending_approval' && (
                            <Tooltip title="Approve Registration" arrow>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                disabled={isActionBusy}
                                onClick={() => handleStatusChange(u._id, 'active')}
                                sx={{ fontSize: '0.72rem', py: 0.4, fontWeight: 700, textTransform: 'none' }}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                          )}

                          {/* Suspend or Reactivate */}
                          {u.status === 'active' && u.email !== 'admin@sih.in' && (
                            <Tooltip title="Suspend Account" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={isActionBusy}
                                onClick={() => handleStatusChange(u._id, 'suspended')}
                                sx={{ p: 0.6 }}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {u.status === 'suspended' && (
                            <Tooltip title="Reactivate Account" arrow>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={isActionBusy}
                                onClick={() => handleStatusChange(u._id, 'active')}
                                sx={{ p: 0.6 }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Detailed Minute Inspector */}
                          <Tooltip title="Inspect Minute Data & Logs" arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleInspectUser(u._id)}
                              sx={{
                                bgcolor: isDark ? 'rgba(113,201,206,0.1)' : '#F0F9FF',
                                p: 0.6,
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {total > 50 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Pagination
              count={Math.ceil(total / 50)}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              size="medium"
            />
          </Box>
        )}
      </Paper>

      {/* ── Granular Minute Data Inspector Dialog ── */}
      <Dialog
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: isDark ? '#111B1E' : '#FFFFFF',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Granular Minute Data Inspector
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setInspectorOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {inspectorLoading || !inspectorData ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={36} />
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Fetching database records and audit history...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Account Metadata */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: '1px solid #ECEEF4' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                  1. ACCOUNT IDENTITY & PRIVILEGES
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Name:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{inspectorData.user.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Role:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{inspectorData.user.role}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Account Status:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{inspectorData.user.status}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Email:</Typography>
                    <Typography variant="body2">{inspectorData.user.email || '—'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Phone:</Typography>
                    <Typography variant="body2">{inspectorData.user.phone || '—'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Outcome ID:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {inspectorData.user.outcomeId || inspectorData.profile?.outcomeId || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Minute Timestamps Audit */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: '1px solid #ECEEF4' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                  2. EXACT MINUTE AUDIT TIMESTAMPS
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Registered At (Exact Second):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMinute(inspectorData.auditTimestamps?.registeredMinute)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Last Profile Update:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMinute(inspectorData.auditTimestamps?.lastProfileUpdateMinute)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Last Session Login:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMinute(inspectorData.auditTimestamps?.lastLoginMinute)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Approval Timestamp:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMinute(inspectorData.auditTimestamps?.approvedMinute)}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Linked Profile Details */}
              {inspectorData.profile && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: '1px solid #ECEEF4' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                    3. LINKED ENTITY PROFILE
                  </Typography>
                  <Box component="pre" sx={{ m: 0, p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#0A0F11' : '#F1F5F9', fontSize: '0.78rem', overflowX: 'auto' }}>
                    {JSON.stringify(inspectorData.profile, null, 2)}
                  </Box>
                </Box>
              )}

              {/* Linked Enrollments or Jobs */}
              {inspectorData.enrollments && inspectorData.enrollments.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                    4. COURSE ENROLLMENTS & ASSESSMENTS ({inspectorData.enrollments.length})
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #ECEEF4' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Attendance</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inspectorData.enrollments.map((en, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{en.courseId?.title || 'Course'}</TableCell>
                            <TableCell>{en.batchId}</TableCell>
                            <TableCell><Chip label={en.status} size="small" /></TableCell>
                            <TableCell>{en.attendancePct}%</TableCell>
                            <TableCell>{en.assessmentScore}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInspectorOpen(false)} variant="contained" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar Notifications ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
