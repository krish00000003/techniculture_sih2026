import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth, ROLE_HOME } from '../context/AuthContext';

/**
 * Wraps routes that require authentication.
 *
 * @param {string[]} roles — allowed roles (e.g. ['trainee']). If empty, any authenticated user is allowed.
 */
export default function ProtectedRoute({ roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role → redirect to their own home
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return <Outlet />;
}
