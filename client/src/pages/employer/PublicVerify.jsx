import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import verificationApi from '../../api/verification';

export default function PublicVerify() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [error, setError] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  // Discrepancy correction state
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctedWage, setCorrectedWage] = useState('');
  const [correctedStartDate, setCorrectedStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadClaim() {
      try {
        const res = await verificationApi.getPublicVerification(token || 'token-exp-manipal-02');
        if (res.data.success) {
          setClaim(res.data.verification);
          setCorrectedWage(res.data.verification.claimedWage || '');
          setCorrectedStartDate(res.data.verification.claimedStartDate || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Verification token is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    }
    loadClaim();
  }, [token]);

  const handleRespond = async (decision) => {
    setActionLoading(true);
    try {
      const res = await verificationApi.respondPublicVerification(claim.token, {
        decision,
        correctedWage: isCorrecting ? correctedWage : claim.claimedWage,
        correctedStartDate: isCorrecting ? correctedStartDate : claim.claimedStartDate,
        notes,
      });

      if (res.data.success) {
        setSubmittedMessage(res.data.message);
        setClaim((prev) => ({ ...prev, status: decision === 'verify' ? 'verified' : 'disputed' }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording verification response');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8F9FE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2.5,
      }}
    >
      <Card
        sx={{
          maxWidth: 580,
          width: '100%',
          borderRadius: '20px',
          border: '1px solid #ECEEF4',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #ECEEF4',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: '#F3F0FF',
              color: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BusinessIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem', lineHeight: 1.2 }}>
              VocTrack Employer Verification Portal
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              Ministry of Skill Development & Entrepreneurship • One-Tap Verification
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <Skeleton height={32} width="80%" sx={{ mb: 1 }} />
              <Skeleton height={20} width="60%" sx={{ mb: 3 }} />
              <Skeleton height={140} variant="rounded" />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HighlightOffIcon sx={{ fontSize: 52, color: '#EF4444', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                Verification Link Expired or Invalid
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#64748B', mb: 3 }}>
                {error}
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>
                Return to Login
              </Button>
            </Box>
          ) : submittedMessage ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#10B981', mb: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                Response Recorded Successfully
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 440, mx: 'auto', mb: 3 }}>
                {submittedMessage}
              </Typography>
              <Button variant="contained" onClick={() => navigate('/login')} sx={{ bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700 }}>
                Sign In to Full Portal
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#6C5CE7', letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.5 }}>
                  EMPLOYMENT VERIFICATION DISPATCH
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.3 }}>
                  Did {claim.traineeName} work with {claim.claimedEmployer} as a {claim.claimedRole}?
                </Typography>
              </Box>

              {/* Claim Summary Card */}
              <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#F8F9FE', border: '1px solid #ECEEF4', mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      CANDIDATE
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                      {claim.traineeName}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      REPORTED ROLE
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                      {claim.claimedRole}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      CLAIMED WAGE
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#10B981', fontSize: '0.92rem' }}>
                      {claim.claimedWage}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      START DATE
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                      {claim.claimedStartDate || 'Recent placement'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Discrepancy Correction Box (Optional toggle) */}
              {isCorrecting ? (
                <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FCD34D', mb: 3 }}>
                  <Typography sx={{ fontWeight: 700, color: '#92400E', fontSize: '0.88rem', mb: 1.5 }}>
                    Enter Corrected Details or Discrepancy Reason:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField
                      label="Actual Monthly Wage"
                      size="small"
                      value={correctedWage}
                      onChange={(e) => setCorrectedWage(e.target.value)}
                      placeholder="e.g. ₹12,000 / month"
                      fullWidth
                    />
                    <TextField
                      label="Actual Start Date"
                      type="date"
                      size="small"
                      value={correctedStartDate}
                      onChange={(e) => setCorrectedStartDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Notes / Discrepancy Reason"
                      size="small"
                      multiline
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Trainee was an intern, not permanent staff"
                      fullWidth
                    />
                  </Box>

                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={() => handleRespond('dispute')}
                    disabled={actionLoading}
                    sx={{ mt: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    {actionLoading ? 'Submitting...' : 'Confirm Discrepancy / Update Record'}
                  </Button>
                </Box>
              ) : null}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  disabled={actionLoading}
                  onClick={() => handleRespond('verify')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '10px',
                    py: 1.4,
                  }}
                >
                  Yes, Verify Employment
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  size="large"
                  onClick={() => setIsCorrecting(!isCorrecting)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    borderColor: '#CBD5E1',
                    color: '#475569',
                  }}
                >
                  {isCorrecting ? 'Cancel Correction' : 'Report Discrepancy / No'}
                </Button>
              </Box>

              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', mt: 2.5 }}>
                Protected by single-use token • Verified response updates the National Skilling Outcome Registry
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
