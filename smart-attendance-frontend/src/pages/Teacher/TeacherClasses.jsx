import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getTeacherClasses } from '../../services/teacherApi';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTeacherClasses();
        setClasses(data);
      } catch (err) {
        console.error('Failed to load classes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="My Classes">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <Typography>Loading...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Classes">
      {classes.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>No classes assigned yet.</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classes.map((cls) => (
            <Grid item xs={12} md={6} lg={4} key={cls.class_id}>
              <Card sx={{ p: 3, height: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{cls.class_name}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Year {cls.year} • Division {cls.division}
                      </Typography>
                    </Box>
                    <Chip label={`Sem ${cls.semester}`} size="small" color="primary" variant="outlined" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                    <Calendar size={16} />
                    <Typography variant="body2">{cls.academic_year}</Typography>
                  </Box>

                  <Button 
                    variant="outlined" 
                    fullWidth 
                    size="small"
                    onClick={() => navigate('/teacher/attendance')}
                    sx={{ mt: 2 }}
                  >
                    Take Attendance
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

export default TeacherClasses;