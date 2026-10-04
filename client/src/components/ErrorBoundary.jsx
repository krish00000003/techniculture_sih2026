import { Component } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 520,
              width: '100%',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <WarningIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred while rendering this view.
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  p: 1.5,
                  borderRadius: 2,
                  mb: 3,
                  textAlign: 'left',
                  maxHeight: 120,
                  overflowY: 'auto',
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main', wordBreak: 'break-word' }}>
                  {this.state.error.message || String(this.state.error)}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
