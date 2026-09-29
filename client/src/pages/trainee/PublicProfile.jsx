import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
  Alert,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import courseApi from '../../api/course';

/* ── Section header with accent bar ── */
function SectionHeader({ children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          width: 32,
          height: 3,
          borderRadius: 2,
          bgcolor: 'primary.main',
          mb: 1,
        }}
      />
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'text.primary',
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
      <CardContent sx={{ py: 2.5, px: 3, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{ fontSize: '1.75rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/** Employment-status → chip colour */
const STATUS_COLOR = {
  employed: 'success',
  'self-employed': 'info',
  apprentice: 'warning',
  unemployed: 'error',
  unknown: 'default',
};

/** Enrollment status → chip colour */
const ENROLL_COLOR = {
  completed: 'success',
  enrolled: 'info',
  dropped: 'error',
};

export default function PublicProfile() {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || 'me';
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    courseApi
      .getTraineeProfile(traineeId)
      .then(({ data }) => {
        setProfile(data.profile);
        setCourses(data.courses);
      })
      .catch(() => setError('Failed to load trainee profile'))
      .finally(() => setLoading(false));
  }, [traineeId]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ flex: 1, borderRadius: 3 }} />
          ))}
        </Box>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Trainee not found'}
        </Alert>
      </Box>
    );
  }

  const completedCourses = courses.filter((c) => c.status === 'completed');
  const ongoingCourses = courses.filter((c) => c.status === 'enrolled');
  const avgScore =
    completedCourses.length > 0
      ? Math.round(
          completedCourses.reduce((s, c) => s + (c.assessmentScore || 0), 0) /
            completedCourses.length
        )
      : 0;

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}
      >
        Back
      </Button>

      {/* ── Profile header card ── */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        {/* Accent bar at top of card */}
        <Box sx={{ height: 4, bgcolor: 'primary.main', borderRadius: '12px 12px 0 0' }} />
        <CardContent sx={{ py: 3, px: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'primary.main',
                fontSize: 28,
                fontWeight: 800,
                borderRadius: '16px',
              }}
              variant="rounded"
            >
              {profile.name?.[0]?.toUpperCase() || '?'}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', mb: 0.5 }}>
                {profile.name}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.district && (
                  <Chip
                    icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
                    label={profile.district}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: '6px' }}
                  />
                )}
                <Chip
                  icon={<WorkIcon sx={{ fontSize: 16 }} />}
                  label={profile.employmentStatus}
                  size="small"
                  color={STATUS_COLOR[profile.employmentStatus] || 'default'}
                  sx={{ borderRadius: '6px' }}
                />
                {profile.jobPoolOptIn && (
                  <Chip
                    label="Open to work"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ borderRadius: '6px' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Stat cards ── */}
      <SectionHeader>Trainee Statistics</SectionHeader>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard
          label="Completed"
          value={completedCourses.length}
          icon={<CheckCircleIcon sx={{ color: '#27AE60', fontSize: 22 }} />}
          color="#27AE60"
        />
        <StatCard
          label="Ongoing"
          value={ongoingCourses.length}
          icon={<AutorenewIcon sx={{ color: '#2D9CDB', fontSize: 22 }} />}
          color="#2D9CDB"
        />
        <StatCard
          label="Avg Score"
          value={completedCourses.length > 0 ? `${avgScore}%` : '—'}
          icon={<TrendingUpIcon sx={{ color: '#F2994A', fontSize: 22 }} />}
          color="#F2994A"
        />
      </Box>

      {/* ── Course history table ── */}
      <SectionHeader>Course History</SectionHeader>
      <Card>
        <CardContent sx={{ p: 0 }}>
          {courses.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 6 }}
            >
              No course records found.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="center">Attendance</TableCell>
                    <TableCell>Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.enrollmentId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              bgcolor:
                                c.status === 'completed'
                                  ? 'rgba(39,174,96,0.1)'
                                  : c.status === 'enrolled'
                                  ? 'rgba(45,156,219,0.1)'
                                  : 'rgba(235,87,87,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <SchoolIcon
                              sx={{
                                fontSize: 18,
                                color:
                                  c.status === 'completed'
                                    ? '#27AE60'
                                    : c.status === 'enrolled'
                                    ? '#2D9CDB'
                                    : '#EB5757',
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                            {c.courseTitle}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{c.providerName}</TableCell>
                      <TableCell>{c.sector || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={c.status}
                          size="small"
                          color={ENROLL_COLOR[c.status] || 'default'}
                          sx={{ borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {c.assessmentScore != null ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={c.assessmentScore}
                              sx={{
                                width: 48,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(0,0,0,0.06)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor:
                                    c.assessmentScore >= 70
                                      ? '#27AE60'
                                      : c.assessmentScore >= 40
                                      ? '#F2994A'
                                      : '#EB5757',
                                },
                              }}
                            />
                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                              {c.assessmentScore}%
                            </Typography>
                          </Box>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.secondary' }}>
                          {c.attendancePct != null ? `${c.attendancePct}%` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                          {c.completedAt
                            ? new Date(c.completedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
