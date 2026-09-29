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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAuth, ROLE_HOME } from '../context/AuthContext';

const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 72;

/* Sidebar colours — crisp modern design matching Gmail / Material 3 */
const SIDEBAR = {
  bg: '#FFFFFF',
  text: '#64748B',
  textActive: '#6C5CE7',
  activeBar: '#6C5CE7',
  activeBg: '#F3F0FF',
  sectionLabel: '#94A3B8',
  hover: '#F8FAFC',
  border: '1px solid #ECEEF4',
};

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
          { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // > 1024px

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
            borderBottom: '1px solid #F1F5F9',
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
                  color: '#1E293B',
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
          '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '4px' },
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
              <Divider sx={{ my: 1.2, mx: 1, borderColor: '#ECEEF4' }} />
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
                            color: isActive ? SIDEBAR.textActive : '#1E293B',
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
                        color: isActive ? SIDEBAR.textActive : '#1E293B',
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
          borderTop: '1px solid #ECEEF4',
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
                  color: '#1E293B',
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FE' }}>
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
            bgcolor: '#FFFFFF',
            color: 'text.primary',
            borderBottom: '1px solid #ECEEF4',
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
                  color: '#64748B',
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                    color: '#1E293B',
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
                  color: '#1E293B',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.02em',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                VocTrack
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* ── Demo Role Switcher Chips ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 2, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  display: { xs: 'none', md: 'block' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Role:
              </Typography>
              {['trainee', 'employer', 'provider', 'admin'].map((r) => {
                const isActive = user?.role === r;
                return (
                  <Chip
                    key={r}
                    label={r.charAt(0).toUpperCase() + r.slice(1)}
                    size="small"
                    onClick={async () => {
                      if (user?.role !== r) {
                        try {
                          await devLogin(r);
                          navigate(ROLE_HOME[r]);
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.72rem',
                      height: 26,
                      bgcolor: isActive ? '#6C5CE7' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: isActive ? '1px solid #6C5CE7' : '1px solid #ECEEF4',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? '#5A4BC7' : '#E2E8F0',
                      },
                    }}
                  />
                );
              })}
            </Box>

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
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  minWidth: 160,
                },
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>{user?.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
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
              bgcolor: '#FFFFFF',
              borderTop: '1px solid rgba(31,45,46,0.06)',
              zIndex: theme.zIndex.appBar,
              '& .Mui-selected': { color: '#6C5CE7' },
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

