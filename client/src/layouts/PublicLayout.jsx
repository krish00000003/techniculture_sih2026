import { Box, Container, IconButton, Tooltip } from '@mui/material';
import { Outlet } from 'react-router-dom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useColorMode } from '../context/ThemeContext';

/**
 * Centered layout for public/auth screens (Login, Magic Link verify).
 */
export default function PublicLayout() {
  const { mode, toggleTheme } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: 2,
        transition: 'background-color 0.25s ease',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Tooltip title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'} arrow>
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: isDark ? '#71C9CE' : '#5A7A7D',
              bgcolor: isDark ? 'rgba(113, 201, 206, 0.12)' : 'rgba(0, 0, 0, 0.04)',
              p: 1,
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(113, 201, 206, 0.22)' : 'rgba(0, 0, 0, 0.08)',
                transform: 'rotate(20deg)',
              },
            }}
            aria-label="Toggle light and dark mode"
          >
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Container maxWidth="xs">
        <Outlet />
      </Container>
    </Box>
  );
}
