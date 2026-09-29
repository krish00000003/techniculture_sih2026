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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import LanguageIcon from '@mui/icons-material/Language';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmsIcon from '@mui/icons-material/Sms';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';

const DISTRICT_LIST = [
  'Kamrup',
  'Jorhat',
  'Dibrugarh',
  'Silchar',
  'Nagaon',
  'Tezpur',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Kolkata',
  'Pune',
  'Other',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('trainee'); // 'trainee' | 'employer' | 'provider'
  const [joinMethod, setJoinMethod] = useState('password'); // 'password' | 'magic-link'
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [channel, setChannel] = useState('whatsapp');

  // Role-specific states
  const [companyName, setCompanyName] = useState('');
  const [district, setDistrict] = useState('Kamrup');
  const [language, setLanguage] = useState('en');
  const [gstin, setGstin] = useState('');
  const [cin, setCin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setSnack({ open: true, message: 'Please enter your name', severity: 'warning' });
      return;
    }

    // Validation based on join method
    if (joinMethod === 'password') {
      if (!password) {
        setSnack({ open: true, message: 'Please set a password', severity: 'warning' });
        return;
      }
      if (password.length < 6) {
        setSnack({ open: true, message: 'Password must be at least 6 characters long', severity: 'warning' });
        return;
      }
      if (password !== confirmPassword) {
        setSnack({ open: true, message: 'Passwords do not match', severity: 'warning' });
        return;
      }
      if (role === 'trainee' && !phone.trim() && !email.trim()) {
        setSnack({ open: true, message: 'Please provide either a phone number or email', severity: 'warning' });
        return;
      }
    } else {
      // Magic link requires phone
      if (!phone.trim()) {
        setSnack({ open: true, message: 'Phone number is required for Magic Link access', severity: 'warning' });
        return;
      }
    }

    if (role === 'employer' && !companyName.trim()) {
      setSnack({ open: true, message: 'Company name is required', severity: 'warning' });
      return;
    }

    if (role === 'provider' && !companyName.trim()) {
      setSnack({ open: true, message: 'Institute name is required', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        role,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        password: joinMethod === 'password' ? password : undefined,
        joinMethod,
        channel,
        companyName: companyName.trim() || undefined,
        district: district || undefined,
        language: language || undefined,
        gstin: gstin.trim() || undefined,
        cin: cin.trim() || undefined,
      });

      if (joinMethod === 'magic-link') {
        setSnack({
          open: true,
          message: `Account created! One-time magic link sent to ${phone} via ${channel.toUpperCase()}.`,
          severity: 'success',
        });
      } else {
        setSnack({
          open: true,
          message: 'Account created with password! Redirecting...',
          severity: 'success',
        });
      }

      setTimeout(() => {
        navigate(ROLE_HOME[user.role] || '/');
      }, 700);
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Registration failed',
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
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 24px rgba(31,45,46,0.10)',
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Header & Logo */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
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
            value={1}
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
            <Tab label="Log In" component={RouterLink} to="/login" />
            <Tab label="Register" />
          </Tabs>

          {/* ── Step 1: Role Selection ── */}
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary', display: 'block', letterSpacing: '0.05em' }}>
            1. SELECT YOUR ROLE:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2.5 }}>
            <Button
              variant={role === 'trainee' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setRole('trainee')}
              startIcon={<SchoolIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                py: 1,
                borderRadius: 2,
              }}
            >
              Trainee
            </Button>
            <Button
              variant={role === 'employer' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setRole('employer')}
              startIcon={<BusinessIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                py: 1,
                borderRadius: 2,
              }}
            >
              Employer
            </Button>
            <Button
              variant={role === 'provider' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setRole('provider')}
              startIcon={<BadgeIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                py: 1,
                borderRadius: 2,
              }}
            >
              Provider
            </Button>
          </Box>

          {/* ── Step 2: Choose Join Method (Password vs Magic Link) ── */}
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary', display: 'block', letterSpacing: '0.05em' }}>
            2. CHOOSE HOW YOU'D LIKE TO JOIN:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
              mb: 3,
              p: 0.5,
              bgcolor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #ECEEF4',
            }}
          >
            <Button
              onClick={() => setJoinMethod('password')}
              variant={joinMethod === 'password' ? 'contained' : 'text'}
              startIcon={<LockOutlinedIcon />}
              sx={{
                borderRadius: '9px',
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                bgcolor: joinMethod === 'password' ? '#6C5CE7' : 'transparent',
                color: joinMethod === 'password' ? '#FFFFFF' : '#64748B',
                boxShadow: joinMethod === 'password' ? '0 2px 8px rgba(108,92,231,0.25)' : 'none',
                '&:hover': {
                  bgcolor: joinMethod === 'password' ? '#5A4AD1' : '#F1F5F9',
                },
              }}
            >
              Join with Password
            </Button>

            <Button
              onClick={() => setJoinMethod('magic-link')}
              variant={joinMethod === 'magic-link' ? 'contained' : 'text'}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                borderRadius: '9px',
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                bgcolor: joinMethod === 'magic-link' ? '#6C5CE7' : 'transparent',
                color: joinMethod === 'magic-link' ? '#FFFFFF' : '#64748B',
                boxShadow: joinMethod === 'magic-link' ? '0 2px 8px rgba(108,92,231,0.25)' : 'none',
                '&:hover': {
                  bgcolor: joinMethod === 'magic-link' ? '#5A4AD1' : '#F1F5F9',
                },
              }}
            >
              Join with Magic Link
            </Button>
          </Box>

          {/* Join Method Hint */}
          <Box
            sx={{
              p: 1.5,
              mb: 2.5,
              borderRadius: '10px',
              bgcolor: joinMethod === 'password' ? '#F5F3FF' : '#EFF6FF',
              border: `1px solid ${joinMethod === 'password' ? '#DDD6FE' : '#BFDBFE'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            {joinMethod === 'password' ? (
              <>
                <VpnKeyIcon sx={{ color: '#6C5CE7', fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.4 }}>
                  <strong>Password Access:</strong> Set a secure password to sign in from any browser using your email or phone.
                </Typography>
              </>
            ) : (
              <>
                <AutoAwesomeIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.4 }}>
                  <strong>Passwordless Access:</strong> No passwords to remember. You will receive a 1-click magic link via WhatsApp or SMS.
                </Typography>
              </>
            )}
          </Box>

          {/* ── Registration Form ── */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Common Name Field */}
            <TextField
              id="register-name"
              label={role === 'employer' ? 'Contact Person Name' : 'Full Name'}
              fullWidth
              size="medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'employer' ? 'e.g. Rahul Sharma' : 'e.g. Priya Patil'}
              required
              slotProps={{
                input: {
                  startAdornment: <PersonOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
            />

            {/* Employer / Provider: Organization Name */}
            {role === 'employer' && (
              <TextField
                id="register-company"
                label="Company / Enterprise Name"
                fullWidth
                size="medium"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Engineering Ltd"
                required
                slotProps={{
                  input: {
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                  },
                }}
              />
            )}

            {role === 'provider' && (
              <TextField
                id="register-institute"
                label="Training Institute / Centre Name"
                fullWidth
                size="medium"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Skill India Training Academy"
                required
                slotProps={{
                  input: {
                    startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                  },
                }}
              />
            )}

            {/* Phone Number (Required for Magic Link, or recommended for password) */}
            <TextField
              id="register-phone"
              label="Phone Number"
              fullWidth
              size="medium"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required={joinMethod === 'magic-link' || role === 'trainee'}
              helperText={
                joinMethod === 'magic-link'
                  ? 'Required: Your one-time login link will be delivered here'
                  : 'Can be used to log in along with password'
              }
              slotProps={{
                input: {
                  startAdornment: <PhoneAndroidIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
            />

            {/* Delivery Channel for Magic Link */}
            {joinMethod === 'magic-link' && (
              <FormControl fullWidth size="medium">
                <InputLabel id="channel-label">Deliver Magic Link Via</InputLabel>
                <Select
                  labelId="channel-label"
                  id="register-channel"
                  value={channel}
                  label="Deliver Magic Link Via"
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <MenuItem value="whatsapp">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WhatsAppIcon sx={{ color: '#25D366', fontSize: 20 }} />
                      <span>WhatsApp Message (Instant)</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="sms">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmsIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                      <span>SMS Text Message</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Email Address */}
            <TextField
              id="register-email"
              label={joinMethod === 'password' ? 'Email Address' : 'Email Address (Optional)'}
              type="email"
              fullWidth
              size="medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required={role === 'employer' || role === 'provider' || (joinMethod === 'password' && !phone.trim())}
              slotProps={{
                input: {
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
            />

            {/* Password Fields (Only when Join with Password is selected) */}
            {joinMethod === 'password' && (
              <>
                <TextField
                  id="register-password"
                  label="Choose Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  size="medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  helperText="At least 6 characters"
                  slotProps={{
                    input: {
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
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

                <TextField
                  id="register-confirm-password"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  size="medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  error={Boolean(confirmPassword && password !== confirmPassword)}
                  helperText={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
                  slotProps={{
                    input: {
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </>
            )}

            {/* District Selection */}
            {(role === 'trainee' || role === 'provider') && (
              <FormControl fullWidth size="medium">
                <InputLabel id="district-label">District / Region</InputLabel>
                <Select
                  labelId="district-label"
                  id="register-district"
                  value={district}
                  label="District / Region"
                  onChange={(e) => setDistrict(e.target.value)}
                  startAdornment={<LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />}
                >
                  {DISTRICT_LIST.map((dist) => (
                    <MenuItem key={dist} value={dist}>
                      {dist}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Trainee: Preferred Language */}
            {role === 'trainee' && (
              <FormControl fullWidth size="medium">
                <InputLabel id="language-label">Preferred Communication Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="register-language"
                  value={language}
                  label="Preferred Communication Language"
                  onChange={(e) => setLanguage(e.target.value)}
                  startAdornment={<LanguageIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="as">Assamese (অসমীয়া)</MenuItem>
                  <MenuItem value="hi">Hindi (हिन्दी)</MenuItem>
                  <MenuItem value="bn">Bengali (বাংলা)</MenuItem>
                  <MenuItem value="mr">Marathi (मराठी)</MenuItem>
                  <MenuItem value="ta">Tamil (தமிழ்)</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Employer: GSTIN / CIN verification */}
            {role === 'employer' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <TextField
                  id="register-gstin"
                  label="GSTIN (Optional)"
                  size="small"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AAACG0000A1Z5"
                  helperText="Checked against GST registry"
                />
                <TextField
                  id="register-cin"
                  label="CIN (Optional)"
                  size="small"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  placeholder="U72900MH2020PTC123456"
                  helperText="Ministry of Corporate Affairs"
                />
              </Box>
            )}

            {/* Submit Button */}
            <Button
              id="submit-register-btn"
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: '10px',
                background: joinMethod === 'password'
                  ? 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)'
                  : 'linear-gradient(135deg, #71C9CE 0%, #5BB0B5 100%)',
                boxShadow: '0 4px 14px rgba(108,92,231,0.25)',
                '&:hover': {
                  background: joinMethod === 'password'
                    ? 'linear-gradient(135deg, #5A4AD1 0%, #3B2BBF 100%)'
                    : 'linear-gradient(135deg, #5BB0B5 0%, #44979C 100%)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : joinMethod === 'password' ? (
                `Join with Password as ${role.toUpperCase()}`
              ) : (
                `Join with Magic Link as ${role.toUpperCase()}`
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Switch to Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" component="div">
              Already have an account?{' '}
              <Typography
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Log in here
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
