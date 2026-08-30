import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - 260px)` } }}>
        <Topbar title={title} handleDrawerToggle={handleDrawerToggle} />
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;