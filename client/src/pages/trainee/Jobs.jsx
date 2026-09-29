import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Skeleton,
  Divider,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import CelebrationIcon from '@mui/icons-material/Celebration';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BadgeIcon from '@mui/icons-material/Badge';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import traineeApi from '../../api/trainee';
import { useAuth } from '../../context/AuthContext';

export default function TraineeJobs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    jobs: [],
    companies: [],
    hiringPersonnel: [],
    traineeStatus: {},
    totalMatched: 0,
  });

  const [currentTab, setCurrentTab] = useState(0); // 0: Suggestions, 1: Companies, 2: Recruiters, 3: Interested
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [jobPoolOptIn, setJobPoolOptIn] = useState(true);

  // Modals & Feedback
  const [hiredModalOpen, setHiredModalOpen] = useState(false);
  const [selectedJobForHired, setSelectedJobForHired] = useState(null);
  const [hiredRole, setHiredRole] = useState('');
  const [hiredCompany, setHiredCompany] = useState('');
  const [hiredWage, setHiredWage] = useState('');

  const [recruiterModalOpen, setRecruiterModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch job & hiring data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await traineeApi.getJobs();
      setData(res.data);
      if (res.data.traineeStatus?.jobPoolOptIn !== undefined) {
        setJobPoolOptIn(res.data.traineeStatus.jobPoolOptIn);
      }
    } catch (err) {
      console.error('Failed to load jobs data:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load jobs and hiring partners. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle Job Pool Opt-in
  const handleToggleOptIn = async (event) => {
    const checked = event.target.checked;
    setJobPoolOptIn(checked);
    try {
      const res = await traineeApi.toggleJobPool(checked);
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
    } catch {
      setJobPoolOptIn(!checked);
      setSnackbar({ open: true, message: 'Could not update talent pool status', severity: 'error' });
    }
  };

  // Toggle Interest
  const handleToggleInterest = async (jobId) => {
    try {
      const res = await traineeApi.toggleJobInterest(jobId);
      setData((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) =>
          j._id === jobId ? { ...j, interestStatus: res.data.status } : j
        ),
      }));
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update interest status', severity: 'error' });
    }
  };

  // Submit "I got hired" report
  const handleReportHired = async () => {
    try {
      const res = await traineeApi.reportHired({
        jobId: selectedJobForHired?._id,
        companyName: hiredCompany || selectedJobForHired?.employerName,
        role: hiredRole || selectedJobForHired?.title,
        wageBand: hiredWage || selectedJobForHired?.wageBand,
      });

      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
      setHiredModalOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Could not record hired report', severity: 'error' });
    }
  };

  // Extract unique districts & sectors for filter dropdowns
  const districts = useMemo(() => {
    const set = new Set();
    data.jobs.forEach((j) => j.district && set.add(j.district));
    return Array.from(set);
  }, [data.jobs]);

  const sectors = useMemo(() => {
    const set = new Set();
    data.companies.forEach((c) => c.sectors?.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [data.companies]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return data.jobs.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDistrict = selectedDistrict === 'ALL' || j.district === selectedDistrict;
      return matchSearch && matchDistrict;
    });
  }, [data.jobs, searchQuery, selectedDistrict]);

  // Interested jobs
  const interestedJobs = useMemo(() => {
    return data.jobs.filter((j) => j.interestStatus === 'interested' || j.interestStatus === 'hired');
  }, [data.jobs]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
      {/* ── Header Banner ── */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(108, 92, 231, 0.25)',
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '15px !important', color: '#FFFFFF !important' }} />}
            label="TARGETED VOCATIONAL PLACEMENT"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              mb: 1.5,
              backdropFilter: 'blur(6px)',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.85rem' }, mb: 1 }}>
            Job Suggestions & Hiring Hub 🎯
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.92rem', maxWidth: 680, lineHeight: 1.5, mb: 2.5 }}>
            Matched career opportunities tailored to your completed course skills and district. Connect directly with verified corporate hiring managers and report placements with one tap.
          </Typography>

          {/* Talent Pool Opt-In Bar */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              px: 2,
              py: 0.75,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={jobPoolOptIn}
                  onChange={handleToggleOptIn}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00D2D3',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00D2D3',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Talent Pool Visibility:
                  </Typography>
                  <Chip
                    label={jobPoolOptIn ? 'Opted In & Discoverable' : 'Paused'}
                    size="small"
                    sx={{
                      bgcolor: jobPoolOptIn ? '#00D2D3' : 'rgba(255,255,255,0.3)',
                      color: jobPoolOptIn ? '#0B3B3C' : '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Key Metrics Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                  MATCHED OPENINGS
                </Typography>
                <Avatar sx={{ bgcolor: '#F3F0FF', color: '#6C5CE7', width: 34, height: 34 }}>
                  <WorkIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E293B' }}>
                {loading ? <Skeleton width={40} /> : data.jobs.length}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>
                {data.totalMatched} highly matching your skills
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                  HIRING COMPANIES
                </Typography>
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 34, height: 34 }}>
                  <BusinessIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E293B' }}>
                {loading ? <Skeleton width={40} /> : data.companies.length}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                Verified GSTIN/MCA partners
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                  HIRING PERSONNEL
                </Typography>
                <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 34, height: 34 }}>
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E293B' }}>
                {loading ? <Skeleton width={40} /> : data.hiringPersonnel.length}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                Recruiters & placement officers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                  SAVED / INTERESTED
                </Typography>
                <Avatar sx={{ bgcolor: '#FFF1F2', color: '#E11D48', width: 34, height: 34 }}>
                  <FavoriteIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E293B' }}>
                {loading ? <Skeleton width={40} /> : interestedJobs.length}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#E11D48', fontWeight: 600 }}>
                Roles tracked in your pipeline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Main Navigation Tabs ── */}
      <Box sx={{ borderBottom: 1, borderColor: '#ECEEF4', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_e, val) => setCurrentTab(val)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.92rem',
              textTransform: 'none',
              minHeight: 48,
              color: '#64748B',
            },
            '& .Mui-selected': {
              color: '#6C5CE7 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#6C5CE7',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Job Suggestions (${filteredJobs.length})`}
          />
          <Tab
            icon={<BusinessIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Hiring Companies (${data.companies.length})`}
          />
          <Tab
            icon={<BadgeIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Hiring Personnel (${data.hiringPersonnel.length})`}
          />
          <Tab
            icon={<FavoriteIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`My Pipeline (${interestedJobs.length})`}
          />
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════════
          TAB 0: JOB SUGGESTIONS FOR THE TRAINEE
          ═══════════════════════════════════════════════ */}
      {currentTab === 0 && (
        <Box>
          {/* Filters Bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#FFFFFF',
              p: 2,
              borderRadius: '12px',
              border: '1px solid #ECEEF4',
              mb: 3,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by job title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 320 } }}
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

            <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>District</InputLabel>
                <Select
                  value={selectedDistrict}
                  label="District"
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <MenuItem value="ALL">All Districts</MenuItem>
                  {districts.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(searchQuery || selectedDistrict !== 'ALL') && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('ALL');
                  }}
                  sx={{ textTransform: 'none', color: '#64748B', borderColor: '#CBD5E1' }}
                >
                  Reset
                </Button>
              )}
            </Box>
          </Box>

          {/* Job Cards Grid */}
          {loading ? (
            <Grid container spacing={2.5}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, md: 6 }} key={i}>
                  <Card sx={{ height: '100%', borderRadius: '14px', p: 3 }}>
                    <Skeleton height={28} width="60%" />
                    <Skeleton height={20} width="40%" sx={{ my: 1 }} />
                    <Skeleton height={40} width="100%" />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredJobs.length === 0 ? (
            <Card sx={{ borderRadius: '14px', p: 6, textAlign: 'center', border: '1px dashed #CBD5E1' }}>
              <WorkIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                No jobs found matching your filters
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2 }}>
                Try adjusting your search query or selecting "All Districts".
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDistrict('ALL');
                }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {filteredJobs.map((job) => {
                const isInterested = job.interestStatus === 'interested';
                const isHired = job.interestStatus === 'hired';

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={job._id}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border: '1px solid #ECEEF4',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(108,92,231,0.08)',
                          borderColor: 'rgba(108,92,231,0.3)',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Top row: Company & Match chip */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: '#F3F0FF',
                                color: '#6C5CE7',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                border: '1px solid rgba(108,92,231,0.2)',
                              }}
                            >
                              {job.employerName[0]}
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>
                                  {job.employerName}
                                </Typography>
                                {job.employerVerified && (
                                  <Tooltip title="GSTIN/MCA Verified Employer">
                                    <VerifiedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                  </Tooltip>
                                )}
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.1rem', lineHeight: 1.25 }}>
                                {job.title}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Match Score Badge */}
                          <Chip
                            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: job.matchScore >= 80 ? '#10B981 !important' : '#6C5CE7 !important' }} />}
                            label={`${job.matchScore}% Match`}
                            size="small"
                            sx={{
                              bgcolor: job.matchScore >= 80 ? '#ECFDF5' : '#F3F0FF',
                              color: job.matchScore >= 80 ? '#059669' : '#6C5CE7',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              border: `1px solid ${job.matchScore >= 80 ? 'rgba(16,185,129,0.2)' : 'rgba(108,92,231,0.2)'}`,
                            }}
                          />
                        </Box>

                        {/* Location, Salary, Type */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, my: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.82rem' }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: '#64748B' }} />
                            {job.district}
                            {job.districtMatch && (
                              <Chip label="Near you" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }} />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.82rem' }}>
                            <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#64748B' }} />
                            {job.wageBand}
                          </Box>
                          <Chip label={job.type} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#F8FAFC', color: '#64748B' }} />
                        </Box>

                        {/* Skills tags */}
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 0.75 }}>
                            Required Skills:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {job.skills.map((skill) => {
                              const isMatched = (job.matchingSkills || []).includes(skill.toLowerCase());
                              return (
                                <Chip
                                  key={skill}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    bgcolor: isMatched ? '#EFF6FF' : '#F8FAFC',
                                    color: isMatched ? '#2563EB' : '#64748B',
                                    fontWeight: isMatched ? 700 : 500,
                                    fontSize: '0.72rem',
                                    border: isMatched ? '1px solid rgba(37,99,235,0.3)' : '1px solid #ECEEF4',
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>

                        {/* Hiring Contact Info snippet */}
                        {job.hiringContact && (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '10px',
                              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FE'),
                              border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(203, 241, 245, 0.1)' : '1px solid #ECEEF4'),
                              mb: 2.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#6C5CE7', fontSize: '0.75rem', fontWeight: 700 }}>
                                {job.hiringContact.name[0]}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                                  {job.hiringContact.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.2 }}>
                                  {job.hiringContact.role}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                setSelectedRecruiter(job.hiringContact);
                                setRecruiterModalOpen(true);
                              }}
                              sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 700, color: '#6C5CE7' }}
                            >
                              Contact HR
                            </Button>
                          </Box>
                        )}

                        <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Button
                            variant={isInterested ? 'contained' : 'outlined'}
                            color={isInterested ? 'primary' : 'inherit'}
                            size="small"
                            onClick={() => handleToggleInterest(job._id)}
                            startIcon={isInterested ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: '8px',
                              bgcolor: isInterested ? '#6C5CE7' : 'transparent',
                              borderColor: isInterested ? '#6C5CE7' : '#CBD5E1',
                              color: isInterested ? '#FFFFFF' : '#475569',
                            }}
                          >
                            {isInterested ? 'Interested' : 'Mark Interested'}
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            startIcon={<CelebrationIcon />}
                            onClick={() => {
                              setSelectedJobForHired(job);
                              setHiredCompany(job.employerName);
                              setHiredRole(job.title);
                              setHiredWage(job.wageBand);
                              setHiredModalOpen(true);
                            }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: '8px',
                              borderColor: '#10B981',
                              color: '#059669',
                              bgcolor: isHired ? '#ECFDF5' : 'transparent',
                            }}
                          >
                            {isHired ? 'Reported Hired ✓' : 'I Got Hired'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 1: HIRING COMPANIES DIRECTORY
          ═══════════════════════════════════════════════ */}
      {currentTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Partner Hiring Companies
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', mb: 3 }}>
            Corporates and enterprise employers verified through Ministry GSTIN & MCA registries actively hiring vocational graduates.
          </Typography>

          <Grid container spacing={2.5}>
            {data.companies.map((company) => (
              <Grid size={{ xs: 12, md: 6 }} key={company._id}>
                <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                      <Avatar
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: '#6C5CE7',
                          color: '#FFFFFF',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                        }}
                      >
                        {company.companyName[0]}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.15rem' }}>
                            {company.companyName}
                          </Typography>
                          <Chip
                            icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
                            label="GSTIN Verified"
                            size="small"
                            sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                          GSTIN: {company.gstin} • HQ: {company.headquarters}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={`${company.openRolesCount} Openings`}
                      size="small"
                      sx={{ bgcolor: '#F3F0FF', color: '#6C5CE7', fontWeight: 800 }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 0.75 }}>
                      Hiring Sectors:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {company.sectors?.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.72rem' }} />
                      ))}
                    </Box>
                  </Box>

                  {company.hiringLead && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FE'),
                        border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(203, 241, 245, 0.1)' : '1px solid #ECEEF4'),
                        borderRadius: '10px',
                        mb: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                          Contact: {company.hiringLead.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                          {company.hiringLead.role}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedRecruiter(company.hiringLead);
                          setRecruiterModalOpen(true);
                        }}
                        sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 700 }}
                      >
                        Details
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        setSearchQuery(company.companyName);
                        setCurrentTab(0);
                      }}
                      sx={{
                        bgcolor: '#6C5CE7',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#5A4BC7' },
                      }}
                    >
                      View Open Positions
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: HIRING PERSONNEL & RECRUITERS
          ═══════════════════════════════════════════════ */}
      {currentTab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Verified Recruiters & Placement Coordinators
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', mb: 3 }}>
            Direct point of contacts for candidate screening, apprenticeships, and vocational interviews.
          </Typography>

          <Grid container spacing={2.5}>
            {data.hiringPersonnel.map((person) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={person.id}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                      }}
                    >
                      {person.name[0]}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1rem', lineHeight: 1.2 }}>
                        {person.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6C5CE7' }}>
                        {person.company}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {person.district}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '0.78rem', color: '#475569', mb: 1.5, fontWeight: 500 }}>
                    {person.role}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 0.5 }}>
                      Focus Sectors:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {person.sectors?.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ fontSize: '0.68rem', bgcolor: '#F8FAFC' }} />
                      ))}
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, mb: 2.5 }}>
                    ✓ {person.experience}
                  </Typography>

                  <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #ECEEF4', display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<EmailIcon />}
                      onClick={() => {
                        setSelectedRecruiter(person);
                        setRecruiterModalOpen(true);
                      }}
                      sx={{
                        bgcolor: '#6C5CE7',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    >
                      Connect
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 3: MY PIPELINE / SAVED JOBS
          ═══════════════════════════════════════════════ */}
      {currentTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            My Tracked Opportunities
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', mb: 3 }}>
            Roles you have marked as interested or reported placement for.
          </Typography>

          {interestedJobs.length === 0 ? (
            <Card sx={{ borderRadius: '16px', p: 6, textAlign: 'center', border: '1px dashed #CBD5E1' }}>
              <FavoriteBorderIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                You haven't marked any jobs as interested yet
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.88rem', mb: 2 }}>
                Browse the suggestions tab and tap "Mark Interested" on roles that catch your eye.
              </Typography>
              <Button variant="contained" onClick={() => setCurrentTab(0)} sx={{ bgcolor: '#6C5CE7' }}>
                Browse Suggestions
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {interestedJobs.map((job) => (
                <Grid size={{ xs: 12, md: 6 }} key={job._id}>
                  <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>
                          {job.employerName}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.1rem' }}>
                          {job.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={job.interestStatus === 'hired' ? 'Placed & Hired' : 'Interested'}
                        size="small"
                        color={job.interestStatus === 'hired' ? 'success' : 'primary'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: '0.82rem', color: '#475569', mb: 2 }}>
                      📍 {job.district} • 💰 {job.wageBand}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleToggleInterest(job._id)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Remove Interest
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => {
                          setSelectedJobForHired(job);
                          setHiredCompany(job.employerName);
                          setHiredRole(job.title);
                          setHiredWage(job.wageBand);
                          setHiredModalOpen(true);
                        }}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Report I Got Hired
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ── Modal: Report "I Got Hired" (PRD S5) ── */}
      <Dialog open={hiredModalOpen} onClose={() => setHiredModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CelebrationIcon sx={{ color: '#10B981' }} />
          Report Your Placement / "I Got Hired"
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569', mb: 2.5 }}>
            Reporting employment updates your vocational outcome record and notifies your training provider and employer for official verification.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Hiring Employer / Company"
              value={hiredCompany}
              onChange={(e) => setHiredCompany(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Job Role / Designation"
              value={hiredRole}
              onChange={(e) => setHiredRole(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Monthly Wage Band"
              value={hiredWage}
              onChange={(e) => setHiredWage(e.target.value)}
              placeholder="e.g. ₹15,000 - ₹20,000 / month"
              fullWidth
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setHiredModalOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleReportHired}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Confirm & Submit Placement
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: Recruiter Details & Contact ── */}
      <Dialog open={recruiterModalOpen} onClose={() => setRecruiterModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Recruiter Profile
          <IconButton size="small" onClick={() => setRecruiterModalOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRecruiter && (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#6C5CE7',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                {selectedRecruiter.name[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.25 }}>
                {selectedRecruiter.name}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#6C5CE7', mb: 0.5 }}>
                {selectedRecruiter.company}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mb: 2 }}>
                {selectedRecruiter.role} • {selectedRecruiter.district}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EmailIcon sx={{ color: '#6C5CE7', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 500 }}>
                    {selectedRecruiter.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ color: '#6C5CE7', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 500 }}>
                    {selectedRecruiter.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setRecruiterModalOpen(false);
              setSnackbar({
                open: true,
                message: `Connection request and your verified CV shared with ${selectedRecruiter?.name}!`,
                severity: 'success',
              });
            }}
            sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700 }}
          >
            Express Direct Interest
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
