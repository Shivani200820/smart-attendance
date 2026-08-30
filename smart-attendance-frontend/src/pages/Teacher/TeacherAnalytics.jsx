import { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../services/axiosInstance';

const TeacherAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/teacher/analytics');
        setData(response.data);
      } catch (err) {
        setError('Failed to load teacher analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // OpenAPI Spec Gap: The schema for /teacher/analytics is currently empty {}.
  // The UI below assumes the backend will return data similar to admin analytics.
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>Teacher Analytics</Typography>
        <Alert severity="warning">
          Backend API Gap: The endpoint <code>GET /api/v1/teacher/analytics</code> returned empty data. 
          Please ensure the FastAPI backend returns class-wise, subject-wise, and monthly analytics for the logged-in teacher.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>Teacher Analytics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Class-wise Attendance</Typography>
            {/* Render chart if data.class_attendance exists */}
            <Typography color="textSecondary">Chart data pending backend schema update.</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherAnalytics;