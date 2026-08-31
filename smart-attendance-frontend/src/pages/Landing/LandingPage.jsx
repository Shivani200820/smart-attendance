import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, AppBar, Toolbar, Grid, Card, CardContent, Stack, 
  Drawer, List, ListItem, ListItemButton, ListItemText, IconButton, Divider 
} from '@mui/material';
import { 
  QrCode, Menu, BarChart3, ShieldCheck, TrendingUp, CheckCircle, ArrowRight, 
  Smartphone, Mail, Phone, MapPin, Globe, X 
} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false); // Close mobile menu after clicking
  };

  const features = [
    { icon: <QrCode size={28} />, title: 'Dynamic QR Attendance', desc: 'Secure, time-bound QR codes for every session with automatic validation.' },
    { icon: <BarChart3 size={28} />, title: 'Smart Analytics', desc: 'Real-time dashboards for admins, teachers, and students with insights.' },
    { icon: <ShieldCheck size={28} />, title: 'Role-Based Access', desc: 'Strict security ensuring users only see their relevant data.' },
    { icon: <TrendingUp size={28} />, title: 'Attendance Prediction', desc: 'AI-driven insights to prevent attendance shortages proactively.' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students', color: '#1976d2', bg: '#e3f2fd' },
    { value: '500+', label: 'Teachers Using', color: '#2e7d32', bg: '#e8f5e9' },
    { value: '98%', label: 'Accuracy Rate', color: '#ed6c02', bg: '#fff3e0' },
    { value: '24/7', label: 'System Available', color: '#9c27b0', bg: '#f3e5f5' },
  ];

  const steps = [
    { step: '01', icon: <QrCode size={28} />, title: 'Create Session', desc: 'Teacher generates secure QR code for the class session.' },
    { step: '02', icon: <Smartphone size={28} />, title: 'Student Scans', desc: 'Students scan QR code using their mobile devices instantly.' },
    { step: '03', icon: <CheckCircle size={28} />, title: 'Auto-Validation', desc: 'System validates and records attendance in real-time.' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
      
      {/* ========================================== */}
      {/* 1. NAVBAR (With Mobile Hamburger Menu)     */}
      {/* ========================================== */}
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
            
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => scrollToSection('home')}>
              <QrCode size={28} color="#2563EB" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                SmartAttend
              </Typography>
            </Box>
            
            {/* Desktop Links (Hidden on Mobile) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Typography 
                  key={link.id} 
                  onClick={() => scrollToSection(link.id)}
                  sx={{ color: '#64748b', cursor: 'pointer', '&:hover': { color: '#2563EB' }, fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }}
                >
                  {link.label}
                </Typography>
              ))}
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ mr: 1, borderColor: '#2563EB', color: '#2563EB', '&:hover': { bgcolor: '#2563EB', color: 'white' } }}>Login</Button>
              <Button component={RouterLink} to="/login" variant="contained" sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>Get Started</Button>
            </Box>

            {/* Mobile Menu Icon (Visible only on Mobile) */}
            <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: '#0f172a' }} onClick={() => setMobileOpen(true)}>
              <Menu size={28} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="700" color="primary.main">Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <X size={24} />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton onClick={() => scrollToSection(link.id)}>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 500, color: '#0f172a' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 2 }}>
            <Button component={RouterLink} to="/login" variant="outlined" fullWidth onClick={() => setMobileOpen(false)}>Login</Button>
            <Button component={RouterLink} to="/login" variant="contained" fullWidth onClick={() => setMobileOpen(false)}>Get Started</Button>
          </Box>
        </Box>
      </Drawer>

      {/* ========================================== */}
      {/* 2. HERO SECTION                            */}
      {/* ========================================== */}
      <Container id="home" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center', scrollMarginTop: '80px' }}>
        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
          Smart Attendance Management, <br />
          <Box component="span" sx={{ color: 'primary.main' }}>Made Simple.</Box>
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: '700px', mx: 'auto', fontWeight: 400 }}>
          Automate attendance tracking with secure QR-based sessions, real-time analytics, and intelligent attendance insights.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
            Get Started
          </Button>
          <Button variant="outlined" size="large" sx={{ px: 4, py: 1.5 }}>
            Explore Features
          </Button>
        </Box>
      </Container>

      {/* ========================================== */}
      {/* 3. FEATURES SECTION                        */}
      {/* ========================================== */}
      <Box id="features" sx={{ py: 8, bgcolor: '#f8fafc', scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
              Why Choose SmartAttend?
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto' }}>
              Bridging the gap between traditional attendance and modern technology with cutting-edge features.
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 2.5,
          }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ 
                border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: 'white', p: 2.5,
                transition: 'all 0.25s ease', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)', borderColor: '#1976d2' } 
              }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: '#0f172a', mb: 0.5, textAlign: 'center' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5, textAlign: 'center' }}>
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ========================================== */}
      {/* 4. HOW IT WORKS                            */}
      {/* ========================================== */}
      <Box id="how-it-works" sx={{ py: 8, bgcolor: '#ffffff', scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
              How It Works
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto' }}>
              Simple 3-step process to mark and track attendance.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box textAlign="center">
                  <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontSize: 22, fontWeight: '800', boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#0f172a', mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box textAlign="center" sx={{ mt: 6 }}>
            <Button variant="contained" size="large" endIcon={<ArrowRight size={20} />} onClick={() => navigate('/login')} sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', boxShadow: '0 4px 16px rgba(25, 118, 210, 0.35)' }}>
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ========================================== */}
      {/* 5. ABOUT SECTION                           */}
      {/* ========================================== */}
      <Box id="about" sx={{ py: 8, bgcolor: '#f8fafc', scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#0f172a', mb: 2, lineHeight: 1.2, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                Transforming Attendance Management for Educational Institutions
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 3, lineHeight: 1.7 }}>
                SmartAttend is an innovative platform designed to streamline attendance tracking with QR technology and AI-powered analytics. We ensure accurate, secure, and efficient attendance management for students, teachers, and administrators.
              </Typography>
              <Stack spacing={1.5}>
                {['100% Accurate Attendance Tracking', 'Real-Time Analytics & Reports', 'Secure & Verified Sessions'].map((text, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                    <CheckCircle sx={{ color: '#2e7d32', fontSize: 20, flexShrink: 0 }} />
                    <Typography variant="body2" fontWeight="500" sx={{ color: '#0f172a' }}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {stats.map((stat, i) => (
                <Box key={i} sx={{ p: 3, bgcolor: stat.bg, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="800" sx={{ color: stat.color, mb: 0.5, fontSize: '2rem' }}>{stat.value}</Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ color: '#475569', fontSize: '0.9rem' }}>{stat.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ========================================== */}
      {/* 6. CONTACT SECTION                         */}
      {/* ========================================== */}
      <Box id="contact" sx={{ py: 8, bgcolor: '#ffffff', scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
              Get In Touch
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto' }}>
              Have questions? We'd love to hear from you. Reach out to us through any of these channels.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[
              { icon: '✉️', title: 'Email Us', desc: 'support@smartattend.app', color: '#1976d2', bg: '#e3f2fd' },
              { icon: '📞', title: 'Call Us', desc: '+91 98765 43210', color: '#2e7d32', bg: '#e8f5e9' },
              { icon: '📍', title: 'Visit Us', desc: 'Smart India Hackathon HQ', color: '#ed6c02', bg: '#fff3e0' },
            ].map((item, i) => (
              <Box key={i} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'center', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)', borderColor: item.color } }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 2, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontSize: '2rem' }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#0f172a', mb: 0.5 }}>{item.title}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>{item.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ========================================== */}
      {/* 7. FOOTER                                  */}
      {/* ========================================== */}
      <Box component="footer" sx={{ bgcolor: '#0b1120', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr 1fr 1fr 1.5fr' }, gap: 4 }}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={22} color="white" />
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.25rem' }}>SmartAttend</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.8, maxWidth: 320, fontSize: '0.9rem' }}>
                Modern attendance management for educational institutions. Secure, efficient, and intelligent.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2, fontSize: '1rem', color: 'white' }}>Platform</Typography>
              <Stack spacing={1.5}>
                {['Features', 'How it works', 'About Us'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', '&:hover': { color: 'white' }, transition: 'color 0.2s' }}>{item}</Typography>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2, fontSize: '1rem', color: 'white' }}>Support</Typography>
              <Stack spacing={1.5}>
                {['Help Center', 'Privacy Policy', 'Contact'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', '&:hover': { color: 'white' }, transition: 'color 0.2s' }}>{item}</Typography>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2, fontSize: '1rem', color: 'white' }}>Connect With Us</Typography>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#334155' }, transition: 'background-color 0.2s' }}><Globe size={20} color="white" /></Box>
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#334155' }, transition: 'background-color 0.2s' }}><Mail size={20} color="white" /></Box>
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#334155' }, transition: 'background-color 0.2s' }}><Phone size={20} color="white" /></Box>
              </Stack>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>support@smartattend.app</Typography>
            </Box>
          </Box>

          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 5, pt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>© 2026 SmartAttend. All rights reserved. Attendance Made Smarter.</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;