import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import BlockIcon from '@mui/icons-material/Block';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import traineeApi from '../../api/trainee';
import { useAuth } from '../../context/AuthContext';
import CheckInSurveyModal from '../../components/CheckInSurveyModal';

export default function TraineeMe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); // 0: Profile, 1: Training, 2: Consent Ledger, 3: Rewards

  const [copiedOutcomeId, setCopiedOutcomeId] = useState(false);

  // Profile Edit Modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editDistrict, setEditDistrict] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editBackupName, setEditBackupName] = useState('');
  const [editBackupPhone, setEditBackupPhone] = useState('');
  const [editEmploymentStatus, setEditEmploymentStatus] = useState('');

  // Payout Method Modal / Edit
  const [upiIdInput, setUpiIdInput] = useState('');
  const [savingPayout, setSavingPayout] = useState(false);

  // Consent Confirmation Dialog
  const [consentDialog, setConsentDialog] = useState({ open: false, consent: null, newStatus: '' });
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch Trainee Dashboard
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await traineeApi.getMeDashboard();
      setDashboardData(res.data);
      setEditDistrict(res.data.profile.district || '');
      setEditGender(res.data.profile.gender || '');
      setEditLanguage(res.data.profile.language || 'en');
      setEditBackupName(res.data.profile.backupContact?.name || '');
      setEditBackupPhone(res.data.profile.backupContact?.phone || '');
      setEditEmploymentStatus(res.data.profile.employmentStatus || 'seeking');
      setUpiIdInput(res.data.profile.upiId || '');
    } catch (err) {
      console.error('Failed to fetch personal dashboard:', err);
      setSnackbar({ open: true, message: 'Could not load profile dashboard', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCopyOutcomeId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOutcomeId(true);
    setTimeout(() => setCopiedOutcomeId(false), 2000);
  };

  const handleSaveProfile = async () => {
    try {
      await traineeApi.updateProfile({
        district: editDistrict,
        gender: editGender,
        language: editLanguage,
        employmentStatus: editEmploymentStatus,
        backupContact: {
          name: editBackupName,
          phone: editBackupPhone,
        },
      });
      setSnackbar({ open: true, message: 'Personal profile updated successfully!', severity: 'success' });
      setEditProfileOpen(false);
      fetchDashboard();
    } catch {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleSavePayoutMethod = async () => {
    if (!upiIdInput.trim()) {
      setSnackbar({ open: true, message: 'Please enter a valid UPI ID or mobile number', severity: 'warning' });
      return;
    }
    setSavingPayout(true);
    try {
      await traineeApi.updatePayoutMethod(upiIdInput.trim());
      setSnackbar({ open: true, message: 'Payout method saved successfully for future survey rewards!', severity: 'success' });
      fetchDashboard();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save payout method', severity: 'error' });
    } finally {
      setSavingPayout(false);
    }
  };

  const handleConfirmToggleConsent = async () => {
    const { consent, newStatus } = consentDialog;
    if (!consent) return;
    try {
      await traineeApi.toggleConsent(consent._id, newStatus);
      setSnackbar({
        open: true,
        message: `Consent for ${consent.granteeName} has been ${newStatus === 'revoked' ? 'revoked' : 'granted'}.`,
        severity: 'success',
      });
      setConsentDialog({ open: false, consent: null, newStatus: '' });
      fetchDashboard();
    } catch {
      setSnackbar({ open: true, message: 'Failed to update consent status', severity: 'error' });
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
        <Skeleton variant="rounded" height={160} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const { profile, user: userInfo, stats, courses, consents, rewards } = dashboardData || {
    profile: {},
    userInfo: {},
    stats: {},
    courses: { ongoing: [], completed: [] },
    consents: [],
    rewards: [],
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 6 }}>
      {/* ── Trainee Identity Card ── */}
      <Card
        sx={{
          borderRadius: '18px',
          border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(203, 241, 245, 0.1)' : '1px solid #ECEEF4'),
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #142023 0%, #18282B 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FE 100%)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                fontSize: '1.8rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(108,92,231,0.3)',
              }}
            >
              {userInfo?.name?.[0]?.toUpperCase() || 'T'}
            </Avatar>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                  {userInfo?.name || user?.name}
                </Typography>
                <Chip
                  icon={<VerifiedUserIcon sx={{ fontSize: '15px !important', color: '#10B981 !important' }} />}
                  label="Verified Trainee"
                  size="small"
                  sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.72rem' }}
                />
              </Box>

              {/* Lifelong Outcome ID */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
                <Chip
                  icon={<FingerprintIcon sx={{ fontSize: '15px !important', color: '#6C5CE7 !important' }} />}
                  label={`Outcome ID: ${profile.outcomeId}`}
                  size="small"
                  onClick={() => handleCopyOutcomeId(profile.outcomeId)}
                  deleteIcon={copiedOutcomeId ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                  onDelete={() => handleCopyOutcomeId(profile.outcomeId)}
                  sx={{
                    bgcolor: '#F3F0FF',
                    color: '#6C5CE7',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#EDE9FE' },
                  }}
                />
                {copiedOutcomeId && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                    Copied!
                  </Typography>
                )}
              </Box>

              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.75 }}>
                📍 {profile.district} • 📞 {userInfo?.phone || '+91 90000 00001'} • ✉️ {userInfo?.email || 'trainee@voctrack.in'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setSurveyModalOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
            >
              Take Check-In (Earn ₹50)
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditProfileOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', borderColor: '#CBD5E1', color: '#475569' }}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/trainee/cv')}
              sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
            >
              View Digital CV
            </Button>
          </Box>
        </Box>
      </Card>

      {/* ── Key Overview Stats ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                ACTIVE COURSES
              </Typography>
              <SchoolIcon sx={{ color: '#6C5CE7', fontSize: 18 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>
              {stats.ongoingCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
              In training cohort
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                CERTIFICATIONS
              </Typography>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>
              {stats.completedCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              Verified credentials
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                AVG ASSESSMENT
              </Typography>
              <VerifiedUserIcon sx={{ color: '#2563EB', fontSize: 18 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>
              {stats.avgScore}%
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
              Across assessments
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #ECEEF4', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                REWARDS EARNED
              </Typography>
              <CurrencyRupeeIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>
              ₹{stats.totalRewardsEarned}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              From survey check-ins
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ── Navigation Tabs ── */}
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
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personal Profile" />
          <Tab icon={<SchoolIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="My Vocational Tracks" />
          <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Consent Ledger (DPDP)" />
          <Tab icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Rewards & Wallet" />
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════════
          TAB 0: PERSONAL PROFILE & CONTACTS
          ═══════════════════════════════════════════════ */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 2 }}>
                Basic Demographics & Status
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                    Full Name
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B' }}>
                    {userInfo?.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                    Employment Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={profile.employmentStatus?.toUpperCase()}
                      size="small"
                      color={profile.employmentStatus === 'employed' ? 'success' : 'primary'}
                      sx={{ fontWeight: 700 }}
                    />
                    <Button
                      size="small"
                      onClick={() => setEditProfileOpen(true)}
                      sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#6C5CE7' }}
                    >
                      Change Status
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                    District / Region
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B' }}>
                    {profile.district}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                    Gender & Preferred Language
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B' }}>
                    {profile.gender} • {profile.language === 'en' ? 'English' : 'Hindi / Regional'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ContactPhoneIcon sx={{ color: '#6C5CE7' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                  Backup Family Contact (PRD C1)
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mb: 2.5 }}>
                Used only if your phone number changes during post-training milestone check-ins (3m, 6m, 12m).
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FE'),
                  borderRadius: '12px',
                  border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(203, 241, 245, 0.1)' : '1px solid #ECEEF4'),
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Contact Name
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                  {profile.backupContact?.name || 'Not provided'}
                </Typography>

                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Phone Number
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                  {profile.backupContact?.phone || 'Not provided'}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => setEditProfileOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                Update Backup Contact
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 1: VOCATIONAL TRAINING TRACKS
          ═══════════════════════════════════════════════ */}
      {currentTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            My Enrolled & Certified Courses
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', mb: 3 }}>
            All programs under your lifelong Outcome ID across government and accredited skill providers.
          </Typography>

          <Grid container spacing={2.5}>
            {courses.ongoing.map((course) => (
              <Grid size={{ xs: 12, md: 6 }} key={course._id}>
                <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Chip label={course.sector} size="small" sx={{ bgcolor: '#F3F0FF', color: '#6C5CE7', fontWeight: 700, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem' }}>
                        {course.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {course.providerName}
                      </Typography>
                    </Box>
                    <Chip label="Pursuing" color="primary" size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                        Cohort Attendance
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#6C5CE7' }}>
                        {course.attendancePct}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.attendancePct}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#ECEEF4', '& .MuiLinearProgress-bar': { bgcolor: '#6C5CE7' } }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}

            {courses.completed.map((course) => (
              <Grid size={{ xs: 12, md: 6 }} key={course._id}>
                <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Chip label={course.sector} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem' }}>
                        {course.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {course.providerName}
                      </Typography>
                    </Box>
                    <Chip label="Certified ✓" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Typography sx={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700, mt: 1 }}>
                    Assessment Score: {course.score}%
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: CONSENT LEDGER (PRD S6)
          ═══════════════════════════════════════════════ */}
      {currentTab === 2 && (
        <Box>
          <Box sx={{ p: 2.5, bgcolor: '#F0F9FF', borderRadius: '14px', border: '1px solid #BAE6FD', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <SecurityIcon sx={{ color: '#0284C7' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0369A1' }}>
                DPDP Act Data Privacy & Consent Ledger
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.85rem', color: '#0C4A6E', lineHeight: 1.5 }}>
              You have complete ownership over who accesses your certificates, attendance, and employment data. Any access is logged, and you may revoke permissions at any moment with instant effect.
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: '14px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748B' }}>AUTHORIZED ENTITY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748B' }}>DATA SCOPE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748B' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748B' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent._id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.88rem' }}>
                        {consent.granteeName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'capitalize' }}>
                        Type: {consent.granteeType}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {consent.scope?.map((sc) => (
                          <Chip key={sc} label={sc} size="small" sx={{ fontSize: '0.68rem', bgcolor: '#F1F5F9' }} />
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={consent.status?.toUpperCase()}
                        size="small"
                        color={consent.status === 'active' ? 'success' : 'default'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      {consent.status === 'active' ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<BlockIcon />}
                          onClick={() => setConsentDialog({ open: true, consent, newStatus: 'revoked' })}
                          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          Revoke Access
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<CheckBoxIcon />}
                          onClick={() => setConsentDialog({ open: true, consent, newStatus: 'active' })}
                          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          Restore Consent
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 3: REWARDS & WALLET (PRD S7)
          ═══════════════════════════════════════════════ */}
      {currentTab === 3 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccountBalanceWalletIcon sx={{ color: '#F59E0B' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                    Payout Method
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mb: 2 }}>
                  Set your UPI ID or mobile number for direct micropayment rewards when completing post-training check-ins.
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="UPI ID or Mobile Number"
                  placeholder="e.g. yourname@okhdfcbank or 9876543210"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSavePayoutMethod}
                  disabled={savingPayout}
                  sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700 }}
                >
                  {savingPayout ? 'Saving...' : 'Save Payout Method'}
                </Button>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                  Rewards Ledger & History
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mb: 2 }}>
                  Total Payout Received: <strong>₹{stats.totalRewardsEarned}</strong>
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>MILESTONE / TITLE</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>AMOUNT</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>REF</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rewards.map((r) => (
                        <TableRow key={r._id}>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>
                              {r.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>
                              +₹{r.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={r.status?.toUpperCase()} size="small" color="success" sx={{ fontSize: '0.68rem', height: 20 }} />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                              {r.transactionRef}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── Modal: Edit Trainee Profile ── */}
      <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Trainee Profile Details</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="District"
              value={editDistrict}
              onChange={(e) => setEditDistrict(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Gender"
              value={editGender}
              onChange={(e) => setEditGender(e.target.value)}
              placeholder="male / female / other"
              fullWidth
              size="small"
            />
            <TextField
              label="Preferred Language"
              value={editLanguage}
              onChange={(e) => setEditLanguage(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Employment Status"
              value={editEmploymentStatus}
              onChange={(e) => setEditEmploymentStatus(e.target.value)}
              placeholder="seeking / employed / apprentice / unemployed"
              fullWidth
              size="small"
            />

            <Divider sx={{ my: 1 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
              Backup Family Contact (Omnichannel Escalation)
            </Typography>
            <TextField
              label="Backup Contact Name"
              value={editBackupName}
              onChange={(e) => setEditBackupName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Backup Contact Phone"
              value={editBackupPhone}
              onChange={(e) => setEditBackupPhone(e.target.value)}
              fullWidth
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditProfileOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveProfile} sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: Confirm Consent Action ── */}
      <Dialog open={consentDialog.open} onClose={() => setConsentDialog({ open: false, consent: null, newStatus: '' })}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {consentDialog.newStatus === 'revoked' ? 'Revoke Data Access Consent?' : 'Restore Consent?'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569' }}>
            {consentDialog.newStatus === 'revoked'
              ? `Are you sure you want to revoke access for "${consentDialog.consent?.granteeName}"? They will no longer be able to view your certifications, district, or attendance logs.`
              : `Restore data access for "${consentDialog.consent?.granteeName}"?`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConsentDialog({ open: false, consent: null, newStatus: '' })} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={consentDialog.newStatus === 'revoked' ? 'error' : 'primary'}
            onClick={handleConfirmToggleConsent}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Confirm
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

      {/* ── Check-in Survey Modal (PRD S8) ── */}
      <CheckInSurveyModal
        open={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        milestone={3}
        onSurveyCompleted={() => {
          fetchDashboard();
          setSnackbar({ open: true, message: 'Milestone check-in submitted and reward credited!', severity: 'success' });
        }}
      />
    </Box>
  );
}
