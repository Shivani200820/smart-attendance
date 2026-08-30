import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getQRData, getSessionStats, closeAttendanceSession } from '../../services/attendanceApi';

const LiveAttendanceSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [qrData, setQrData] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // Default 5 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  const timerRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch QR data and stats in parallel
        const [qr, statsData] = await Promise.all([
          getQRData(sessionId),
          getSessionStats(sessionId)
        ]);
        
        setQrData(qr);
        setStats(statsData);
        
        // Calculate time left from expires_at
        if (qr.expires_at) {
          const expiresAt = new Date(qr.expires_at);
          const now = new Date();
          const secondsLeft = Math.floor((expiresAt - now) / 1000);
          setTimeLeft(Math.max(0, secondsLeft));
        }
      } catch (err) {
        console.error('Failed to load session data:', err);
        console.error('Error response:', err.response);
        
        let errorMsg = 'Failed to load session data.';
        if (err.response) {
          if (err.response.status === 404) {
            errorMsg = 'Session not found. It may have been deleted.';
          } else if (err.response.status === 403) {
            errorMsg = 'You do not have permission to view this session.';
          } else if (err.response.data?.detail) {
            errorMsg = err.response.data.detail;
          }
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Countdown Timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll stats every 5 seconds
    pollRef.current = setInterval(async () => {
      try {
        const newStats = await getSessionStats(sessionId);
        setStats(newStats);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => {
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
          <Alert severity="error" sx={{ mb: 3, fontSize: '1rem' }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/teacher/attendance')}
            sx={{ mt: 2 }}
          >
            Back to Attendance
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Live Session">
      <Grid container spacing={4}>
        {/* Left: QR Code & Timer */}
        <Grid item xs={12} md={7}>
          <Card sx={{ textAlign: 'center', p: 4, minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Scan to Mark Attendance</Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>Point your phone camera at this code</Typography>
            
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', mb: 4 }}>
              {qrData?.qr_token ? (
                <QRCodeSVG value={qrData.qr_token} size={280} level="H" />
              ) : (
                <CircularProgress />
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Session Expires In</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: timeLeft < 60 ? 'error.main' : 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </Typography>
            </Box>

            <Button variant="contained" color="error" size="large" onClick={handleClose} disabled={closing} sx={{ px: 6, py: 1.5 }}>
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
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>{stats?.total_students || 0}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Students</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'rgba(22, 163, 74, 0.08)', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>{stats?.present_students || 0}</Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>Present</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'rgba(220, 38, 38, 0.08)', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>{stats?.absent_students || 0}</Typography>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>Absent</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'rgba(37, 99, 235, 0.08)', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>{stats?.attendance_percentage?.toFixed(1) || 0}%</Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>Attendance %</Typography>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 'auto' }}>
              Stats update automatically every 5 seconds. Keep this screen visible for students to scan.
            </Alert>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default LiveAttendanceSession;