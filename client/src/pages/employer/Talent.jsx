import { Box, Card, CardContent, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

export default function EmployerTalent() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Talent Portal
      </Typography>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Search Graduates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter and browse opted-in graduates by skill, district and course.
            <br />
            Coming in Phase 4.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
