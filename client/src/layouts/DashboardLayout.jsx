import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth, ROLE_HOME } from '../context/AuthContext';
import { useColorMode } from '../context/ThemeContext';

const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 72;


/* ── Navigation config per role (from PRD §3 & §5) ── */
const NAV = {
  trainee: {
    sections: [
      {
        items: [
          { label: 'Home', icon: <HomeIcon />, path: '/trainee/dashboard' },
          { label: 'CV', icon: <DescriptionIcon />, path: '/trainee/cv' },
          { label: 'Jobs', icon: <WorkIcon />, path: '/trainee/jobs' },
          { label: 'Rewards', icon: <AccountBalanceWalletIcon />, path: '/trainee/rewards' },
          { label: 'Me', icon: <PersonIcon />, path: '/trainee/me' },
        ],
      },
    ],
  },
  employer: {
    sections: [
      {
        label: 'Recruitment',
        items: [
          { label: 'Talent Portal', icon: <PeopleIcon />, path: '/employer/talent' },
          { label: 'Courses', icon: <SchoolIcon />, path: '/employer/courses' },
          { label: 'Verifications', icon: <VerifiedIcon />, path: '/employer/verifications' },
        ],
      },
      {
        label: 'Account',
        items: [
          { label: 'Profile', icon: <BusinessIcon />, path: '/employer/profile' },
        ],
      },
    ],
  },
  provider: {
    sections: [
      {
        label: 'Data',
        items: [
          { label: 'Upload', icon: <UploadFileIcon />, path: '/provider/upload' },
          { label: 'Courses', icon: <SchoolIcon />, path: '/provider/courses' },
        ],
      },
      {
        label: 'Monitoring',
        items: [
          { label: 'Cohort Alerts', icon: <WarningIcon />, path: '/provider/alerts' },
        ],
      },
    ],
  },
  admin: {
    sections: [
      {
        label: 'Governance & Users',
        items: [
          { label: 'Users & Minute Audit', icon: <ManageAccountsIcon />, path: '/admin/users' },
          { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
        ],
      },
      {
        label: 'Analytics',
        items: [
          { label: 'Rankings', icon: <LeaderboardIcon />, path: '/admin/rankings' },
          { label: 'Skill Gaps', icon: <TrendingUpIcon />, path: '/admin/skill-gaps' },
          { label: 'Attrition', icon: <TrendingDownIcon />, path: '/admin/attrition' },
        ],
      },
      {
        label: 'Operations',
        items: [
          { label: 'Actions', icon: <PlaylistAddCheckIcon />, path: '/admin/actions' },
          { label: 'Duplicates', icon: <CompareArrowsIcon />, path: '/admin/duplicates' },
        ],
      },
    ],
  },
  manager: {
    sections: [
      {
        label: 'Management Oversight',
        items: [
          { label: 'Users & Minute Audit', icon: <ManageAccountsIcon />, path: '/admin/users' },
          { label: 'Rankings', icon: <LeaderboardIcon />, path: '/admin/rankings' },
          { label: 'Skill Gaps', icon: <TrendingUpIcon />, path: '/admin/skill-gaps' },
          { label: 'Actions', icon: <PlaylistAddCheckIcon />, path: '/admin/actions' },
        ],
      },
    ],
  },
  supervisor: {
    sections: [
      {
        label: 'Supervision & Approvals',
        items: [
          { label: 'Users & Approvals', icon: <ManageAccountsIcon />, path: '/admin/users' },
          { label: 'Actions', icon: <PlaylistAddCheckIcon />, path: '/admin/actions' },
          { label: 'Duplicates', icon: <CompareArrowsIcon />, path: '/admin/duplicates' },
        ],
      },
    ],
  },
};

/** Flatten sections into a flat list for bottom nav + active index */
function flatItems(role) {
  const config = NAV[role];
  if (!config) return [];
  return config.sections.flatMap((s) => s.items);
}

export default function DashboardLayout() {
  const theme = useTheme();
  const { mode, toggleTheme } = useColorMode();
  const isDark = mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // > 1024px

  const SIDEBAR = {
    bg: isDark ? '#111B1E' : '#FFFFFF',
    text: isDark ? '#8EA8AB' : '#64748B',
    textActive: isDark ? '#71C9CE' : '#6C5CE7',
    activeBar: isDark ? '#71C9CE' : '#6C5CE7',
    activeBg: isDark ? 'rgba(113, 201, 206, 0.14)' : '#F3F0FF',
    sectionLabel: isDark ? '#5B787C' : '#94A3B8',
    hover: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
    border: isDark ? '1px solid rgba(203, 241, 245, 0.08)' : '1px solid #ECEEF4',
    headerBorder: isDark ? '1px solid rgba(203, 241, 245, 0.08)' : '1px solid #F1F5F9',
    divider: isDark ? 'rgba(203, 241, 245, 0.08)' : '#ECEEF4',
  };

  const { user, logout, devLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop rail vs full drawer state (Gmail style toggle)
  const [desktopOpen, setDesktopOpen] = useState(true);
  // Mobile / tablet slide-over drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const allItems = flatItems(user?.role);
  const navConfig = NAV[user?.role];

  /* Determine which nav item is active */
  const activeIdx = allItems.findIndex((it) => location.pathname.startsWith(it.path));

  // Determine effective rail mode
  const isRail = isDesktop && !desktopOpen;
  const currentDrawerWidth = isDesktop ? (desktopOpen ? DRAWER_WIDTH : RAIL_WIDTH) : DRAWER_WIDTH;

  /* ── Drawer & Rail Content ── */
  const renderNavContent = (railMode) => (
    <Box
      sx={{
        width: railMode ? RAIL_WIDTH : DRAWER_WIDTH,
        height: '100%',
        bgcolor: SIDEBAR.bg,
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Drawer Header (only on expanded or mobile) */}
      {!railMode ? (
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: SIDEBAR.headerBorder,
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => navigate(ROLE_HOME[user?.role] || '/')}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #8E44AD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(108,92,231,0.25)',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>V</Typography>
            </Box>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 15.5,
                  color: isDark ? '#E3FDFD' : '#1E293B',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                VocTrack
              </Typography>
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: SIDEBAR.sectionLabel,
                  lineHeight: 1.2,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.role ? `${user.role} deck` : 'Portal'}
              </Typography>
            </Box>
          </Box>

          {!isDesktop && (
            <IconButton size="small" onClick={() => setMobileDrawerOpen(false)} sx={{ color: '#94A3B8' }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
      ) : (
        /* Rail Header spacer */
        <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8E44AD 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(108,92,231,0.25)',
              cursor: 'pointer',
            }}
            onClick={() => setDesktopOpen(true)}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF' }}>V</Typography>
          </Box>
        </Box>
      )}

      {/* Nav items list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: railMode ? 1 : 1.5,
          pt: 1.5,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? '#223538' : '#E2E8F0', borderRadius: '4px' },
        }}
      >
        {navConfig?.sections.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: railMode ? 1 : 1.5 }}>
            {/* Section label or divider */}
            {!railMode && section.label && (
              <Typography
                sx={{
                  px: 1.5,
                  pt: sIdx > 0 ? 2 : 0.5,
                  pb: 0.75,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: SIDEBAR.sectionLabel,
                  whiteSpace: 'nowrap',
                }}
              >
                {section.label}
              </Typography>
            )}

            {railMode && sIdx > 0 && (
              <Divider sx={{ my: 1.2, mx: 1, borderColor: SIDEBAR.divider }} />
            )}

            <List disablePadding>
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);

                // Rail item (Gmail-style icon capsule with tooltip)
                if (railMode) {
                  return (
                    <Tooltip title={item.label} placement="right" arrow key={item.path}>
                      <ListItemButton
                        onClick={() => {
                          navigate(item.path);
                        }}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '24px', // Gmail capsule
                          mx: 'auto',
                          mb: 1,
                          p: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: isActive ? SIDEBAR.textActive : SIDEBAR.text,
                          bgcolor: isActive ? SIDEBAR.activeBg : 'transparent',
                          boxShadow: isActive ? '0 2px 8px rgba(108, 92, 231, 0.2)' : 'none',
                          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: isActive ? SIDEBAR.activeBg : SIDEBAR.hover,
                            color: isActive ? SIDEBAR.textActive : (isDark ? '#E3FDFD' : '#1E293B'),
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'auto',
                            justifyContent: 'center',
                            color: isActive ? SIDEBAR.textActive : SIDEBAR.text,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  );
                }

                // Expanded Drawer item (Gmail-style rounded pill with icon + label)
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (!isDesktop) setMobileDrawerOpen(false);
                    }}
                    sx={{
                      borderRadius: '24px', // Gmail pill
                      mb: 0.5,
                      py: 1.1,
                      px: 2,
                      color: isActive ? SIDEBAR.textActive : SIDEBAR.text,
                      bgcolor: isActive ? SIDEBAR.activeBg : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isActive ? SIDEBAR.activeBg : SIDEBAR.hover,
                        color: isActive ? SIDEBAR.textActive : (isDark ? '#E3FDFD' : '#1E293B'),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? SIDEBAR.textActive : SIDEBAR.text,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 13.5,
                            fontWeight: isActive ? 700 : 500,
                            whiteSpace: 'nowrap',
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User profile card at bottom */}
      <Box
        sx={{
          p: railMode ? 1.5 : 2,
          borderTop: SIDEBAR.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: railMode ? 'center' : 'flex-start',
          gap: 1.5,
        }}
      >
        {railMode ? (
          <Tooltip title={`${user?.name || 'User'} (${user?.role})`} placement="right" arrow>
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                '&:hover': { transform: 'scale(1.08)' },
              }}
            >
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
          </Tooltip>
        ) : (
          <>
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isDark ? '#E3FDFD' : '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: SIDEBAR.sectionLabel, textTransform: 'capitalize', fontWeight: 500 }}>
                {user?.role}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isDark ? '#0B1315' : '#F8F9FE' }}>
      {/* ── Desktop Permanent Gmail Drawer / Rail with smooth transition ── */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth,
              bgcolor: SIDEBAR.bg,
              borderRight: SIDEBAR.border,
              overflowX: 'hidden',
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isRail ? 'none' : '2px 0 12px rgba(108,92,231,0.03)',
            },
          }}
        >
          {renderNavContent(isRail)}
        </Drawer>
      )}

      {/* ── Mobile & Tablet Slide-over temporary Drawer ── */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{
            keepMounted: true,
            disableRestoreFocus: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: SIDEBAR.bg,
              borderRight: SIDEBAR.border,
              boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          {renderNavContent(false)}
        </Drawer>
      )}

      {/* ── Main Layout Area ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ── Top AppBar (Gmail Header style) ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: isDark ? '#111B1E' : '#FFFFFF',
            color: 'text.primary',
            borderBottom: isDark ? '1px solid rgba(203, 241, 245, 0.08)' : '1px solid #ECEEF4',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 2.5 } }}>
            {/* ── Persistent Hamburger Menu Icon (Gmail style) ── */}
            <Tooltip title={isDesktop ? (desktopOpen ? 'Collapse menu' : 'Expand menu') : 'Main menu'} arrow>
              <IconButton
                edge="start"
                onClick={() => {
                  if (isDesktop) {
                    setDesktopOpen((prev) => !prev);
                  } else {
                    setMobileDrawerOpen(true);
                  }
                }}
                sx={{
                  mr: 1.5,
                  color: isDark ? '#8EA8AB' : '#64748B',
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    color: isDark ? '#E3FDFD' : '#1E293B',
                  },
                }}
                aria-label="Toggle navigation drawer"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>

            {/* Brand Logo and Name */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                mr: 2,
                cursor: 'pointer',
              }}
              onClick={() => navigate(ROLE_HOME[user?.role] || '/')}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #8E44AD 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(108,92,231,0.25)',
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#FFFFFF' }}>V</Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: isDark ? '#E3FDFD' : '#1E293B',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.02em',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                VocTrack
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* ── User Role Badge (Read-Only) ── */}
            {user?.role && (
              <Chip
                icon={user.role === 'admin' ? <AdminPanelSettingsIcon style={{ fontSize: 16 }} /> : undefined}
                label={user.role === 'admin' ? 'SUPER ADMIN' : user.role.toUpperCase()}
                size="small"
                sx={{
                  mr: 1.5,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                  bgcolor: isDark ? 'rgba(113,201,206,0.15)' : 'rgba(108,92,231,0.1)',
                  color: isDark ? '#71C9CE' : '#6C5CE7',
                  border: isDark ? '1px solid rgba(113,201,206,0.3)' : '1px solid rgba(108,92,231,0.2)',
                }}
              />
            )}

            {/* ── Theme Mode Toggle Button ── */}
            <Tooltip title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'} arrow>
              <IconButton
                onClick={toggleTheme}
                size="small"
                sx={{
                  color: isDark ? '#71C9CE' : '#5A7A7D',
                  bgcolor: isDark ? 'rgba(113, 201, 206, 0.12)' : '#F1F5F9',
                  p: 0.9,
                  mr: 1,
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(113, 201, 206, 0.22)' : '#E2E8F0',
                    transform: 'rotate(20deg)',
                  },
                }}
                aria-label="Toggle light and dark mode"
              >
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Profile Avatar & Menu */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || '?'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '12px',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)',
                    bgcolor: isDark ? '#142023' : '#FFFFFF',
                    border: isDark ? '1px solid rgba(203,241,245,0.1)' : 'none',
                    minWidth: 160,
                  },
                },
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#E3FDFD' : '#1E293B' }}>{user?.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" sx={{ color: isDark ? '#8EA8AB' : '#64748B', textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: isDark ? 'rgba(203,241,245,0.08)' : undefined }} />
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                  navigate('/login');
                }}
                sx={{ color: '#EF4444' }}
              >
                <ListItemIcon sx={{ color: '#EF4444' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Page Content ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            pb: isMobile ? 10 : 3,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>

        {/* ── Bottom nav on mobile (trainee only) ── */}
        {isMobile && allItems.length <= 5 && (
          <BottomNavigation
            value={activeIdx === -1 ? 0 : activeIdx}
            onChange={(_e, idx) => navigate(allItems[idx].path)}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: isDark ? '#111B1E' : '#FFFFFF',
              borderTop: isDark ? '1px solid rgba(203,241,245,0.08)' : '1px solid rgba(31,45,46,0.06)',
              zIndex: theme.zIndex.appBar,
              '& .Mui-selected': { color: isDark ? '#71C9CE' : '#6C5CE7' },
            }}
          >
            {allItems.map((item) => (
              <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        )}
      </Box>
    </Box>
  );
}

