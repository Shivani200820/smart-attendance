import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Box, Container, Typography, TextField, Button, Paper, Alert, 
  CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(data.email, data.password);
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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
          p: { xs: 4, sm: 5 }, 
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          {/* User Icon */}
          <Box sx={{ 
            width: 72, 
            height: 72, 
            borderRadius: '50%', 
            bgcolor: '#EFF6FF',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto', 
            mb: 3 
          }}>
            <User size={36} color="#2563EB" />
          </Box>

          {/* Heading */}
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#0F172A', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', mb: 5 }}>
            Login to SmartAttend Portal
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <Box sx={{ mb: 2.5 }}>
              <TextField
                fullWidth
                placeholder="Email Address"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color="#94A3B8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'white',
                    '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1.5 },
                    '&:hover fieldset': { borderColor: '#2563EB' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                  }
                }}
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password', { required: 'Password is required' })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} color="#94A3B8" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#94A3B8' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'white',
                    '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1.5 },
                    '&:hover fieldset': { borderColor: '#2563EB' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                  }
                }}
              />
            </Box>

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography 
                component={RouterLink} 
                to="/forgot-password" 
                sx={{ 
                  color: '#2563EB', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Forgot Password?
              </Typography>
            </Box>

            {/* Sign In Button */}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large" 
              disabled={loading}
              sx={{ 
                py: 1.8, 
                borderRadius: 2.5, 
                bgcolor: '#2563EB',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                '&:hover': { 
                  bgcolor: '#1D4ED8',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  bgcolor: '#94A3B8',
                  boxShadow: 'none'
                },
                transition: 'all 0.2s'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;