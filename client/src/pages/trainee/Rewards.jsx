import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Skeleton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import traineeApi from '../../api/trainee';
import CheckInSurveyModal from '../../components/CheckInSurveyModal';
import { useAuth } from '../../context/AuthContext';

export default function TraineeRewards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rewards: [],
    profile: {},
    stats: {},
  });

  const [upiIdInput, setUpiIdInput] = useState('');
  const [savingPayout, setSavingPayout] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(3);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await traineeApi.getMeDashboard();
      setData(res.data);
      setUpiIdInput(res.data.profile.upiId || '');
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to load rewards data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePayoutMethod = async () => {
    if (!upiIdInput.trim()) {
      setSnackbar({ open: true, message: 'Please enter a valid UPI ID or phone number', severity: 'warning' });
      return;
    }
    setSavingPayout(true);
    try {
      await traineeApi.updatePayoutMethod(upiIdInput.trim());
      setSnackbar({ open: true, message: 'Payout method saved successfully for future survey rewards!', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Failed to update payout method', severity: 'error' });
    } finally {
      setSavingPayout(false);
    }
  };

  const totalRewards = data.rewards?.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0) || 0;

  // Milestone timeline configurations
  const milestones = [
    {
      milestone: 3,
      title: '3-Month Post-Placement Check-In',
      reward: 50,
      desc: 'Verify early employment or identify dropout risks early',
      completed: data.rewards?.some((r) => r.surveyMilestone === 3 && r.status === 'paid'),
    },
    {
      milestone: 6,
      title: '6-Month Career Progression Survey',
      reward: 100,
      desc: 'Wage growth check and job stability audit',
      completed: data.rewards?.some((r) => r.surveyMilestone === 6 && r.status === 'paid'),
    },
    {
      milestone: 12,
      title: '12-Month Retention & Upskilling Check',
      reward: 150,
      desc: 'Annual retention tracking and advanced certifications',
      completed: data.rewards?.some((r) => r.surveyMilestone === 12 && r.status === 'paid'),
    },
    {
      milestone: 24,
      title: '24-Month Long-Term Impact Survey',
      reward: 200,
      desc: 'Longitudinal wage trajectory and career milestones',
      completed: data.rewards?.some((r) => r.surveyMilestone === 24 && r.status === 'paid'),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6 }}>
      {/* ── Top Hero Card ── */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #047857 100%)',
          color: '#FFFFFF',
          mb: 3,
          boxShadow: '0 8px 30px rgba(5, 150, 105, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '15px !important', color: '#FFFFFF !important' }} />}
            label="MICROPAYMENT SURVEY REWARDS (PRD A6 & S7)"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.22)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              mb: 1.5,
              backdropFilter: 'blur(6px)',
            }}
          />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 1 }}>
                Rewards & Micropayments Wallet 🎁
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '0.92rem', lineHeight: 1.5, maxWidth: 580 }}>
                Earn direct UPI micropayments or mobile recharges for completing post-training outcome surveys at 3, 6, 12, and 24 months. Your responses help government and employers ensure fair vocational career growth.
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  p: 2.5,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.9)' }}>
                  TOTAL REWARDS EARNED
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, my: 0.5, color: '#FFFFFF' }}>
                  {loading ? <Skeleton width={80} sx={{ mx: 'auto' }} /> : `₹${totalRewards}`}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#D1FAE5', fontWeight: 600 }}>
                  Credited to: {data.profile?.upiId || 'Your UPI ID'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ── Anti-Abuse Velocity Caps Notice (PRD A6) ── */}
      <Card sx={{ mb: 3, borderRadius: '14px', border: '1px solid #BAE6FD', bgcolor: '#F0F9FF' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon sx={{ color: '#0284C7' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#0369A1', fontSize: '0.88rem' }}>
                Velocity Cap Transparency: Anti-Abuse Rate Limits Active
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#0C4A6E' }}>
                Per government regulations (PRD A6), rewards are capped per milestone survey (1 payout per 3/6/12/24-month window). Velocity caps per trainee, per day, and total budget limits prevent fraudulent submissions.
              </Typography>
            </Box>
            <Chip label="Cap Status: Normal" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* ── Left Column: Payout Method Setup ── */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
              <AccountBalanceWalletIcon sx={{ color: '#059669' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem' }}>
                Saved Payout Method
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mb: 2.5 }}>
              Enter your UPI ID or mobile phone number for direct instant bank transfers upon survey completion.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="UPI ID / Mobile Number"
                placeholder="e.g. 9876543210@upi or yourname@okhdfcbank"
                value={upiIdInput}
                onChange={(e) => setUpiIdInput(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleSavePayoutMethod}
                disabled={savingPayout}
                sx={{ bgcolor: '#059669', textTransform: 'none', fontWeight: 700, borderRadius: '8px', '&:hover': { bgcolor: '#047857' } }}
              >
                {savingPayout ? 'Saving...' : 'Update & Verify Payout Method'}
              </Button>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #ECEEF4' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>
                  Supported Payout Channels:
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                • UPI (Google Pay, PhonePe, Paytm, BHIM, Bank VPA)
                <br />
                • Direct Mobile Recharge (Airtel, Jio, Vi, BSNL)
              </Typography>
            </Box>
          </Card>

          {/* Quick Stats Widget */}
          <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 1 }}>
              REWARD METRICS
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>Surveys Completed:</Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                {data.rewards?.length || 0} / 4
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>Potential Earnings:</Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                ₹500 (across 24 months)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>Payout Failure Rate:</Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>
                0% (All Settled)
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* ── Right Column: Milestone Surveys Timeline ── */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem' }}>
                  Milestone Check-In Trackers
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Scheduled survey intervals triggered under National Skilling Outcomes
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {milestones.map((m) => (
                <Box
                  key={m.milestone}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: m.completed ? '1px solid #A7F3D0' : '1px solid #ECEEF4',
                    bgcolor: m.completed ? '#ECFDF5' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: m.completed ? '#10B981' : '#F1F5F9',
                        color: m.completed ? '#FFFFFF' : '#64748B',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                      }}
                    >
                      {m.milestone}M
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>
                          {m.title}
                        </Typography>
                        <Chip
                          label={`₹${m.reward} Reward`}
                          size="small"
                          sx={{
                            bgcolor: m.completed ? '#D1FAE5' : '#FEF3C7',
                            color: m.completed ? '#065F46' : '#92400E',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.25 }}>
                        {m.desc}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    {m.completed ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                        label="Reward Paid ✓"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedMilestone(m.milestone);
                          setSurveyModalOpen(true);
                        }}
                        sx={{
                          bgcolor: '#059669',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          '&:hover': { bgcolor: '#047857' },
                        }}
                      >
                        Take Survey
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>

          {/* ── Transaction History Table (PRD S7) ── */}
          <Card sx={{ borderRadius: '16px', border: '1px solid #ECEEF4', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem', mb: 0.5 }}>
              Rewards Settlement Ledger
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mb: 2 }}>
              Audit trail of all disbursements credited to your account
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #ECEEF4', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>SURVEY MILESTONE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>PAYOUT REF</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton height={28} />
                      </TableCell>
                    </TableRow>
                  ) : data.rewards?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#64748B' }}>
                        No reward transactions yet. Complete your first check-in survey to receive ₹50.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.rewards?.map((r) => (
                      <TableRow key={r._id} hover>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
                            {r.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                            {new Date(r.paidAt || r.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>
                            +₹{r.amount}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={r.status?.toUpperCase()}
                            size="small"
                            color={r.status === 'paid' ? 'success' : 'warning'}
                            sx={{ fontSize: '0.68rem', height: 20, fontWeight: 700 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>
                            {r.transactionRef}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ── Check-In Survey Modal (PRD S8) ── */}
      <CheckInSurveyModal
        open={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        milestone={selectedMilestone}
        onSurveyCompleted={() => {
          fetchData();
          setSnackbar({ open: true, message: `Milestone check-in complete! Reward credited to your UPI wallet.`, severity: 'success' });
        }}
      />

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
