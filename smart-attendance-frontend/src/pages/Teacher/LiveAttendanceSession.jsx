import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import QRCode from 'react-qr-code';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LiveAttendanceSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // ✅ TIMER COUNTDOWN FIX
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Attendance session has expired!');
          navigate('/teacher/attendance');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/teacher/attendance-sessions/${sessionId}`);
      const sessionData = response.data;
      
      setSession(sessionData);
      
      // Calculate time left in seconds
      const endTime = new Date(sessionData.ends_at);
      const now = new Date();
      const secondsLeft = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeLeft(secondsLeft);
      setLoading(false);
    } catch (err) {
      setError('Failed to load session');
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    try {
      await api.patch(`/teacher/attendance-sessions/${sessionId}/close`);
      navigate('/teacher/attendance');
    } catch (err) {
      alert('Failed to close session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Live Session
      </Typography>

      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        {/* QR Code */}
        <Box sx={{ mb: 4 }}>
          <QRCode 
            value={session.qr_code || session.session_id}
            size={256}
            level="H"
          />
        </Box>

        {/* Timer */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Session Expires In
        </Typography>
        <Typography 
          variant="h2" 
          sx={{ 
            color: timeLeft < 60 ? '#ef4444' : '#2563eb',
            fontWeight: 800,
            mb: 3
          }}
        >
          {formatTime(timeLeft)}
        </Typography>

        {/* Class Info */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          {session.subject_name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {session.class_name} • {session.room}
        </Typography>

        {/* Close Button */}
        <Button 
          variant="contained" 
          color="error" 
          size="large"
          onClick={handleCloseSession}
          sx={{ px: 4, py: 1.5 }}
        >
          Close Attendance Session
        </Button>
      </Paper>
    </Box>
  );
};

export default LiveAttendanceSession;