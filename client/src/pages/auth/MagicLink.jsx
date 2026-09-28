import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';

export default function MagicLinkVerify() {
  const { token } = useParams();
  const { verifyMagicLink } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const user = await verifyMagicLink(token);
        if (!cancelled) {
          setStatus('success');
          // Auto-redirect after a short pause
          setTimeout(() => {
            navigate(ROLE_HOME[user.role] || '/', { replace: true });
          }, 1500);
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Card
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: '0 4px 24px rgba(31,45,46,0.10)',
        textAlign: 'center',
      }}
    >
      <CardContent>
        {status === 'verifying' && (
          <>
            <CircularProgress size={48} sx={{ color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">Signing you in…</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              You're in!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to your dashboard…
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Link expired or invalid
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Magic links are single-use and expire in 15 minutes.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
            >
              Send a new link
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
