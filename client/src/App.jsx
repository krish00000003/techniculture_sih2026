import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import Login from './pages/auth/Login';
import MagicLinkVerify from './pages/auth/MagicLink';

// Role home pages
import TraineeDashboard from './pages/trainee/Dashboard';
import EmployerTalent from './pages/employer/Talent';
import ProviderUpload from './pages/provider/Upload';

// Admin pages (S14–S19)
import AdminRankings from './pages/admin/Rankings';
import AdminSkillGaps from './pages/admin/SkillGaps';
import AdminActions from './pages/admin/Actions';
import AdminAttrition from './pages/admin/Attrition';
import AdminDuplicates from './pages/admin/Duplicates';
import AdminSettings from './pages/admin/Settings';

// Protected route wrapper
import ProtectedRoute from './routes/ProtectedRoute';

/**
 * Redirect "/" to the user's role home if logged in, or to /login.
 */
function RootRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route index element={<RootRedirect />} />

        {/* ── Public routes ── */}
        <Route element={<PublicLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="auth/magic-link/:token" element={<MagicLinkVerify />} />
        </Route>

        {/* ── Trainee routes ── */}
        <Route element={<ProtectedRoute roles={['trainee']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="trainee/dashboard" element={<TraineeDashboard />} />
            {/* Phase 2+ stubs */}
            <Route path="trainee/cv" element={<TraineeDashboard />} />
            <Route path="trainee/jobs" element={<TraineeDashboard />} />
            <Route path="trainee/me" element={<TraineeDashboard />} />
          </Route>
        </Route>

        {/* ── Employer routes ── */}
        <Route element={<ProtectedRoute roles={['employer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="employer/talent" element={<EmployerTalent />} />
            <Route path="employer/verifications" element={<EmployerTalent />} />
            <Route path="employer/profile" element={<EmployerTalent />} />
          </Route>
        </Route>

        {/* ── Provider routes ── */}
        <Route element={<ProtectedRoute roles={['provider']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="provider/upload" element={<ProviderUpload />} />
            <Route path="provider/alerts" element={<ProviderUpload />} />
          </Route>
        </Route>

        {/* ── Admin routes (S14–S19) ── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="admin/rankings" element={<AdminRankings />} />
            <Route path="admin/skill-gaps" element={<AdminSkillGaps />} />
            <Route path="admin/actions" element={<AdminActions />} />
            <Route path="admin/attrition" element={<AdminAttrition />} />
            <Route path="admin/duplicates" element={<AdminDuplicates />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

