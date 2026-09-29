import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';

export default function Login() {
  const { loginWithGoogle, requestMagicLink, devLogin } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  /* ── Dev Login Bypass ── */
  const handleDevLogin = async (role) => {
    setDevLoading(role);
    try {
      const user = await devLogin(role);
      setSnack({
        open: true,
        message: `Logged in as ${role}! Redirecting...`,
        severity: 'success',
      });
      setTimeout(() => {
        navigate(ROLE_HOME[user.role] || '/');
      }, 500);
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Dev login failed',
        severity: 'error',
      });
    } finally {
      setDevLoading('');
    }
  };

  /* ── Google sign-in ── */
  const handleGoogle = async () => {
    // For now, show info — requires GOOGLE_CLIENT_ID to be configured
    setSnack({
      open: true,
      message: 'Google Sign-In requires a configured Google Client ID. Set GOOGLE_CLIENT_ID in server/.env.',
      severity: 'info',
    });
  };

  /* ── Magic link ── */
  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      await requestMagicLink(phone.trim());
      setSnack({
        open: true,
        message: 'Magic link sent! Check the server console for the link.',
        severity: 'success',
      });
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to send magic link',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 24px rgba(31,45,46,0.10)',
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Logo / title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #71C9CE 0%, #5BB0B5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              VocTrack
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vocational Training Outcome Tracker
            </Typography>
          </Box>

          {/* Navigation Tabs (Login / Register) */}
          <Tabs
            value={0}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.95rem' },
            }}
          >
            <Tab label="Log In" />
            <Tab label="Register" component={RouterLink} to="/register" />
          </Tabs>

          {/* Google Sign-In */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogle}
            sx={{
              mb: 2,
              borderColor: 'rgba(31,45,46,0.15)',
              color: 'text.primary',
              '&:hover': { bgcolor: 'secondary.light', borderColor: 'primary.main' },
            }}
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <Divider sx={{ my: 3, fontSize: 13, color: 'text.secondary' }}>
            or sign in as trainee
          </Divider>

          {/* Magic link form */}
          <Box component="form" onSubmit={handleMagicLink}>
            <TextField
              id="phone-input"
              fullWidth
              label="Phone number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <PhoneAndroidIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />
            <Button
              id="get-magic-link-btn"
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !phone.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'Get magic link'}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            A one-time link will be sent via WhatsApp / SMS.
            <br />
            No password needed.
          </Typography>

          {/* ── Quick Dev Login Bypass ── */}
          <Divider sx={{ my: 2.5, fontSize: 11, fontWeight: 700, color: 'text.secondary', letterSpacing: 1 }}>
            DEV TESTING BYPASS
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              id="dev-login-admin-btn"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={devLoading === 'admin' ? <CircularProgress size={18} color="inherit" /> : <AdminPanelSettingsIcon />}
              onClick={() => handleDevLogin('admin')}
              disabled={Boolean(devLoading)}
              sx={{
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(113,201,206,0.3)',
              }}
            >
              {devLoading === 'admin' ? 'Logging in...' : 'Log In As Admin (Instant)'}
            </Button>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 0.5 }}>
              <Button
                id="dev-login-trainee-btn"
                variant="outlined"
                size="small"
                startIcon={devLoading === 'trainee' ? <CircularProgress size={14} color="inherit" /> : <PersonIcon />}
                onClick={() => handleDevLogin('trainee')}
                disabled={Boolean(devLoading)}
              >
                Trainee
              </Button>
              <Button
                id="dev-login-provider-btn"
                variant="outlined"
                size="small"
                startIcon={devLoading === 'provider' ? <CircularProgress size={14} color="inherit" /> : <SchoolIcon />}
                onClick={() => handleDevLogin('provider')}
                disabled={Boolean(devLoading)}
              >
                Provider
              </Button>
              <Button
                id="dev-login-employer-btn"
                variant="outlined"
                size="small"
                startIcon={devLoading === 'employer' ? <CircularProgress size={14} color="inherit" /> : <BusinessIcon />}
                onClick={() => handleDevLogin('employer')}
                disabled={Boolean(devLoading)}
              >
                Employer
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Switch to Register link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" component="div">
              Don't have an account?{' '}
              <Typography
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Register here
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
