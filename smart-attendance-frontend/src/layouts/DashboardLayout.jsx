import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Divider, Menu, MenuItem, Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout, 
  Dashboard, 
  People, 
  School, 
  Event, 
  Lock 
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import ChangePasswordDialog from '../components/common/ChangePasswordDialog';

const drawerWidth = 240;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Dynamic menu based on role (Updated with all modules)
  const getMenuItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { text: 'Dashboard', path: '/admin/dashboard', icon: <Dashboard /> },
        { text: 'Students', path: '/admin/students', icon: <People /> },
        { text: 'Teachers', path: '/admin/teachers', icon: <School /> },
        { text: 'Departments', path: '/admin/departments', icon: <School /> },
        { text: 'Classes', path: '/admin/classes', icon: <Event /> },
        { text: 'Subjects', path: '/admin/subjects', icon: <School /> },
        { text: 'Timetable', path: '/admin/timetable', icon: <Event /> },
        { text: 'Reports', path: '/admin/reports', icon: <Event /> },
      ];
    }
    if (user?.role === 'TEACHER') {
      return [
        { text: 'Dashboard', path: '/teacher/dashboard', icon: <Dashboard /> },
        { text: 'My Classes', path: '/teacher/classes', icon: <School /> },
        { text: 'Attendance', path: '/teacher/attendance', icon: <Event /> },
        { text: 'Analytics', path: '/teacher/analytics', icon: <Dashboard /> },
        { text: 'Reports', path: '/teacher/reports', icon: <Event /> },
      ];
    }
    return [
      { text: 'Dashboard', path: '/student/dashboard', icon: <Dashboard /> },
      { text: 'Scan QR', path: '/student/scan-attendance', icon: <Event /> },
      { text: 'My Attendance', path: '/student/attendance', icon: <People /> },
      { text: 'Subjects', path: '/student/attendance/subjects', icon: <School /> },
      { text: 'Prediction', path: '/student/attendance/prediction', icon: <Dashboard /> },
    ];
  };

  // Sidebar Content Only
  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          {user?.role} Portal
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => { 
              navigate(item.path); 
              setMobileOpen(false); // Close mobile drawer on click
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={() => setMobileOpen(!mobileOpen)} 
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Smart Attendance
            </Typography>
            
            {/* Top Navbar Profile Menu Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}>
                {user?.name}
              </Typography>
              <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    {user?.email} ({user?.role})
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => { setPasswordDialogOpen(true); handleMenuClose(); }}>
                  <Lock sx={{ mr: 1 }} fontSize="small" /> Change Password
                </MenuItem>
                <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                  <Logout sx={{ mr: 1 }} fontSize="small" /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          {/* Mobile Drawer */}
          <Drawer 
            variant="temporary" 
            open={mobileOpen} 
            onClose={() => setMobileOpen(false)} 
            ModalProps={{ keepMounted: true }} 
            sx={{ 
              display: { xs: 'block', sm: 'none' }, 
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } 
            }}
          >
            {drawerContent}
          </Drawer>
          
          {/* Desktop Permanent Drawer */}
          <Drawer 
            variant="permanent" 
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } 
            }} 
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8, minHeight: '100vh', bgcolor: 'background.default' }}>
          <Outlet />
        </Box>
      </Box>
      
      {/* Change Password Dialog (Outside main flex box, but inside Fragment) */}
      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)} 
      />
    </>
  );
};

export default DashboardLayout;