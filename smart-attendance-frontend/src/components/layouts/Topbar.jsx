import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Badge } from '@mui/material';
import { Menu as MenuIcon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ title, handleDrawerToggle }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: 'background.paper' }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { md: 'none' }, mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, color: 'text.primary' }}>{title}</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>
          <IconButton onClick={handleClick} sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 600 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }}>
          <MenuItem onClick={handleClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.role}</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;