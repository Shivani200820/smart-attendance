import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar, useTheme } from '@mui/material';
import { QrCode, BarChart3, ShieldCheck, Clock, Users, TrendingUp, Menu } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const features = [
  { icon: <QrCode size={32} />, title: 'Dynamic QR Attendance', desc: 'Secure, time-bound QR codes for every session.' },
  { icon: <BarChart3 size={32} />, title: 'Smart Analytics', desc: 'Real-time dashboards for admins, teachers, and students.' },
  { icon: <ShieldCheck size={32} />, title: 'Role-Based Access', desc: 'Strict security ensuring users only see their data.' },
  { icon: <TrendingUp size={32} />, title: 'Attendance Prediction', desc: 'AI-driven insights to prevent attendance shortages.' },
];

const LandingPage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
      {/* Navbar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCode size={28} /> SmartAttend
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {['Home', 'Features', 'How It Works', 'About'].map((item) => (
                <Typography key={item} sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                  {item}
                </Typography>
              ))}
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ mr: 1 }}>Login</Button>
              <Button component={RouterLink} to="/login" variant="contained">Get Started</Button>
            </Box>
            <Menu size={28} style={{ display: 'none' }} /> {/* Mobile menu placeholder */}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
          Smart Attendance Management, <br />
          <Box component="span" sx={{ color: 'primary.main' }}>Made Simple.</Box>
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: '700px', mx: 'auto', fontWeight: 400 }}>
          Automate attendance tracking with secure QR-based sessions, real-time analytics, and intelligent attendance insights.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
          <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
            Get Started
          </Button>
          <Button variant="outlined" size="large" sx={{ px: 4, py: 1.5 }}>
            Explore Features
          </Button>
        </Box>

        {/* Hero Visual Mockup */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', p: 2, maxWidth: '900px', mx: 'auto', border: '1px solid #E2E8F0' }}>
          <Box sx={{ bgcolor: '#F1F5F9', borderRadius: 2, height: { xs: 200, md: 400 }, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <Typography variant="h6">Professional Dashboard Mockup</Typography>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 6, fontWeight: 700 }}>
            Why Choose SmartAttend?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                    <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>{feature.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{feature.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6, mt: 'auto' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>SmartAttend</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            © {new Date().getFullYear()} SmartAttend. Attendance Made Smarter.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;