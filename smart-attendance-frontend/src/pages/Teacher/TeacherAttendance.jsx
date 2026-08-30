import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Alert, Chip } from '@mui/material';
import { Clock, Play } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getTodayClasses, createAttendanceSession } from '../../services/attendanceApi';

const TeacherAttendance = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null); // stores timetable_id of the class being started

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getTodayClasses();
        setClasses(data);
      } catch (err) {
        console.error('Failed to load today\'s classes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleStart = async (timetableId) => {
    setStarting(timetableId);
    try {
      const session = await createAttendanceSession(timetableId);
      // Navigate to the live session page with the new session ID
      navigate(`/teacher/attendance/${session.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start attendance session.');
      setStarting(null);
    }
  };

  if (loading) return <DashboardLayout title="Start Attendance"><Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box></DashboardLayout>;

  return (
    <DashboardLayout title="Start Attendance Session">
      {classes.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>No classes scheduled for today.</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classes.map((cls) => (
            <Grid item xs={12} md={6} key={cls.timetable_id}>
              <Card sx={{ p: 3, borderLeft: '4px solid', borderLeftColor: cls.session_status === 'ACTIVE' ? 'success.main' : 'primary.main' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{cls.subject_name}</Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>{cls.class_name} • {cls.room || 'TBA'}</Typography>
                    </Box>
                    {cls.session_status === 'ACTIVE' ? (
                      <Chip label="Active" color="success" sx={{ fontWeight: 600 }} />
                    ) : (
                      <Chip label="Not Started" color="default" sx={{ fontWeight: 600 }} />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.secondary' }}>
                    <Clock size={18} />
                    <Typography variant="body2">{cls.start_time} - {cls.end_time}</Typography>
                  </Box>

                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    startIcon={<Play size={20} />}
                    disabled={cls.session_status === 'ACTIVE' || starting === cls.timetable_id}
                    onClick={() => handleStart(cls.timetable_id)}
                    sx={{ py: 1.5 }}
                  >
                    {starting === cls.timetable_id ? <CircularProgress size={24} color="inherit" /> : (cls.session_status === 'ACTIVE' ? 'View Active Session' : 'Start Attendance')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardLayout>
  );
};

export default TeacherAttendance;