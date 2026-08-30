import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 16 }}>
      <Typography variant="h1" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '6rem' }}>404</Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Page Not Found</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" startIcon={<Home size={20} />} onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </Container>
  );
};

export default NotFound;