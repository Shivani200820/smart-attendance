import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress, Alert, Chip } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getQRData, getSessionStats, closeAttendanceSession } from '../../services/attendanceApi';

const LiveAttendanceSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [qrData, setQrData] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // Safe default: 10 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  const timerRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [qr, statsData] = await Promise.all([
          getQRData(sessionId),
          getSessionStats(sessionId)
        ]);
        
        if (!isMounted) return;
        
        setQrData(qr);
        setStats(statsData);
        
        // ⏱️ ROBUST TIME CALCULATION
        if (qr.expires_at) {
          const expiresAt = new Date(qr.expires_at);
          const now = new Date();
          const secondsLeft = Math.floor((expiresAt - now) / 1000);
          
          // If backend time is in the past or too short (< 2 mins), fallback to 10 mins for demo safety
          if (secondsLeft > 120) {
            setTimeLeft(secondsLeft);
          } else {
            console.warn("Backend expiry time is too low. Using 10 min fallback for demo.");
            setTimeLeft(600); // 10 minutes fallback
          }
        } else {
          setTimeLeft(600); // Fallback if expires_at is missing
        }
        
      } catch (err) {
        console.error('Failed to load session data:', err);
        if (!isMounted) return;
        
        let errorMsg = 'Failed to load session data.';
        if (err.response) {
          if (err.response.status === 404) errorMsg = 'Session not found or already closed.';
          else if (err.response.status === 403) errorMsg = 'Permission denied.';
          else if (err.response.data?.detail) errorMsg = err.response.data.detail;
        }
        setError(errorMsg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();

    // ⏱️ COUNTDOWN TIMER
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Optional: Auto-redirect or show expired message
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 📊 POLL STATS every 5 seconds
    pollRef.current = setInterval(async () => {
      try {
        const newStats = await getSessionStats(sessionId);
        if (isMounted) setStats(newStats);
      } catch (err) {
        // Ignore polling errors silently to avoid UI spam
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, [sessionId]);

  const handleClose = async () => {
    if (!window.confirm('Are you sure you want to close this attendance session?')) return;
    setClosing(true);
    try {
      await closeAttendanceSession(sessionId);
      navigate('/teacher/attendance');
    } catch (err) {
      console.error('Failed to close session:', err);
      setError('Failed to close session.');
      setClosing(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Live Session">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Live Session">
        <Box sx={{ maxWidth: '600px', mx: 'auto', mt: 8 }}>
          <Alert severity="error" sx={{ mb: 3, fontSize: '1rem' }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/teacher/attendance')} sx={{ mt: 2 }}>
            Back to Attendance
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const isExpiringSoon = timeLeft < 60;

  return (
    <DashboardLayout title="Live Session">
      <Grid container spacing={4}>
        {/* Left: QR Code & Timer */}
        <Grid item xs={12} md={7}>
          <Card sx={{ textAlign: 'center', p: 4, minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            
            {timeLeft === 0 && (
              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.9)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" color="error" fontWeight="bold">Session Expired</Typography>
                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>Please start a new attendance session.</Typography>
                <Button variant="contained" onClick={() => navigate('/teacher/attendance')}>Go Back</Button>
              </Box>
            )}

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Scan to Mark Attendance</Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>Point your phone camera at this code</Typography>
            
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', mb: 4, border: '1px solid #E2E8F0' }}>
              {qrData?.qr_token ? (
                <QRCodeSVG value={qrData.qr_token} size={280} level="H" />
              ) : (
                <CircularProgress />
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                Session Expires In
                {isExpiringSoon && <Chip label="Hurry!" size="small" color="error" />}
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  color: isExpiringSoon ? '#ef4444' : '#2563eb', 
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'color 0.3s'
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="error" 
              size="large" 
              onClick={handleClose} 
              disabled={closing || timeLeft === 0} 
              sx={{ px: 6, py: 1.5, fontWeight: 600 }}
            >
              {closing ? <CircularProgress size={24} color="inherit" /> : 'Close Attendance Session'}
            </Button>
          </Card>
        </Grid>

        {/* Right: Live Stats */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Live Statistics</Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6}>
                <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>{stats?.total_students || 0}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>Total Students</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 3, bgcolor: 'rgba(22, 163, 74, 0.08)', borderRadius: 3, textAlign: 'center', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A' }}>{stats?.present_students || 0}</Typography>
                  <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 600, mt: 0.5 }}>Present</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 3, bgcolor: 'rgba(220, 38, 38, 0.08)', borderRadius: 3, textAlign: 'center', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#DC2626' }}>{stats?.absent_students || 0}</Typography>
                  <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600, mt: 0.5 }}>Absent</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 3, bgcolor: 'rgba(37, 99, 235, 0.08)', borderRadius: 3, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563EB' }}>{stats?.attendance_percentage?.toFixed(1) || 0}%</Typography>
                  <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600, mt: 0.5 }}>Attendance %</Typography>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 'auto', borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Stats update automatically every 5 seconds. Keep this screen visible for students to scan.
              </Typography>
            </Alert>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default LiveAttendanceSession;