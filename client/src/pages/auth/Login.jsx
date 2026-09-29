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
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmsIcon from '@mui/icons-material/Sms';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';

export default function Login() {
  const { loginWithPassword, requestMagicLink } = useAuth();
  const navigate = useNavigate();

  // Mode: 'password' | 'magic-link'
  const [authMode, setAuthMode] = useState('password');

  // Password fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Magic link fields
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('whatsapp');

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  /* ── Password Login Submit ── */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setSnack({ open: true, message: 'Please enter your email/phone and password', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithPassword(identifier.trim(), password);
      setSnack({
        open: true,
        message: `Welcome back, ${user.name}! Redirecting...`,
        severity: 'success',
      });
      setTimeout(() => {
        navigate(ROLE_HOME[user.role] || '/');
      }, 500);
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── Magic Link Submit ── */
  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setSnack({ open: true, message: 'Please enter your phone number', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await requestMagicLink(phone.trim(), channel);
      setSnack({
        open: true,
        message: `Magic link sent via ${channel.toUpperCase()}! Check your phone or server console.`,
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

  /* ── Google sign-in ── */
  const handleGoogle = async () => {
    setSnack({
      open: true,
      message: 'Google Sign-In requires GOOGLE_CLIENT_ID in server/.env.',
      severity: 'info',
    });
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
          <Box sx={{ textAlign: 'center', mb: 3 }}>
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
              Trajectory
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
            <Tab label="Register / Join" component={RouterLink} to="/register" />
          </Tabs>

          {/* ── User Choice: Password vs Magic Link ── */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.25,
              mb: 3,
              p: 0.5,
              bgcolor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #ECEEF4',
            }}
          >
            <Button
              onClick={() => setAuthMode('password')}
              variant={authMode === 'password' ? 'contained' : 'text'}
              startIcon={<LockOutlinedIcon />}
              sx={{
                borderRadius: '9px',
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                bgcolor: authMode === 'password' ? '#6C5CE7' : 'transparent',
                color: authMode === 'password' ? '#FFFFFF' : '#64748B',
                boxShadow: authMode === 'password' ? '0 2px 8px rgba(108,92,231,0.25)' : 'none',
                '&:hover': {
                  bgcolor: authMode === 'password' ? '#5A4AD1' : '#F1F5F9',
                },
              }}
            >
              Password
            </Button>

            <Button
              onClick={() => setAuthMode('magic-link')}
              variant={authMode === 'magic-link' ? 'contained' : 'text'}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                borderRadius: '9px',
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                bgcolor: authMode === 'magic-link' ? '#6C5CE7' : 'transparent',
                color: authMode === 'magic-link' ? '#FFFFFF' : '#64748B',
                boxShadow: authMode === 'magic-link' ? '0 2px 8px rgba(108,92,231,0.25)' : 'none',
                '&:hover': {
                  bgcolor: authMode === 'magic-link' ? '#5A4AD1' : '#F1F5F9',
                },
              }}
            >
              Magic Link
            </Button>
          </Box>

          {/* ── Mode A: Password Login ── */}
          {authMode === 'password' ? (
            <Box component="form" onSubmit={handlePasswordLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="login-identifier"
                fullWidth
                label="Email or Phone Number"
                placeholder="name@example.com or +91 98765 43210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                id="login-password"
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                id="password-login-btn"
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !identifier.trim() || !password}
                sx={{
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                  boxShadow: '0 4px 14px rgba(108,92,231,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5A4AD1 0%, #3B2BBF 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In with Password'}
              </Button>
            </Box>
          ) : (
            /* ── Mode B: Magic Link Login ── */
            <Box component="form" onSubmit={handleMagicLink} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="phone-input"
                fullWidth
                label="Phone number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneAndroidIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel id="login-channel-label">Send Magic Link To</InputLabel>
                <Select
                  labelId="login-channel-label"
                  id="login-channel"
                  value={channel}
                  label="Send Magic Link To"
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <MenuItem value="whatsapp">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WhatsAppIcon sx={{ color: '#25D366', fontSize: 18 }} />
                      <span>WhatsApp (Instant)</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="sms">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmsIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                      <span>SMS Text Message</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                id="get-magic-link-btn"
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !phone.trim()}
                sx={{
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #71C9CE 0%, #5BB0B5 100%)',
                  boxShadow: '0 4px 14px rgba(113,201,206,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5BB0B5 0%, #44979C 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Magic Link'}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
              >
                A secure one-time link will be sent to your phone.
                <br />
                No password needed.
              </Typography>
            </Box>
          )}

          {/* Divider */}
          <Divider sx={{ my: 2.5, fontSize: 13, color: 'text.secondary' }}>
            or continue with
          </Divider>

          {/* Google Sign-In */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogle}
            sx={{
              borderRadius: '10px',
              borderColor: '#ECEEF4',
              color: '#1E293B',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            Continue with Google
          </Button>

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
                Join with Password or Magic Link
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
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
