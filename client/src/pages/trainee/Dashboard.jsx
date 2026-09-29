import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Skeleton,
  Alert,
  TextField,
  InputAdornment,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  Divider,
} from '@mui/material';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useAuth } from '../../context/AuthContext';
import courseApi from '../../api/course';
import CheckInSurveyModal from '../../components/CheckInSurveyModal';

/* ── Sector Theme Configuration ── */
const SECTOR_CONFIG = {
  Automotive: {
    bg: '#FFF7ED',
    color: '#EA580C',
    border: 'rgba(234, 88, 12, 0.2)',
    gradStart: '#F97316',
    gradEnd: '#FED7AA',
  },
  Construction: {
    bg: '#EFF6FF',
    color: '#2563EB',
    border: 'rgba(37, 99, 235, 0.2)',
    gradStart: '#3B82F6',
    gradEnd: '#BFDBFE',
  },
  Healthcare: {
    bg: '#ECFDF5',
    color: '#059669',
    border: 'rgba(5, 150, 105, 0.2)',
    gradStart: '#10B981',
    gradEnd: '#A7F3D0',
  },
  'IT/ITES': {
    bg: '#F5F3FF',
    color: '#7C3AED',
    border: 'rgba(124, 58, 237, 0.2)',
    gradStart: '#6C5CE7',
    gradEnd: '#DDD6FE',
  },
  'Tourism & Hospitality': {
    bg: '#FFF1F2',
    color: '#E11D48',
    border: 'rgba(225, 29, 72, 0.2)',
    gradStart: '#F43F5E',
    gradEnd: '#FECDD3',
  },
  Agriculture: {
    bg: '#F0FDF4',
    color: '#16A34A',
    border: 'rgba(22, 163, 74, 0.2)',
    gradStart: '#22C55E',
    gradEnd: '#BBF7D0',
  },
  Default: {
    bg: '#F8FAFC',
    color: '#64748B',
    border: 'rgba(100, 116, 139, 0.2)',
    gradStart: '#6C5CE7',
    gradEnd: '#C7D2FE',
  },
};

function getSectorTheme(sector) {
  return SECTOR_CONFIG[sector] || SECTOR_CONFIG.Default;
}

/* ── Section header with violet accent bar ── */
function SectionHeader({ children, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 28,
          height: 3,
          borderRadius: 2,
          bgcolor: '#6C5CE7',
          mb: 0.75,
        }}
      />
      <Typography
        sx={{
          fontSize: '0.85rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#1E293B',
        }}
      >
        {children}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

/* ── Stat Widget ── */
function TraineeStatWidget({ label, value, subtext, icon, color = '#6C5CE7', bg = '#F3F0FF' }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.15 }}>
              {value}
            </Typography>
            {subtext && (
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 0.5, fontWeight: 500 }}>
                {subtext}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: bg,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ── Custom Sparkline Tooltip ── */
function SparklineTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: '#1E293B',
          color: '#FFFFFF',
          px: 1.25,
          py: 0.5,
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        Cohort Progress: {payload[0].value}%
      </Box>
    );
  }
  return null;
}

export default function TraineeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({ ongoing: [], completed: [], totalEnrolled: 0, traineeId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Pursuing, 2: Completed
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Dialog & Notification
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseApi.getCourses(),
        courseApi.getMyEnrollments(),
      ]);
      setCourses(coursesRes.data.courses || []);
      setEnrollments(enrollmentsRes.data || { ongoing: [], completed: [], totalEnrolled: 0 });
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Could not fetch courses. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract sectors
  const sectors = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return Array.from(set).sort();
  }, [courses]);

  // Handle Pursuing a Course
  const handlePursueCourse = async (courseId, courseTitle) => {
    setActionLoadingId(courseId);
    try {
      const res = await courseApi.pursueCourse(courseId);
      setSnackbar({
        open: true,
        message: res.data.message || `Enrolled in ${courseTitle}!`,
        severity: 'success',
      });
      // Refresh list to update badge and enrollment count
      await fetchData();
    } catch (err) {
      console.error('Failed to pursue course:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to pursue course. Please try again.',
        severity: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter courses based on tab, sector, search
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Tab filter
      if (currentTab === 1 && c.myEnrollmentStatus !== 'enrolled') return false;
      if (currentTab === 2 && c.myEnrollmentStatus !== 'completed') return false;

      // Sector filter
      if (selectedSector !== 'all' && c.sector !== selectedSector) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(q);
        const sectorMatch = c.sector?.toLowerCase().includes(q);
        const providerMatch = c.providerName?.toLowerCase().includes(q);
        const skillMatch = c.skills?.some((s) => s.toLowerCase().includes(q));
        if (!titleMatch && !sectorMatch && !providerMatch && !skillMatch) return false;
      }

      return true;
    });
  }, [courses, currentTab, selectedSector, search]);

  const ongoingCount = enrollments.ongoing?.length || 0;
  const completedCount = enrollments.completed?.length || 0;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 } }}>
      {/* ── Welcome Banner ── */}
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(108, 92, 231, 0.25)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: '30%',
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.18)', px: 1.5, py: 0.5, borderRadius: '20px', mb: 1.5 }}>
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#FED7AA' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Skill Empowerment Portal
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Welcome back, {user?.name || 'Trainee'}! 🚀
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.88rem', sm: '0.98rem' }, color: 'rgba(255, 255, 255, 0.88)', maxWidth: 650, lineHeight: 1.5 }}>
            Browse government-approved and certified training courses. Enroll with a single click, track your live cohort progress, and earn industry-recognized certifications.
          </Typography>
        </Box>
      </Box>

      {/* ── Pending Milestone Survey Banner (PRD S3 & S8) ── */}
      <Card
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid #BAE6FD',
          bgcolor: '#F0F9FF',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#0284C7', color: '#FFFFFF', width: 46, height: 46 }}>
            <AssignmentTurnedInIcon />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 800, color: '#0369A1', fontSize: '1rem' }}>
                3-Month Post-Placement Outcome Check-In Due
              </Typography>
              <Chip
                icon={<CurrencyRupeeIcon sx={{ fontSize: '14px !important', color: '#B45309 !important' }} />}
                label="Earn ₹50 Instant UPI Reward"
                size="small"
                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.84rem', color: '#0C4A6E', mt: 0.25 }}>
              Confirm your current employment status to update the national registry and receive immediate payout to your registered UPI ID.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={() => setSurveyModalOpen(true)}
          sx={{
            bgcolor: '#0284C7',
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: '#0369A1' },
            flexShrink: 0,
          }}
        >
          Take Survey & Claim Reward
        </Button>
      </Card>

      {/* ── Stat Widgets Row ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 4 }}>
        <TraineeStatWidget
          label="Available Courses"
          value={courses.length}
          subtext="Certified training programs"
          icon={<SchoolIcon sx={{ fontSize: 26 }} />}
          color="#6C5CE7"
          bg="#F3F0FF"
        />
        <TraineeStatWidget
          label="Currently Pursuing"
          value={ongoingCount}
          subtext="Active training batches"
          icon={<PlayCircleFilledWhiteIcon sx={{ fontSize: 26 }} />}
          color="#2563EB"
          bg="#EFF6FF"
        />
        <TraineeStatWidget
          label="Completed & Certified"
          value={completedCount}
          subtext="Verified credentials earned"
          icon={<WorkspacePremiumIcon sx={{ fontSize: 26 }} />}
          color="#059669"
          bg="#ECFDF5"
        />
      </Box>

      {/* ── Tabs & Filter Controls Bar ── */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          borderRadius: '16px',
          border: '1px solid #ECEEF4',
          bgcolor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
          {/* Navigation Tabs */}
          <Tabs
            value={currentTab}
            onChange={(_e, val) => setCurrentTab(val)}
            sx={{
              '& .MuiTabs-indicator': {
                bgcolor: '#6C5CE7',
                height: 3,
                borderRadius: 2,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                minWidth: 100,
                color: '#64748B',
                '&.Mui-selected': {
                  color: '#6C5CE7',
                },
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>All Courses</span>
                  <Chip label={courses.length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: currentTab === 0 ? '#F3F0FF' : '#F1F5F9', color: currentTab === 0 ? '#6C5CE7' : '#64748B' }} />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Pursuing</span>
                  {ongoingCount > 0 && (
                    <Chip label={ongoingCount} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }} />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Completed</span>
                  {completedCount > 0 && (
                    <Chip label={completedCount} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669' }} />
                  )}
                </Box>
              }
            />
          </Tabs>

          {/* Search & Sector Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search courses, skills, providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', sm: 260 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: '0.85rem' }}>Sector</InputLabel>
              <Select
                value={selectedSector}
                label="Sector"
                onChange={(e) => setSelectedSector(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
              >
                <MenuItem value="all">All Sectors</MenuItem>
                {sectors.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* ── Error Banner ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* ── Loading Skeleton Grid ── */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3 }}>
              <Skeleton variant="rectangular" height={24} width="40%" sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rectangular" height={32} width="80%" sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '10px' }} />
            </Card>
          ))}
        </Box>
      ) : filteredCourses.length === 0 ? (
        /* ── Empty State ── */
        <Card sx={{ textAlign: 'center', py: 8, px: 3, borderRadius: '16px', border: '1px solid #ECEEF4' }}>
          <SchoolIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
            No courses found
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 440, mx: 'auto', mb: 3 }}>
            {currentTab === 1
              ? "You haven't enrolled in any course yet. Explore the catalogue and pursue a course to begin learning!"
              : currentTab === 2
              ? "No completed certifications yet. Keep learning in your enrolled courses to graduate!"
              : "Try adjusting your search query or sector filter to find available programs."}
          </Typography>
          {currentTab !== 0 && (
            <Button
              variant="contained"
              onClick={() => {
                setCurrentTab(0);
                setSelectedSector('all');
                setSearch('');
              }}
              sx={{
                bgcolor: '#6C5CE7',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#5A4AD1' },
              }}
            >
              Browse All Courses
            </Button>
          )}
        </Card>
      ) : (
        /* ── Course Cards Grid ── */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {filteredCourses.map((course) => {
            const theme = getSectorTheme(course.sector);
            const isPursuing = course.myEnrollmentStatus === 'enrolled';
            const isCompleted = course.myEnrollmentStatus === 'completed';
            const isActionLoading = actionLoadingId === course._id;

            return (
              <Card
                key={course._id}
                sx={{
                  borderRadius: '18px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isPursuing ? '2px solid #6C5CE7' : undefined,
                  boxShadow: isPursuing ? '0 6px 20px rgba(108,92,231,0.12)' : '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.07)',
                    borderColor: isPursuing ? '#6C5CE7' : '#D1D5DB',
                  },
                }}
              >
                {/* Status Ribbon if enrolled or completed */}
                {isPursuing && (
                  <Box
                    sx={{
                      bgcolor: '#6C5CE7',
                      color: '#FFFFFF',
                      py: 0.4,
                      px: 2,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      letterSpacing: '0.03em',
                    }}
                  >
                    <PlayCircleFilledWhiteIcon sx={{ fontSize: 15 }} />
                    CURRENTLY PURSUING • IN TRAINING
                  </Box>
                )}
                {isCompleted && (
                  <Box
                    sx={{
                      bgcolor: '#059669',
                      color: '#FFFFFF',
                      py: 0.4,
                      px: 2,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      letterSpacing: '0.03em',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 15 }} />
                    CERTIFIED GRADUATE
                  </Box>
                )}

                <CardContent sx={{ p: 2.75, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Top Row: Sector Badge & Duration */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Chip
                      label={course.sector || 'Vocational'}
                      size="small"
                      sx={{
                        bgcolor: theme.bg,
                        color: theme.color,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>
                      <AccessTimeIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                      <span>{course.durationWeeks || 8} Weeks</span>
                    </Box>
                  </Box>

                  {/* Course Title with uniform height */}
                  <Typography
                    sx={{
                      fontSize: '1.08rem',
                      fontWeight: 800,
                      color: 'text.primary',
                      lineHeight: 1.3,
                      minHeight: '2.8rem',
                      mb: 0.75,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': { color: '#6C5CE7' },
                    }}
                    onClick={() => {
                      setSelectedCourse(course);
                      setDialogOpen(true);
                    }}
                  >
                    {course.title}
                  </Typography>

                  {/* Provider & Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, color: '#64748B', fontSize: '0.8rem' }}>
                    <VerifiedIcon sx={{ fontSize: 15, color: '#6C5CE7', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {course.providerName}
                    </Typography>
                    {course.providerDistrict && (
                      <>
                        <Typography sx={{ color: '#CBD5E1' }}>•</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: 'text.secondary', flexShrink: 0 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <span>{course.providerDistrict}</span>
                        </Box>
                      </>
                    )}
                  </Box>

                  {/* Skills Tag Pills with fixed min-height for row alignment */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2, minHeight: 28, alignItems: 'center' }}>
                    {course.skills && course.skills.length > 0 ? (
                      <>
                        {course.skills.slice(0, 3).map((skill, sIdx) => (
                          <Chip
                            key={sIdx}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
                              color: 'text.secondary',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: (t) => t.palette.mode === 'dark' ? '1px solid rgba(203,241,245,0.1)' : '1px solid #ECEEF4',
                            }}
                          />
                        ))}
                        {course.skills.length > 3 && (
                          <Chip
                            label={`+${course.skills.length - 3}`}
                            size="small"
                            sx={{
                              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                              color: 'text.secondary',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <Box sx={{ height: 24 }} />
                    )}
                  </Box>

                  {/* Dribbble Style Mini Chart / Metric Widget */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
                      border: (t) => (t.palette.mode === 'dark' ? '1px solid rgba(203,241,245,0.1)' : '1px solid #ECEEF4'),
                      mb: 2.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                          Cohort Pass Rate
                        </Typography>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
                          {course.completionRate || 85}%
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                          Enrolled
                        </Typography>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
                          {course.totalEnrolled || 24}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Sparkline */}
                    <Box sx={{ height: 42, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={course.trend || [
                            { step: 'W1', progress: 30 },
                            { step: 'W2', progress: 60 },
                            { step: 'W3', progress: 75 },
                            { step: 'W4', progress: 85 },
                            { step: 'W5', progress: 92 },
                          ]}
                          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id={`grad-trainee-${course._id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.gradStart} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={theme.gradStart} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <RechartsTooltip content={<SparklineTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="progress"
                            stroke={theme.gradStart}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#grad-trainee-${course._id})`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>

                  {/* Push actions to bottom */}
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedCourse(course);
                        setDialogOpen(true);
                      }}
                      sx={{
                        flex: 1,
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        borderColor: '#E2E8F0',
                        color: '#475569',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                          bgcolor: '#F8FAFC',
                        },
                      }}
                    >
                      Details
                    </Button>

                    {isCompleted ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          if (enrollments.traineeId) {
                            navigate(`/trainee/profile/${enrollments.traineeId}`);
                          } else {
                            navigate('/trainee/cv');
                          }
                        }}
                        sx={{
                          flex: 1.5,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          bgcolor: '#059669',
                          boxShadow: '0 4px 14px rgba(5,150,105,0.25)',
                          '&:hover': { bgcolor: '#047857' },
                        }}
                      >
                        View Certificate
                      </Button>
                    ) : isPursuing ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedCourse(course);
                          setDialogOpen(true);
                        }}
                        sx={{
                          flex: 1.5,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          bgcolor: '#6C5CE7',
                          boxShadow: '0 4px 14px rgba(108,92,231,0.25)',
                          '&:hover': { bgcolor: '#5A4AD1' },
                        }}
                      >
                        Resume Modules
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={isActionLoading}
                        onClick={() => handlePursueCourse(course._id, course.title)}
                        sx={{
                          flex: 1.5,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                          boxShadow: '0 4px 14px rgba(108,92,231,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5A4AD1 0%, #3B2BBF 100%)',
                            boxShadow: '0 6px 18px rgba(108,92,231,0.4)',
                          },
                        }}
                      >
                        {isActionLoading ? 'Enrolling...' : '🚀 Pursue Course'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Course Details & Curriculum Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1,
              boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {selectedCourse && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Chip
                  label={selectedCourse.sector || 'Vocational'}
                  size="small"
                  sx={{
                    bgcolor: getSectorTheme(selectedCourse.sector).bg,
                    color: getSectorTheme(selectedCourse.sector).color,
                    fontWeight: 700,
                    borderRadius: '6px',
                    mb: 1,
                  }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#1E293B', lineHeight: 1.3 }}>
                  {selectedCourse.title}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>
                  Conducted by {selectedCourse.providerName} • {selectedCourse.providerDistrict || 'Assam'}
                </Typography>
              </Box>
              <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ color: '#94A3B8' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: '#ECEEF4' }}>
              {/* Highlight Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>DURATION</Typography>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>
                    {selectedCourse.durationWeeks || 8} Wks
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>AVG SCORE</Typography>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>
                    {selectedCourse.avgScore || 78}%
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>CERTIFICATION</Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                    Govt. Verified
                  </Typography>
                </Box>
              </Box>

              {/* Skills covered */}
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', mb: 1 }}>
                Competencies & Target Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedCourse.skills && selectedCourse.skills.length > 0 ? (
                  selectedCourse.skills.map((s, idx) => (
                    <Chip
                      key={idx}
                      label={s}
                      size="small"
                      sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, borderRadius: '8px' }}
                    />
                  ))
                ) : (
                  <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>Practical vocational mastery skills</Typography>
                )}
              </Box>

              {/* Modules Outline */}
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', mb: 1 }}>
                Training Modules Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { module: 'Module 1', title: 'Foundational Theory & Safety Protocols', duration: 'Weeks 1-2' },
                  { module: 'Module 2', title: 'Hands-on Technical Machinery Workshop', duration: 'Weeks 3-5' },
                  { module: 'Module 3', title: 'Quality Assurance & Industry Case Practices', duration: 'Weeks 6-7' },
                  { module: 'Module 4', title: 'Assessment Evaluation & Certification Lab', duration: 'Final Week' },
                ].map((m, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.25,
                      bgcolor: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #ECEEF4',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          bgcolor: '#E0E7FF',
                          color: '#4338CA',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                          {m.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{m.module}</Typography>
                      </Box>
                    </Box>
                    <Chip label={m.duration} size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#FFFFFF', color: '#64748B' }} />
                  </Box>
                ))}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <Button
                onClick={() => setDialogOpen(false)}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
              >
                Close
              </Button>
              {selectedCourse.myEnrollmentStatus === 'completed' ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    setDialogOpen(false);
                    if (enrollments.traineeId) {
                      navigate(`/trainee/profile/${enrollments.traineeId}`);
                    } else {
                      navigate('/trainee/cv');
                    }
                  }}
                  sx={{
                    bgcolor: '#059669',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: '#047857' },
                  }}
                >
                  View Verified Certificate
                </Button>
              ) : selectedCourse.myEnrollmentStatus === 'enrolled' ? (
                <Button
                  variant="contained"
                  onClick={() => setDialogOpen(false)}
                  sx={{
                    bgcolor: '#6C5CE7',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: '#5A4AD1' },
                  }}
                >
                  ✓ Currently Pursuing
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    setDialogOpen(false);
                    handlePursueCourse(selectedCourse._id, selectedCourse.title);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { background: 'linear-gradient(135deg, #5A4AD1 0%, #3B2BBF 100%)' },
                  }}
                >
                  🚀 Pursue This Course
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Snackbar Notifications ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Check-in Survey Modal (PRD S8) ── */}
      <CheckInSurveyModal
        open={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        milestone={3}
        onSurveyCompleted={() => {
          fetchData();
          setSnackbar({ open: true, message: 'Survey completed and reward credited to your wallet!', severity: 'success' });
        }}
      />
    </Box>
  );
}
