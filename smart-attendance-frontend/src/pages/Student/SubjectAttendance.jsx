import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, CircularProgress, Alert, LinearProgress
} from '@mui/material';
import { studentService } from '../../services/studentService';
import RiskBadge from '../../components/common/RiskBadge';

const SubjectAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await studentService.getSubjectAttendance();
        setSubjects(data);
      } catch (err) {
        setError('Failed to load subject attendance data.');
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Subject-wise Attendance
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject Code</TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell align="center">Present</TableCell>
              <TableCell align="center">Absent</TableCell>
              <TableCell align="center">Leave</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Percentage</TableCell>
              <TableCell align="center">Risk Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((sub) => (
              <TableRow key={sub.subject_id}>
                <TableCell>{sub.subject_code}</TableCell>
                <TableCell>{sub.subject_name}</TableCell>
                <TableCell align="center">{sub.present_count}</TableCell>
                <TableCell align="center">{sub.absent_count}</TableCell>
                <TableCell align="center">{sub.leave_count}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={sub.attendance_percentage} 
                        color={sub.attendance_percentage < sub.required_percentage ? 'error' : 'success'}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="textSecondary">
                        {sub.attendance_percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <RiskBadge riskLevel={sub.risk_level} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SubjectAttendance;