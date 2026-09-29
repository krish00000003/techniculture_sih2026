import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#71C9CE',
      light: '#A6E3E9',
      dark: '#5BB0B5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A6E3E9',
      light: '#CBF1F5',
      dark: '#71C9CE',
    },
    background: {
      default: '#E3FDFD',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2D2E',
      secondary: '#5A7A7D',
    },
    success: { main: '#27AE60' },
    warning: { main: '#F2994A' },
    error: { main: '#EB5757' },
    info: { main: '#2D9CDB' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    htmlFontSize: 16,
    h1: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontWeight: 600, fontSize: '1.1rem' },
    h5: { fontWeight: 700, fontSize: '1.3rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem', color: '#5A7A7D' },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#5A7A7D',
    },
    body2: { fontSize: '0.875rem', color: '#5A7A7D' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          minHeight: 44, // PRD: ≥ 44px touch target
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#71C9CE',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(113,201,206,0.3)',
          '&:hover': { backgroundColor: '#5BB0B5' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(31,45,46,0.06), 0 1px 2px rgba(31,45,46,0.04)',
          border: '1px solid rgba(31,45,46,0.06)',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(31,45,46,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: '#FFFFFF' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(31,45,46,0.06)',
          padding: '14px 16px',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#5A7A7D',
          backgroundColor: '#F8FDFD',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F0FAFA !important',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
