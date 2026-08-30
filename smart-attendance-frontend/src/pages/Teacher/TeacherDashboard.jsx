import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { Users, BookOpen, AlertTriangle, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getTeacherDashboard } from '../../services/teacherApi';
import { getTodayClasses } from '../../services/attendanceApi';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>{value}</Typography>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15` }}>
          {React.cloneElement(icon, { size: 24, color })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dash, classes] = await Promise.all([getTeacherDashboard(), getTodayClasses()]);
        setDashboard(dash);
        setTodayClasses(classes);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box></DashboardLayout>;

  return (
    <DashboardLayout title="Teacher Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Classes Today" value={dashboard?.total_classes_today || 0} icon={<BookOpen />} color="#2563EB" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Sessions" value={dashboard?.active_sessions || 0} icon={<Clock />} color="#16A34A" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Students" value={dashboard?.total_students || 0} icon={<Users />} color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Low Attendance" value={dashboard?.low_attendance_students || 0} icon={<AlertTriangle />} color="#DC2626" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Today's Schedule</Typography>
          {todayClasses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Typography>No classes scheduled for today.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {todayClasses.map((cls) => (
                <Grid item xs={12} md={6} key={cls.timetable_id}>
                  <Card variant="outlined" sx={{ p: 2, borderLeft: '4px solid', borderLeftColor: cls.session_status === 'ACTIVE' ? 'success.main' : 'primary.main' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{cls.subject_name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{cls.class_name} • {cls.room || 'TBA'}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{cls.start_time} - {cls.end_time}</Typography>
                      </Box>
                      <Button 
                        variant={cls.session_status === 'ACTIVE' ? 'outlined' : 'contained'} 
                        size="small"
                        onClick={() => navigate(cls.session_status === 'ACTIVE' ? `/teacher/attendance/${cls.session_id}` : '/teacher/attendance')}
                        startIcon={<Play size={16} />}
                      >
                        {cls.session_status === 'ACTIVE' ? 'View Live' : 'Start'}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeacherDashboard;