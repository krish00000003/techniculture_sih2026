import { Box, Card, CardContent, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function ProviderUpload() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Data Upload
      </Typography>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            CSV / API Ingestion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload enrollment, attendance and graduation data.
            <br />
            Coming in Phase 2.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
