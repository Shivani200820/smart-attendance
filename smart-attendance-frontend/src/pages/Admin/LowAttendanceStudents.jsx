import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, CircularProgress, Alert, Chip
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { attendanceService } from '../../services/attendanceService';
import RiskBadge from '../../components/common/RiskBadge';

const LowAttendanceStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // You can pass params like { class_id: 1 } if needed
        const data = await attendanceService.getLowAttendance();
        setStudents(data);
      } catch (err) {
        setError('Failed to load low attendance students.');
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Warning color="error" />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Low Attendance Students
        </Typography>
      </Box>

      {students.length === 0 ? (
        <Alert severity="success">Great! No students are below the required attendance percentage.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roll No</TableCell>
                <TableCell>Enrollment No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Present</TableCell>
                <TableCell align="center">Absent</TableCell>
                <TableCell align="center">Attendance %</TableCell>
                <TableCell align="center">Required %</TableCell>
                <TableCell align="center">Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.student_id} sx={{ bgcolor: student.risk_level === 'CRITICAL' ? 'error.50' : 'inherit' }}>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>{student.enrollment_number}</TableCell>
                  <TableCell>{student.student_name}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                  <TableCell align="center">{student.present_count}</TableCell>
                  <TableCell align="center">{student.absent_count}</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold" color="error.main">
                      {student.attendance_percentage.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{student.required_percentage}%</TableCell>
                  <TableCell align="center">
                    <RiskBadge riskLevel={student.risk_level} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LowAttendanceStudents;