import { Box, Card, CardContent, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../context/AuthContext';

export default function TraineeDashboard() {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Welcome back, {user?.name}
      </Typography>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <HomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Course Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your ongoing, completed and recommended courses will appear here in Phase 2.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
