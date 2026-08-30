import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Box, Grid, Typography, TextField, Button, Paper, Alert, CircularProgress 
} from '@mui/material';
import { QrCode, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(data.email, data.password);
      // Role-based redirection
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Side: Branding */}
      <Grid item xs={12} md={6} sx={{ 
        bgcolor: 'secondary.main', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 4,
        backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: '400px' }}>
          <QrCode size={64} style={{ marginBottom: '24px', color: '#60A5FA' }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>SmartAttend</Typography>
          <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 400 }}>
            Secure QR attendance, automatic calculations, and intelligent attendance insights — all in one platform.
          </Typography>
        </Box>
      </Grid>

      {/* Right Side: Login Form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: '400px', border: '1px solid #E2E8F0' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Welcome Back</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Please enter your credentials to access your dashboard.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Email Address</Typography>
              <TextField
                fullWidth
                placeholder="you@college.edu"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{ startAdornment: <Mail size={18} style={{ marginRight: 8, color: '#64748B' }} /> }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Password</Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{ startAdornment: <Lock size={18} style={{ marginRight: 8, color: '#64748B' }} /> }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="body2" component={RouterLink} to="/forgot-password" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Forgot Password?
              </Typography>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large" 
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LoginPage;