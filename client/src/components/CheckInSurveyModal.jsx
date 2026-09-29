import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Grid,
  Card,
  CardActionArea,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SchoolIcon from '@mui/icons-material/School';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import surveyApi from '../api/survey';

const STATUS_OPTIONS = [
  {
    key: 'Employed',
    label: 'Employed (Formal)',
    desc: 'Working with a company / payroll with a monthly wage',
    icon: <WorkIcon sx={{ fontSize: 28, color: '#6C5CE7' }} />,
    color: '#6C5CE7',
    bg: '#F3F0FF',
  },
  {
    key: 'Self-Employed',
    label: 'Self-Employed / Freelance',
    desc: 'Running a trade, workshop, freelancing, or family business',
    icon: <StorefrontIcon sx={{ fontSize: 28, color: '#2563EB' }} />,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    key: 'Apprentice',
    label: 'Apprenticeship / Intern',
    desc: 'Practical on-the-job training with monthly stipend',
    icon: <SchoolIcon sx={{ fontSize: 28, color: '#10B981' }} />,
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    key: 'Unemployed',
    label: 'Seeking Work / Not Employed',
    desc: 'Looking for placement or facing employment barriers',
    icon: <SearchOffIcon sx={{ fontSize: 28, color: '#EF4444' }} />,
    color: '#EF4444',
    bg: '#FEF2F2',
  },
];

export default function CheckInSurveyModal({ open, onClose, milestone = 3, onSurveyCompleted }) {
  const [step, setStep] = useState(1);
  const [employmentStatus, setEmploymentStatus] = useState('Employed');

  // Form Fields
  const [employerName, setEmployerName] = useState('Tata Motors');
  const [role, setRole] = useState('Junior Technician');
  const [monthlyWage, setMonthlyWage] = useState('18500');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [employerContact, setEmployerContact] = useState('hr@tatamotors.com');

  // Self-Employed fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Repair & Service Workshop');
  const [monthlyEarnings, setMonthlyEarnings] = useState('15000');
  const [daysWorked, setDaysWorked] = useState('24');

  // Unemployed fields
  const [reasonCode, setReasonCode] = useState('Transport / commute issues');
  const [supportNeeded, setSupportNeeded] = useState('Skill bridge course & placement assistance');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rewardResult, setRewardResult] = useState(null);

  const resetForm = () => {
    setStep(1);
    setRewardResult(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const answers = {
        employerName,
        role,
        monthlyWage,
        startDate,
        employerContact,
        businessName,
        businessType,
        monthlyEarnings,
        daysWorked,
        reasonCode,
        supportNeeded,
      };

      const res = await surveyApi.submitSurvey({
        milestone,
        employmentStatus,
        answers,
      });

      setRewardResult(res.data);
      if (onSurveyCompleted) onSurveyCompleted(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit check-in survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#6C5CE7' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.15rem' }}>
            {milestone}-Month Post-Placement Check-In
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {!rewardResult && (
        <Box sx={{ px: 3, pt: 1, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
              STEP {step} OF 2: {step === 1 ? 'EMPLOYMENT STATUS' : 'OUTCOME DETAILS'}
            </Typography>
            <Chip
              icon={<CurrencyRupeeIcon sx={{ fontSize: '13px !important' }} />}
              label={`Earn ₹${milestone === 3 ? 50 : 100} UPI Reward`}
              size="small"
              sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.7rem' }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={step === 1 ? 50 : 100}
            sx={{ height: 6, borderRadius: 3, bgcolor: '#ECEEF4', '& .MuiLinearProgress-bar': { bgcolor: '#6C5CE7' } }}
          />
        </Box>
      )}

      <DialogContent dividers sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── Success Celebration View ── */}
        {rewardResult ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              Survey Completed Successfully! 🎉
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: '#64748B', maxWidth: 440, mx: 'auto', mb: 3 }}>
              Your response has been verified and securely logged into the national vocational outcome ledger.
            </Typography>

            {/* Reward Box */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '14px',
                border: '2px dashed #10B981',
                bgcolor: '#F0FDF4',
                maxWidth: 420,
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                <CelebrationIcon sx={{ color: '#10B981' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
                  ₹{rewardResult.reward?.amount} UPI Reward Credited!
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>
                Payout sent to: {rewardResult.reward?.payoutMethod}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#047857', mt: 0.5 }}>
                Txn Ref: {rewardResult.reward?.transactionRef}
              </Typography>
            </Box>

            {rewardResult.employment?.verifyToken && (
              <Alert severity="info" sx={{ textAlign: 'left', fontSize: '0.82rem' }}>
                <strong>Employer Verification Triggered:</strong> A one-tap verification dispatch link was automatically sent to your employer ({employerContact}).
              </Alert>
            )}
          </Box>
        ) : step === 1 ? (
          /* ── Step 1: Select Status ── */
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              What is your current work status?
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748B', mb: 2.5 }}>
              Select the option that best reflects your primary activity since training completion.
            </Typography>

            <Grid container spacing={2}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = employmentStatus === opt.key;
                return (
                  <Grid item xs={12} key={opt.key}>
                    <Card
                      sx={{
                        borderRadius: '12px',
                        border: isSelected ? `2px solid ${opt.color}` : '1px solid #ECEEF4',
                        bgcolor: isSelected ? opt.bg : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CardActionArea onClick={() => setEmploymentStatus(opt.key)} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {opt.icon}
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.95rem' }}>
                              {opt.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                              {opt.desc}
                            </Typography>
                          </Box>
                          <Radio checked={isSelected} sx={{ color: opt.color, '&.Mui-checked': { color: opt.color } }} />
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ) : (
          /* ── Step 2: Branch Details ── */
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              {employmentStatus === 'Employed' && 'Tell us about your current job'}
              {employmentStatus === 'Self-Employed' && 'Details about your business / trade'}
              {employmentStatus === 'Apprentice' && 'Apprenticeship placement details'}
              {employmentStatus === 'Unemployed' && 'Placement feedback & reasons'}
            </Typography>

            {/* FORMAL EMPLOYMENT BRANCH */}
            {employmentStatus === 'Employed' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Employer / Company Name"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Your Job Role / Designation"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Monthly In-Hand Wage (₹)"
                      type="number"
                      value={monthlyWage}
                      onChange={(e) => setMonthlyWage(e.target.value)}
                      fullWidth
                      size="small"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Joining Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Employer HR / Supervisor Email or Phone"
                  value={employerContact}
                  onChange={(e) => setEmployerContact(e.target.value)}
                  helperText="Used for single-use one-tap verification (no password needed by employer)"
                  fullWidth
                  size="small"
                  required
                />
              </Box>
            )}

            {/* SELF-EMPLOYMENT BRANCH */}
            {employmentStatus === 'Self-Employed' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Trade / Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ramesh Electricals & Solar Solutions"
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Business / Craft Type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Avg Monthly Net Earnings (₹)"
                      type="number"
                      value={monthlyEarnings}
                      onChange={(e) => setMonthlyEarnings(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Days Worked Per Month"
                      type="number"
                      value={daysWorked}
                      onChange={(e) => setDaysWorked(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* APPRENTICE BRANCH */}
            {employmentStatus === 'Apprentice' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Company / Workshop Name"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Apprenticeship Trade / Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
                <TextField
                  label="Monthly Stipend (₹)"
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
              </Box>
            )}

            {/* UNEMPLOYED BRANCH */}
            {employmentStatus === 'Unemployed' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Primary Reason for Non-Placement"
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  select
                  SelectProps={{ native: true }}
                  fullWidth
                  size="small"
                >
                  <option value="Low wages in the sector">Low wages in the sector</option>
                  <option value="Transport / commute issues">Transport / commute issues</option>
                  <option value="Curriculum not relevant to local market">Curriculum not relevant to local market</option>
                  <option value="Family responsibilities">Family responsibilities</option>
                  <option value="Health / personal issues">Health / personal issues</option>
                  <option value="Migration to another district">Migration to another district</option>
                  <option value="Lack of placement drives">Lack of placement drives</option>
                </TextField>
                <TextField
                  label="What support would help you get hired?"
                  value={supportNeeded}
                  onChange={(e) => setSupportNeeded(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        {rewardResult ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleClose}
            sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700 }}
          >
            Done & Return to Dashboard
          </Button>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {step === 2 ? (
              <Button onClick={() => setStep(1)} sx={{ textTransform: 'none' }}>
                Back
              </Button>
            ) : (
              <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
            )}

            {step === 1 ? (
              <Button
                variant="contained"
                onClick={() => setStep(2)}
                sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700 }}
              >
                Continue to Details
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {loading ? 'Submitting...' : 'Submit & Claim Reward'}
              </Button>
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
