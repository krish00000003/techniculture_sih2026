import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Skeleton,
  Alert,
  TextField,
  InputAdornment,
  Button,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import courseApi from '../../api/course';

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
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          width: 30,
          height: 3,
          borderRadius: 2,
          bgcolor: '#6C5CE7',
          mb: 0.8,
        }}
      />
      <Typography
        sx={{
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#94A3B8',
        }}
      >
        {children}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

/* ── Top Summary Metric Card ── */
function SummaryMetricCard({ label, value, subtext, icon, gradient }) {
  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 200,
        borderRadius: '16px',
        border: '1px solid #ECEEF4',
        boxShadow: '0 2px 10px rgba(100, 110, 140, 0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 18px rgba(108, 92, 231, 0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.1 }}>
              {value}
            </Typography>
            {subtext && (
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', mt: 0.5 }}>
                {subtext}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: '#1E293B',
        borderRadius: '8px',
        px: 1.5,
        py: 0.8,
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
      }}
    >
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
        {payload[0].payload.step}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700 }}>
        {payload[0].value} Trainees
      </Typography>
    </Box>
  );
}

/* ── Trainee Employment Status Config ── */
const STATUS_CHIP = {
  employed: { bg: '#DCFCE7', color: '#15803D', label: 'Employed' },
  'self-employed': { bg: '#E0F2FE', color: '#0369A1', label: 'Self-Employed' },
  apprentice: { bg: '#FEF3C7', color: '#B45309', label: 'Apprentice' },
  unemployed: { bg: '#FEE2E2', color: '#B91C1C', label: 'Unemployed' },
  unknown: { bg: '#F1F5F9', color: '#64748B', label: 'Unknown' },
};

export default function CourseDashboard({ role = 'employer' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCourseId = searchParams.get('courseId');

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(urlCourseId || '');
  const [completions, setCompletions] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortBy, setSortBy] = useState('completionRate');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [traineeSearch, setTraineeSearch] = useState('');
  const [traineeStatusFilter, setTraineeStatusFilter] = useState('all');

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [error, setError] = useState('');

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    setError('');
    try {
      const { data } = await courseApi.getCourses();
      setCourses(data.courses || []);
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch completions for a selected course
  const fetchCompletions = useCallback(async (cId) => {
    if (!cId) {
      setCompletions([]);
      setCourseInfo(null);
      return;
    }
    setLoadingCompletions(true);
    setError('');
    try {
      const { data } = await courseApi.getCourseCompletions(cId);
      setCompletions(data.completions || []);
      setCourseInfo(data.course || null);
    } catch {
      setError('Failed to load course completions');
      setCompletions([]);
    } finally {
      setLoadingCompletions(false);
    }
  }, []);

  // Sync url param
  useEffect(() => {
    if (urlCourseId) {
      setSelectedCourseId(urlCourseId);
      fetchCompletions(urlCourseId);
    } else {
      setSelectedCourseId('');
      setCompletions([]);
      setCourseInfo(null);
    }
  }, [urlCourseId, fetchCompletions]);

  const handleSelectCourse = (cId) => {
    setSelectedCourseId(cId);
    setSearchParams(cId ? { courseId: cId } : {});
    if (cId) fetchCompletions(cId);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId('');
    setSearchParams({});
    setCompletions([]);
    setCourseInfo(null);
  };

  // High-level aggregates
  const summaryStats = useMemo(() => {
    const totalCourses = courses.length;
    const totalEnrolled = courses.reduce((s, c) => s + (c.totalEnrolled || 0), 0);
    const totalCompleted = courses.reduce((s, c) => s + (c.totalCompleted || 0), 0);
    const avgCompletion =
      totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
    return { totalCourses, totalEnrolled, totalCompleted, avgCompletion };
  }, [courses]);

  // Unique sectors for filter pills
  const sectors = useMemo(() => {
    const s = new Set(courses.map((c) => c.sector).filter(Boolean));
    return ['All', ...Array.from(s)];
  }, [courses]);

  // Filtered and sorted courses for grid
  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        const matchesSector = sectorFilter === 'All' || c.sector === sectorFilter;
        const matchesSearch =
          !searchQuery.trim() ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSector && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'completionRate') return b.completionRate - a.completionRate;
        if (sortBy === 'mostEnrolled') return b.totalEnrolled - a.totalEnrolled;
        if (sortBy === 'avgScore') return (b.avgScore || 0) - (a.avgScore || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'duration') return b.durationWeeks - a.durationWeeks;
        return 0;
      });
  }, [courses, sectorFilter, searchQuery, sortBy]);

  // Filtered trainees for selected course
  const filteredTrainees = useMemo(() => {
    return completions.filter((t) => {
      const status = t.employmentStatus || t.traineeStatus || 'unknown';
      const matchesStatus =
        traineeStatusFilter === 'all' || status === traineeStatusFilter;
      const matchesSearch =
        !traineeSearch.trim() ||
        t.name.toLowerCase().includes(traineeSearch.toLowerCase()) ||
        t.district.toLowerCase().includes(traineeSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [completions, traineeStatusFilter, traineeSearch]);

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* ── Breadcrumb / Title Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <SectionHeader subtitle={selectedCourseId ? courseInfo?.title || 'Course Completions' : 'Course Performance & Trainees Dashboard'}>
            {role === 'provider' ? 'TRAINING PROVIDER INTELLIGENCE' : 'TALENT ACQUISITION & COURSE ANALYTICS'}
          </SectionHeader>
        </Box>

        {selectedCourseId && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToCourses}
            sx={{
              borderRadius: '10px',
              color: '#6C5CE7',
              borderColor: 'rgba(108,92,231,0.3)',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': {
                borderColor: '#6C5CE7',
                bgcolor: 'rgba(108,92,231,0.04)',
              },
            }}
          >
            Back to Courses Grid
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW 1: COURSES GRID (DRIBBLE GRAPH COMPONENT SHOWCASE)
         ════════════════════════════════════════════════════════════ */}
      {!selectedCourseId && (
        <>
          {/* ── Top Metric Summary Banner ── */}
          <Box sx={{ display: 'flex', gap: 2.5, mb: 3.5, flexWrap: 'wrap' }}>
            <SummaryMetricCard
              label="Active Courses"
              value={loadingCourses ? '—' : summaryStats.totalCourses}
              subtext="Catalogued Curriculums"
              icon={<SchoolIcon sx={{ fontSize: 24 }} />}
              gradient="linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)"
            />
            <SummaryMetricCard
              label="Total Enrolled"
              value={loadingCourses ? '—' : summaryStats.totalEnrolled}
              subtext="Registered Trainees"
              icon={<PeopleIcon sx={{ fontSize: 24 }} />}
              gradient="linear-gradient(135deg, #00CEC9 0%, #81ECEC 100%)"
            />
            <SummaryMetricCard
              label="Certified Graduates"
              value={loadingCourses ? '—' : summaryStats.totalCompleted}
              subtext="Course Completions"
              icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
              gradient="linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)"
            />
            <SummaryMetricCard
              label="Completion Rate"
              value={loadingCourses ? '—' : `${summaryStats.avgCompletion}%`}
              subtext="Overall Benchmark"
              icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
              gradient="linear-gradient(135deg, #FFAE19 0%, #FDE047 100%)"
            />
          </Box>

          {/* ── Filter & Search Toolbar ── */}
          <Card
            sx={{
              mb: 3.5,
              borderRadius: '16px',
              border: '1px solid #ECEEF4',
              boxShadow: '0 2px 10px rgba(100, 110, 140, 0.04)',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {/* Search Bar */}
                <TextField
                  size="small"
                  placeholder="Search course title, skill, or provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    flex: { xs: '1 1 100%', md: '1 1 320px' },
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      bgcolor: '#F8FAFC',
                    },
                  }}
                />

                {/* Sector filter pills */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {sectors.map((sec) => {
                    const isSelected = sectorFilter === sec;
                    return (
                      <Box
                        key={sec}
                        onClick={() => setSectorFilter(sec)}
                        sx={{
                          px: 2,
                          py: 0.7,
                          borderRadius: '20px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          color: isSelected ? '#6C5CE7' : '#64748B',
                          bgcolor: isSelected ? '#F3F0FF' : '#F8FAFC',
                          border: isSelected ? '1px solid #6C5CE7' : '1px solid #E2E8F0',
                          '&:hover': {
                            bgcolor: isSelected ? '#F3F0FF' : '#F1F5F9',
                          },
                        }}
                      >
                        {sec}
                      </Box>
                    );
                  })}
                </Box>

                {/* Right controls: Sort & View Mode */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 'auto' }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ fontSize: 13 }}>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{ borderRadius: '10px', fontSize: 13 }}
                    >
                      <MenuItem value="completionRate">Completion Rate %</MenuItem>
                      <MenuItem value="mostEnrolled">Most Enrolled</MenuItem>
                      <MenuItem value="avgScore">Highest Avg Score</MenuItem>
                      <MenuItem value="title">Course Name (A-Z)</MenuItem>
                      <MenuItem value="duration">Course Duration</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Grid / Table Toggle */}
                  <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', p: 0.4, borderRadius: '10px' }}>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('grid')}
                      sx={{
                        borderRadius: '8px',
                        bgcolor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                        color: viewMode === 'grid' ? '#6C5CE7' : '#94A3B8',
                        boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      }}
                    >
                      <GridViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('table')}
                      sx={{
                        borderRadius: '8px',
                        bgcolor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                        color: viewMode === 'table' ? '#6C5CE7' : '#94A3B8',
                        boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      }}
                    >
                      <ViewListIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ── Courses Graph Component Grid ── */}
          {loadingCourses ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="rectangular" height={360} sx={{ borderRadius: '16px' }} />
              ))}
            </Box>
          ) : filteredCourses.length === 0 ? (
            <Card sx={{ p: 8, textAlign: 'center', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <SchoolIcon sx={{ fontSize: 56, color: '#94A3B8', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 700 }}>
                No courses match your filter
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                Try adjusting your search terms or selecting another sector.
              </Typography>
            </Card>
          ) : viewMode === 'grid' ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 3,
              }}
            >
              {filteredCourses.map((c) => {
                const theme = getSectorTheme(c.sector);
                const gradId = `sparklineGrad-${c._id}`;

                return (
                  <Card
                    key={c._id}
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid #ECEEF4',
                      boxShadow: '0 2px 10px rgba(100, 110, 140, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 14px 28px rgba(108, 92, 231, 0.12)',
                        borderColor: '#6C5CE7',
                      },
                    }}
                  >
                    {/* Top Accent Line */}
                    <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${theme.gradStart}, ${theme.gradEnd})` }} />

                    <CardContent sx={{ p: 2.75, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Top Badges */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip
                          label={c.sector}
                          size="small"
                          sx={{
                            bgcolor: theme.bg,
                            color: theme.color,
                            border: `1px solid ${theme.border}`,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 24,
                            borderRadius: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                          {c.durationWeeks} Wks
                        </Box>
                      </Box>

                      {/* Course Title */}
                      <Typography
                        sx={{
                          fontSize: '1.12rem',
                          fontWeight: 800,
                          color: '#1E293B',
                          mb: 0.5,
                          lineHeight: 1.3,
                        }}
                      >
                        {c.title}
                      </Typography>

                      {/* Provider Subtitle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: '#64748B', fontSize: 12 }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                        <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                          {c.providerName} {c.providerDistrict ? `· ${c.providerDistrict}` : ''}
                        </Typography>
                      </Box>

                      {/* ── Dribbble-style Mini Sparkline Graph Component ── */}
                      <Box
                        sx={{
                          bgcolor: '#F8FAFC',
                          borderRadius: '12px',
                          p: 1.5,
                          mb: 2.5,
                          border: '1px solid #F1F5F9',
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, px: 0.5 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Cohort Trajectory
                          </Typography>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1,
                              py: 0.2,
                              borderRadius: '6px',
                              bgcolor: c.completionRate >= 50 ? '#DCFCE7' : '#FEF3C7',
                              color: c.completionRate >= 50 ? '#15803D' : '#B45309',
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {c.completionRate}% Rate
                          </Box>
                        </Box>

                        <ResponsiveContainer width="100%" height={75}>
                          <AreaChart data={c.trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={theme.gradStart} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={theme.gradStart} stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <RechartsTooltip content={<SparklineTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="progress"
                              stroke={theme.gradStart}
                              strokeWidth={2.5}
                              fill={`url(#${gradId})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>

                      {/* ── Key Metrics Ribbon ── */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2, textAlign: 'center' }}>
                        <Box sx={{ bgcolor: '#F8FAFC', p: 1.2, borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>ENROLLED</Typography>
                          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>{c.totalEnrolled}</Typography>
                        </Box>
                        <Box sx={{ bgcolor: '#F8FAFC', p: 1.2, borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>COMPLETED</Typography>
                          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>{c.totalCompleted}</Typography>
                        </Box>
                        <Box sx={{ bgcolor: '#F8FAFC', p: 1.2, borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6C5CE7' }}>AVG SCORE</Typography>
                          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#6C5CE7' }}>{c.avgScore}%</Typography>
                        </Box>
                      </Box>

                      {/* Skills tags */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5, mt: 'auto' }}>
                        {c.skills.slice(0, 3).map((sk) => (
                          <Chip
                            key={sk}
                            label={sk}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 600,
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                              borderRadius: '6px',
                              height: 22,
                            }}
                          />
                        ))}
                        {c.skills.length > 3 && (
                          <Chip
                            label={`+${c.skills.length - 3}`}
                            size="small"
                            sx={{ fontSize: 11, fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B', height: 22 }}
                          />
                        )}
                      </Box>

                      {/* Action Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleSelectCourse(c._id)}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #6C5CE7 0%, #5A4BD8 100%)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 1.1,
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(108, 92, 231, 0.2)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5A4BD8 0%, #4D3DC5 100%)',
                            boxShadow: '0 6px 16px rgba(108, 92, 231, 0.3)',
                          },
                        }}
                      >
                        View Completed Trainees ({c.totalCompleted})
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            /* Table Summary View Mode */
            <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', boxShadow: '0 2px 10px rgba(100, 110, 140, 0.04)' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>COURSE</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>SECTOR</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>PROVIDER</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>DURATION</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>ENROLLED</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>COMPLETED</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>COMPLETION RATE</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.map((c) => {
                      const theme = getSectorTheme(c.sector);
                      return (
                        <TableRow key={c._id} hover sx={{ '&:hover': { bgcolor: '#F8F9FE' } }}>
                          <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>{c.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={c.sector}
                              size="small"
                              sx={{ bgcolor: theme.bg, color: theme.color, fontWeight: 700, fontSize: 11, borderRadius: '6px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: 13 }}>{c.providerName}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, fontSize: 13 }}>{c.durationWeeks} Wks</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{c.totalEnrolled}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#10B981' }}>{c.totalCompleted}</TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={c.completionRate}
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#E2E8F0',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#6C5CE7', borderRadius: 3 },
                                }}
                              />
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1E293B', width: 36 }}>
                                {c.completionRate}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSelectCourse(c._id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                color: '#6C5CE7',
                                borderColor: 'rgba(108,92,231,0.3)',
                              }}
                            >
                              View Trainees
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW 2: COURSE COMPLETIONS & TRAINEES LIST
         ════════════════════════════════════════════════════════════ */}
      {selectedCourseId && (
        <Box>
          {/* ── Selected Course Hero Card ── */}
          <Card
            sx={{
              mb: 3.5,
              borderRadius: '16px',
              border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(203, 241, 245, 0.1)' : '1px solid #ECEEF4'),
              boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 12px rgba(100, 110, 140, 0.04)'),
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #142023 0%, #18282B 100%)'
                  : 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FE 100%)',
            }}
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={courseInfo?.sector || 'Sector'}
                      size="small"
                      sx={{
                        bgcolor: '#F3F0FF',
                        color: '#6C5CE7',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                    <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                      Provided by <strong>{courseInfo?.providerName}</strong>
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                    {courseInfo?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 650 }}>
                    Every certified graduate listed below has successfully completed the curriculum and earned credential verification. Click any profile to inspect digital CV, skills assessment, and history.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #ECEEF4', textAlign: 'center', minWidth: 100 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>COMPLETED</Typography>
                    <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
                      {completions.length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ── Trainee Search & Status Filter Toolbar ── */}
          <Card sx={{ mb: 3, borderRadius: '16px', border: '1px solid #ECEEF4', boxShadow: '0 2px 10px rgba(100, 110, 140, 0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField
                  size="small"
                  placeholder="Filter by trainee name or district..."
                  value={traineeSearch}
                  onChange={(e) => setTraineeSearch(e.target.value)}
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
                    flex: { xs: '1 1 100%', sm: '1 1 280px' },
                    maxWidth: 360,
                    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', mr: 0.5 }}>
                    STATUS:
                  </Typography>
                  {['all', 'employed', 'unemployed', 'apprentice', 'self-employed'].map((st) => {
                    const isSelected = traineeStatusFilter === st;
                    return (
                      <Chip
                        key={st}
                        label={st.toUpperCase()}
                        onClick={() => setTraineeStatusFilter(st)}
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          bgcolor: isSelected ? '#6C5CE7' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#64748B',
                          '&:hover': {
                            bgcolor: isSelected ? '#5A4BD8' : '#E2E8F0',
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ── Trainees Table ── */}
          <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', boxShadow: '0 2px 10px rgba(100, 110, 140, 0.04)' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>TRAINEE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>DISTRICT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>TRAINEE STATUS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>ASSESSMENT SCORE</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>ATTENDANCE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>COMPLETED ON</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}>PUBLIC PROFILE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingCompletions ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell align="center"><Skeleton width={80} sx={{ mx: 'auto' }} /></TableCell>
                        <TableCell align="center"><Skeleton width={60} sx={{ mx: 'auto' }} /></TableCell>
                        <TableCell align="center"><Skeleton width={60} sx={{ mx: 'auto' }} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell align="right"><Skeleton width={110} sx={{ ml: 'auto' }} /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredTrainees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                        No trainees found matching the criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrainees.map((t) => {
                      const rawStatus = (t.employmentStatus || t.traineeStatus || 'unknown').toLowerCase();
                      const chip = STATUS_CHIP[rawStatus] || STATUS_CHIP.unknown;

                      return (
                        <TableRow
                          key={t.traineeId}
                          hover
                          sx={{
                            transition: 'background-color 0.15s ease',
                            '&:hover': { bgcolor: '#F8F9FE' },
                          }}
                        >
                          {/* Trainee name with avatar */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                                }}
                              >
                                {t.name ? t.name[0].toUpperCase() : '?'}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>
                                  {t.name}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>
                                  ID: {t.traineeId.slice(-6)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* District */}
                          <TableCell sx={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                            {t.district || '—'}
                          </TableCell>

                          {/* Trainee Status Chip */}
                          <TableCell align="center">
                            <Chip
                              label={chip.label}
                              size="small"
                              sx={{
                                bgcolor: chip.bg,
                                color: chip.color,
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                borderRadius: '6px',
                                height: 24,
                              }}
                            />
                          </TableCell>

                          {/* Assessment Score with visual meter */}
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: 14, color: t.assessmentScore >= 70 ? '#10B981' : '#F59E0B' }}>
                                {t.assessmentScore !== undefined ? `${t.assessmentScore}%` : '—'}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Attendance */}
                          <TableCell align="center" sx={{ fontWeight: 600, fontSize: 13, color: '#64748B' }}>
                            {t.attendancePct !== undefined ? `${t.attendancePct}%` : '—'}
                          </TableCell>

                          {/* Completed Date */}
                          <TableCell sx={{ color: '#64748B', fontSize: 13 }}>
                            {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—'}
                          </TableCell>

                          {/* Direct Navigation to Trainee Public Profile */}
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PersonIcon sx={{ fontSize: 16 }} />}
                              onClick={() => navigate(`/trainee/profile/${t.traineeId}`)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                color: '#6C5CE7',
                                borderColor: 'rgba(108, 92, 231, 0.3)',
                                '&:hover': {
                                  borderColor: '#6C5CE7',
                                  bgcolor: 'rgba(108, 92, 231, 0.05)',
                                },
                              }}
                            >
                              Public Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}
    </Box>
  );
}
