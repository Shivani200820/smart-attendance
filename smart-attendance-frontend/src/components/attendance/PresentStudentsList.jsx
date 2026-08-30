import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Alert, Button, Chip
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { attendanceService } from '../../services/attendanceService';

const PresentStudentsList = ({ sessionId }) => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      // WARNING: This endpoint does not exist in the current OpenAPI spec.
      // You need to add: GET /api/v1/attendance/sessions/{session_id}/students to your backend.
      const data = await attendanceService.getPresentStudents(sessionId);
      setStudents(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Backend endpoint missing: Add GET /attendance/sessions/{session_id}/students to your FastAPI backend.');
      } else {
        setError('Failed to fetch present students.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchStudents();
  }, [sessionId]);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Present Students List</Typography>
        <Button size="small" startIcon={<Refresh />} onClick={fetchStudents} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
      ) : students.length === 0 ? (
        <Alert severity="info">No students have marked attendance yet.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Roll No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Marked Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>{student.student_name}</TableCell>
                  <TableCell>{student.marked_at ? new Date(student.marked_at).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell><Chip label="Present" color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PresentStudentsList;