import React from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { LayoutDashboard, Users, GraduationCap, Building2, BookOpen, Calendar, QrCode, BarChart3, FileText, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const menuItems = {
  ADMIN: [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { text: 'Students', icon: <GraduationCap size={20} />, path: '/admin/students' },
    { text: 'Teachers', icon: <Users size={20} />, path: '/admin/teachers' },
    { text: 'Departments', icon: <Building2 size={20} />, path: '/admin/departments' },
    { text: 'Classes', icon: <BookOpen size={20} />, path: '/admin/classes' },
    { text: 'Subjects', icon: <BookOpen size={20} />, path: '/admin/subjects' },
    { text: 'Timetable', icon: <Calendar size={20} />, path: '/admin/timetable' },
    { text: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
    { text: 'Low Attendance', icon: <AlertTriangle size={20} />, path: '/admin/low-attendance' },
  ],
  TEACHER: [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/teacher/dashboard' },
    { text: 'My Classes', icon: <BookOpen size={20} />, path: '/teacher/classes' },
    { text: 'Start Attendance', icon: <QrCode size={20} />, path: '/teacher/attendance' },
    { text: 'History', icon: <FileText size={20} />, path: '/teacher/attendance-history' },
    { text: 'Low Attendance', icon: <AlertTriangle size={20} />, path: '/teacher/low-attendance' },
  ],
  STUDENT: [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/student/dashboard' },
    { text: 'Scan QR', icon: <QrCode size={20} />, path: '/student/scan-attendance' },
    { text: 'My Attendance', icon: <FileText size={20} />, path: '/student/attendance' },
    { text: 'Prediction', icon: <BarChart3 size={20} />, path: '/student/prediction' },
  ]
};

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'STUDENT';
  const items = menuItems[role] || menuItems.STUDENT;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <QrCode size={28} color="#2563EB" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>SmartAttend</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 2 }}>
        {items.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 2 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={mobileOpen ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 2,
                bgcolor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding sx={{ px: 2 }}>
          <ListItemButton onClick={() => { logout(); navigate('/login'); }} sx={{ borderRadius: 2, color: 'error.main', '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.04)' } }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogOut size={20} /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #E2E8F0' } }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;