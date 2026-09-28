import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * Centered layout for public/auth screens (Login, Magic Link verify).
 */
export default function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Outlet />
      </Container>
    </Box>
  );
}
