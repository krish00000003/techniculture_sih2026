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
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';

const DISTRICT_LIST = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Other',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('trainee'); // 'trainee' | 'employer' | 'provider'
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [district, setDistrict] = useState('Mumbai');
  const [language, setLanguage] = useState('en');
  const [gstin, setGstin] = useState('');
  const [cin, setCin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setSnack({ open: true, message: 'Please enter your name', severity: 'warning' });
      return;
    }

    if (role === 'trainee' && !phone.trim()) {
      setSnack({ open: true, message: 'Phone number is required for Trainee account', severity: 'warning' });
      return;
    }

    if (role === 'employer' && !companyName.trim()) {
      setSnack({ open: true, message: 'Company name is required', severity: 'warning' });
      return;
    }

    if ((role === 'employer' || role === 'provider') && !email.trim() && !phone.trim()) {
      setSnack({ open: true, message: 'Please provide either an email or phone number', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        role,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        companyName: companyName.trim() || undefined,
        district: district || undefined,
        language: language || undefined,
        gstin: gstin.trim() || undefined,
        cin: cin.trim() || undefined,
      });

      setSnack({
        open: true,
        message: 'Account created successfully! Redirecting...',
        severity: 'success',
      });

      setTimeout(() => {
        navigate(ROLE_HOME[user.role] || '/');
      }, 500);
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

          {/* Role Selection */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            SELECT YOUR ROLE:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
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

          {/* Dynamic Registration Form */}
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
              InputProps={{
                startAdornment: <PersonOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
              }}
            />

            {/* Employer / Provider Specific: Organization Name */}
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
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
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
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                }}
              />
            )}

            {/* Phone Number */}
            <TextField
              id="register-phone"
              label="Phone Number"
              fullWidth
              size="medium"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required={role === 'trainee'}
              helperText={role === 'trainee' ? 'Used for passwordless login & outcome check-ins' : ''}
              InputProps={{
                startAdornment: <PhoneAndroidIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
              }}
            />

            {/* Email Address (Mandatory/recommended for Employer/Provider) */}
            {(role === 'employer' || role === 'provider') && (
              <TextField
                id="register-email"
                label="Official Email Address"
                type="email"
                fullWidth
                size="medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                }}
              />
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
                  <MenuItem value="hi">Hindi (हिन्दी)</MenuItem>
                  <MenuItem value="mr">Marathi (मराठी)</MenuItem>
                  <MenuItem value="bn">Bengali (বাংলা)</MenuItem>
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
                boxShadow: '0 4px 14px rgba(113,201,206,0.3)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : `Register as ${role.toUpperCase()}`}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Switch to Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
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
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
