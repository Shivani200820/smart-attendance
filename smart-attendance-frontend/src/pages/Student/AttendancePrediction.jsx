import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Chip
} from '@mui/material';
import { TrendingUp, CheckCircle, Cancel } from '@mui/icons-material';
import { studentService } from '../../services/studentService';

const AttendancePrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [predData, recData] = await Promise.all([
          studentService.getAttendancePrediction(),
          studentService.getAttendanceRecovery(),
        ]);
        setPrediction(predData);
        setRecovery(recData);
      } catch (err) {
        setError('Failed to load prediction data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  }

  if (!prediction || !recovery) {
    return <Alert severity="info">No prediction data available.</Alert>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Attendance Prediction & Recovery
      </Typography>

      {/* Current Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Current Attendance</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                {prediction.current_percentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2">Present: {prediction.present_count} / {prediction.total_lectures} lectures</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Required Attendance</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                {prediction.required_percentage}%
              </Typography>
              <Typography variant="body2">Minimum required to be safe</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: prediction.achievable ? 'success.light' : 'error.light', color: prediction.achievable ? 'success.contrastText' : 'error.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Lectures Required</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                {prediction.lectures_required ?? 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {prediction.achievable ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                {prediction.achievable ? 'Achievable' : 'Not Achievable'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recovery Scenarios Table */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp /> Recovery Scenarios
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Future Lectures</strong></TableCell>
              <TableCell><strong>Predicted Present</strong></TableCell>
              <TableCell><strong>Predicted Total</strong></TableCell>
              <TableCell><strong>Predicted Attendance %</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recovery.scenarios.map((scenario, index) => (
              <TableRow 
                key={index} 
                sx={{ bgcolor: scenario.reaches_required ? 'success.50' : 'inherit' }}
              >
                <TableCell>{scenario.future_lectures}</TableCell>
                <TableCell>{scenario.predicted_present}</TableCell>
                <TableCell>{scenario.predicted_total}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {scenario.predicted_percentage.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={scenario.reaches_required ? 'Reaches Target' : 'Below Target'} 
                    color={scenario.reaches_required ? 'success' : 'error'} 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendancePrediction;