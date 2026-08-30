import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, Alert, Divider, Paper
} from '@mui/material';
import { Stop, Refresh, AccessTime, EventBusy } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { attendanceService } from '../../services/attendanceService';

const LiveAttendance = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [qrData, setQrData] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('');

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch Session Info first
  const fetchSessionInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/attendance/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(data);
        setSessionStatus(data.status);
        
        // Check if session is active
        if (data.status !== 'active') {
          setIsExpired(true);
          if (data.status === 'closed') {
            setError('This attendance session has been closed.');
          } else if (data.status === 'expired') {
            setError('This attendance session has expired.');
          }
        }
      }
    } catch (err) {
      console.error('Session info fetch error:', err);
    }
  };

  // Fetch QR Data and Initial Stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch QR Data (only if session might be active)
      try {
        const qr = await attendanceService.getQRData(sessionId);
        setQrData(qr);
        
        if (qr.status === 'expired' || qr.status === 'closed') {
          setIsExpired(true);
          setSessionStatus(qr.status);
        }
      } catch (qrError) {
        const errorMsg = qrError.response?.data?.detail || qrError.message;
        
        if (qrError.response?.status === 400) {
          // Session is not active - this is expected for old sessions
          setIsExpired(true);
          setSessionStatus('inactive');
          
          if (errorMsg.includes('not active')) {
            setError('This session is no longer active. QR code is not available.');
          } else {
            setError(errorMsg);
          }
        } else {
          throw qrError;
        }
      }

      // Fetch Stats (this should work even for closed sessions)
      try {
        const statsData = await attendanceService.getSessionStats(sessionId);
        setStats(statsData);
      } catch (statsError) {
        console.warn('Stats fetch failed:', statsError);
        // Stats might not be available for very old sessions
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch Error:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load session data.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  // Poll Stats every 5 seconds (only if active)
  const pollStats = async () => {
    if (isExpired || sessionStatus !== 'active') return;
    
    try {
      const statsData = await attendanceService.getSessionStats(sessionId);
      setStats(statsData);
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  // Countdown Timer Logic
  const updateTimer = (expiresAt) => {
    if (!expiresAt || isExpired) return;
    
    const endTime = new Date(expiresAt).getTime();
    
    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timerRef.current);
        setIsExpired(true);
        setSessionStatus('expired');
        setTimeLeft('00:00');
        setError('Attendance session has expired.');
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
  };

  useEffect(() => {
    fetchSessionInfo();
    fetchData();
  }, [sessionId]);

  useEffect(() => {
    if (qrData && !isExpired && qrData.expires_at && sessionStatus === 'active') {
      updateTimer(qrData.expires_at);
      intervalRef.current = setInterval(pollStats, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrData, isExpired, sessionStatus]);

  const handleCloseSession = async () => {
    if (window.confirm('Are you sure you want to close this attendance session?')) {
      setIsClosing(true);
      try {
        await attendanceService.closeSession(sessionId);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setSessionStatus('closed');
        setIsExpired(true);
        setError('Session has been closed successfully.');
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Failed to close session.';
        
        if (err.response?.status === 400 && errorMsg.includes('not active')) {
          setError('This session is already closed or expired.');
          setIsExpired(true);
          setSessionStatus('closed');
        } else {
          setError(errorMsg);
        }
        setIsClosing(false);
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/teacher/dashboard');
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading session data...</Typography>
      </Box>
    );
  }

  const canCloseSession = sessionStatus === 'active' && !isExpired;

  return (
    <Box sx={{ p: 2 }}>
      {/* Error/Status Alert */}
      {error && (
        <Alert 
          severity={isExpired ? "warning" : "error"} 
          sx={{ mb: 2 }}
          action={
            isExpired ? (
              <Button color="inherit" size="small" onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
            ) : null
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Live Attendance Session #{sessionId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={sessionStatus?.toUpperCase() || 'UNKNOWN'} 
            color={
              sessionStatus === 'active' ? 'success' : 
              sessionStatus === 'closed' ? 'default' : 'warning'
            }
          />
          {canCloseSession && (
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<Stop />} 
              onClick={handleCloseSession}
              disabled={isClosing}
            >
              {isClosing ? 'Closing...' : 'Close Attendance'}
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* QR Code Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, textAlign: 'center', p: 3 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Scan QR to Mark Attendance
            </Typography>
            
            {isExpired || sessionStatus !== 'active' ? (
              <Box sx={{ my: 4, p: 4, bgcolor: 'grey.100', borderRadius: 2 }}>
                <EventBusy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  {sessionStatus === 'closed' ? 'Session Closed' : 'Session Expired'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  This attendance session is no longer active.
                </Typography>
                {sessionInfo && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Date: {sessionInfo.date} | {sessionInfo.start_time} - {sessionInfo.end_time}
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }} 
                  onClick={handleBackToDashboard}
                >
                  Back to Dashboard
                </Button>
              </Box>
            ) : qrData ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <QRCodeSVG 
                    value={qrData.qr_token || ''} 
                    size={250} 
                    level="H" 
                    includeMargin={true} 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
                  <AccessTime color="action" />
                  <Typography variant="h6">
                    Expires in: <strong style={{ color: timeLeft === '00:00' ? 'red' : 'green' }}>{timeLeft}</strong>
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Session Status: {qrData.status}
                </Typography>
              </>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No QR data available for this session.
              </Alert>
            )}
          </Card>
        </Grid>

        {/* Live Stats Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Live Statistics</Typography>
              {!isExpired && sessionStatus === 'active' && (
                <Button size="small" startIcon={<Refresh />} onClick={pollStats}>
                  Refresh
                </Button>
              )}
            </Box>

            {stats ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="h4">{stats.total_students}</Typography>
                    <Typography variant="body1">Total Students</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h4">{stats.present_students}</Typography>
                    <Typography variant="body1">Present</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h4">{stats.absent_students}</Typography>
                    <Typography variant="body1">Absent</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h4">{stats.attendance_percentage.toFixed(1)}%</Typography>
                    <Typography variant="body1">Attendance %</Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No statistics available.</Alert>
            )}

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>Session Details</Typography>
            {sessionInfo && (
              <>
                <Typography variant="body2">Date: {sessionInfo.date}</Typography>
                <Typography variant="body2">Time: {sessionInfo.start_time} - {sessionInfo.end_time}</Typography>
                <Typography variant="body2">Status: <Chip label={sessionInfo.status} size="small" /></Typography>
                {qrData && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Expires At: {qrData.expires_at ? new Date(qrData.expires_at).toLocaleString() : 'N/A'}
                  </Typography>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveAttendance;