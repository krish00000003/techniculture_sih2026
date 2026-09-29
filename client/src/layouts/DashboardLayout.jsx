import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

/* ── Navigation config per role (from PRD §3 & §5) ── */
const NAV = {
  trainee: [
    { label: 'Home', icon: <HomeIcon />, path: '/trainee/dashboard' },
    { label: 'CV', icon: <DescriptionIcon />, path: '/trainee/cv' },
    { label: 'Jobs', icon: <WorkIcon />, path: '/trainee/jobs' },
    { label: 'Me', icon: <PersonIcon />, path: '/trainee/me' },
  ],
  employer: [
    { label: 'Talent', icon: <PeopleIcon />, path: '/employer/talent' },
    { label: 'Verifications', icon: <VerifiedIcon />, path: '/employer/verifications' },
    { label: 'Profile', icon: <BusinessIcon />, path: '/employer/profile' },
  ],
  provider: [
    { label: 'Upload', icon: <UploadFileIcon />, path: '/provider/upload' },
    { label: 'Cohort Alerts', icon: <WarningIcon />, path: '/provider/alerts' },
  ],
  admin: [
    { label: 'Rankings', icon: <LeaderboardIcon />, path: '/admin/rankings' },
    { label: 'Skill Gaps', icon: <TrendingUpIcon />, path: '/admin/skill-gaps' },
    { label: 'Actions', icon: <PlaylistAddCheckIcon />, path: '/admin/actions' },
    { label: 'Attrition', icon: <TrendingDownIcon />, path: '/admin/attrition' },
    { label: 'Duplicates', icon: <CompareArrowsIcon />, path: '/admin/duplicates' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ],
};

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // > 1024px

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const items = NAV[user?.role] || [];

  /* Determine which nav item is active */
  const activeIdx = items.findIndex((it) => location.pathname.startsWith(it.path));

  /* ── Sidebar drawer content ── */
  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 700, color: 'primary.main' }}>
        VocTrack
      </Typography>
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Permanent sidebar on desktop ── */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(31,45,46,0.08)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* ── Collapsible drawer on tablet / hamburger on mobile ── */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true,
            disableRestoreFocus: true,
          }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper' } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* ── Main area ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ── Top bar ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid rgba(31,45,46,0.08)',
          }}
        >
          <Toolbar>
            {!isDesktop && (
              <IconButton
                edge="start"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setDrawerOpen(true);
                }}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {!isDesktop && 'VocTrack'}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {user?.role}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                  navigate('/login');
                }}
              >
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Page content ── */}
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

        {/* ── Bottom nav on mobile (trainee only, max 4 tabs) ── */}
        {isMobile && items.length <= 4 && (
          <BottomNavigation
            value={activeIdx === -1 ? 0 : activeIdx}
            onChange={(_e, idx) => navigate(items[idx].path)}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderTop: '1px solid rgba(31,45,46,0.08)',
              zIndex: theme.zIndex.appBar,
              '& .Mui-selected': { color: 'primary.main' },
            }}
          >
            {items.map((item) => (
              <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        )}
      </Box>
    </Box>
  );
}
