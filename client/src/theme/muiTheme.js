import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#71C9CE',
      light: '#A6E3E9',
      dark: '#5BB0B5',
      contrastText: '#1F2D2E',
    },
    secondary: {
      main: '#A6E3E9',
      light: '#CBF1F5',
      dark: '#71C9CE',
    },
    background: {
      default: '#E3FDFD',
      paper: '#CBF1F5',
    },
    text: {
      primary: '#1F2D2E',
      secondary: '#3D5C5E',
    },
    success: { main: '#4CAF50' },
    warning: { main: '#FF9800' },
    error: { main: '#E53935' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    htmlFontSize: 16,
    h1: { fontWeight: 700, fontSize: '2rem' },
    h2: { fontWeight: 600, fontSize: '1.5rem' },
    h3: { fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontWeight: 600, fontSize: '1.1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          minHeight: 44, // PRD: ≥ 44px touch target
        },
        containedPrimary: {
          backgroundColor: '#71C9CE',
          color: '#1F2D2E',
          '&:hover': { backgroundColor: '#5BB0B5' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#CBF1F5',
          boxShadow: '0 2px 8px rgba(31,45,46,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: '#CBF1F5' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
    },
  },
});

export default theme;
