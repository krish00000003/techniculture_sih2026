import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#71C9CE',
        light: '#A6E3E9',
        dark: '#5BB0B5',
        contrastText: isDark ? '#0B1315' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#2C4347' : '#A6E3E9',
        light: isDark ? '#3B575D' : '#CBF1F5',
        dark: isDark ? '#1F3134' : '#71C9CE',
        contrastText: isDark ? '#E3FDFD' : '#1F2D2E',
      },
      background: {
        default: isDark ? '#0B1315' : '#E3FDFD',
        paper: isDark ? '#142023' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E3FDFD' : '#1F2D2E',
        secondary: isDark ? '#8EA8AB' : '#5A7A7D',
      },
      divider: isDark ? 'rgba(203, 241, 245, 0.1)' : 'rgba(31, 45, 46, 0.08)',
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
      subtitle1: {
        fontWeight: 500,
        fontSize: '0.95rem',
        color: isDark ? '#8EA8AB' : '#5A7A7D',
      },
      subtitle2: {
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: isDark ? '#8EA8AB' : '#5A7A7D',
      },
      body2: {
        fontSize: '0.875rem',
        color: isDark ? '#8EA8AB' : '#5A7A7D',
      },
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
            color: isDark ? '#0B1315' : '#FFFFFF',
            boxShadow: isDark
              ? '0 2px 10px rgba(113,201,206,0.2)'
              : '0 2px 8px rgba(113,201,206,0.3)',
            '&:hover': {
              backgroundColor: '#5BB0B5',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? '#142023' : '#FFFFFF',
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 1px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
              : '0 1px 3px rgba(31,45,46,0.06), 0 1px 2px rgba(31,45,46,0.04)',
            border: isDark
              ? '1px solid rgba(203,241,245,0.09)'
              : '1px solid rgba(31,45,46,0.06)',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 16px rgba(0,0,0,0.4)'
                : '0 4px 12px rgba(31,45,46,0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#142023' : '#FFFFFF',
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(203,241,245,0.08)' : 'rgba(31,45,46,0.06)',
            padding: '14px 16px',
            color: isDark ? '#E3FDFD' : '#1F2D2E',
          },
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: isDark ? '#8EA8AB' : '#5A7A7D',
            backgroundColor: isDark ? '#18272A' : '#F8FDFD',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: (isDark ? '#1A292D' : '#F0FAFA') + ' !important',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'medium' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '& fieldset': {
              borderColor: isDark ? 'rgba(203, 241, 245, 0.18)' : 'rgba(31, 45, 46, 0.16)',
            },
            '&:hover fieldset': {
              borderColor: '#71C9CE !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#71C9CE !important',
            },
          },
          input: {
            color: isDark ? '#E3FDFD' : '#1F2D2E',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDark ? '#8EA8AB' : '#5A7A7D',
            '&.Mui-focused': {
              color: '#71C9CE',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#142023' : '#FFFFFF',
            border: isDark ? '1px solid rgba(203, 241, 245, 0.12)' : 'none',
            borderRadius: 16,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(203, 241, 245, 0.09)' : 'rgba(31, 45, 46, 0.08)',
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#71C9CE',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: isDark ? '#8EA8AB' : '#5A7A7D',
            '&.Mui-selected': {
              color: '#71C9CE',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1C2E32' : '#1F2D2E',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            borderRadius: 8,
          },
        },
      },
    },
  });
};

const defaultTheme = getAppTheme('light');
export default defaultTheme;
