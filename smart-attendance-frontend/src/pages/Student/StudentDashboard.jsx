import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, LinearProgress } from '@mui/material';
import { TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RiskBadge from '../../components/common/RiskBadge';
import { getStudentDashboard, getAttendancePrediction, getAttendanceRecovery } from '../../services/studentApi';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dash, pred, rec] = await Promise.all([
          getStudentDashboard(),
          getAttendancePrediction(),
          getAttendanceRecovery()
        ]);
        setDashboard(dash);
        setPrediction(pred);
        setRecovery(rec);
      } catch (err) {
        console.error('Failed to load student data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box></DashboardLayout>;

  const summary = dashboard?.summary || {};
  const subjects = dashboard?.subjects || [];

  return (
    <DashboardLayout title="My Dashboard">
      {/* Top Summary Card */}
      <Card sx={{ mb: 4, p: 3, bgcolor: summary.risk_level === 'CRITICAL' || summary.risk_level === 'WARNING' ? 'rgba(220, 38, 38, 0.04)' : 'background.paper' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Overall Attendance</Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, color: summary.attendance_percentage >= 75 ? 'success.main' : 'error.main' }}>
              {summary.attendance_percentage?.toFixed(1) || 0}%
            </Typography>
            <Box sx={{ mt: 1 }}>
              <RiskBadge level={summary.risk_level} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary.present_count || 0}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Present</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>{summary.absent_count || 0}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Absent</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>{summary.leave_count || 0}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Leave</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={3}>
        {/* Subject-wise Attendance */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookOpen size={20} /> Subject-wise Attendance
            </Typography>
            {subjects.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No subject data available.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {subjects.map((sub) => (
                  <Box key={sub.subject_id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{sub.subject_name} ({sub.subject_code})</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: sub.attendance_percentage >= sub.required_percentage ? 'success.main' : 'error.main' }}>
                          {sub.attendance_percentage?.toFixed(1)}%
                        </Typography>
                        <RiskBadge level={sub.risk_level} />
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={sub.attendance_percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4, 
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: sub.attendance_percentage >= sub.required_percentage ? '#16A34A' : '#DC2626',
                          borderRadius: 4 
                        } 
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      {sub.present_count} / {sub.total_lectures} lectures attended (Required: {sub.required_percentage}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Prediction & Recovery */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} /> Prediction
            </Typography>
            {prediction ? (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  You need to attend the next <strong>{prediction.lectures_required || 0}</strong> lectures to reach {prediction.required_percentage}%.
                </Typography>
                <Alert severity={prediction.achievable ? 'success' : 'warning'} sx={{ mb: 2 }}>
                  {prediction.achievable ? 'Goal is achievable!' : 'Mathematically difficult to reach required %.'}
                </Alert>
              </>
            ) : <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading prediction...</Typography>}
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertTriangle size={20} /> Recovery Scenarios
            </Typography>
            {recovery?.scenarios?.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recovery.scenarios.slice(0, 3).map((scenario, idx) => (
                  <Box key={idx} sx={{ p: 2, bgcolor: scenario.reaches_required ? 'rgba(22, 163, 74, 0.08)' : 'background.default', borderRadius: 2, border: '1px solid', borderColor: scenario.reaches_required ? 'success.main' : 'transparent' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Attend next {scenario.future_lectures} lectures
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: scenario.reaches_required ? 'success.main' : 'text.primary' }}>
                      → {scenario.predicted_percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : <Typography variant="body2" sx={{ color: 'text.secondary' }}>No recovery data available.</Typography>}
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default StudentDashboard;