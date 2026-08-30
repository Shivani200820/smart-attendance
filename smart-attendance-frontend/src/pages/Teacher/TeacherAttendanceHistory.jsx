import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';

// ✅ FIXED: Import from the correct service files
import { closeAttendanceSession } from '../../services/attendanceApi';
import { getTeacherSessions } from '../../services/teacherApi';

const TeacherAttendanceHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTeacherSessions(50);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = (session) => {
    setSelectedSession(session);
    setOpenConfirm(true);
  };

  const handleConfirmClose = async () => {
    if (!selectedSession) return;
    
    setClosingId(selectedSession.session_id);
    try {
      await closeAttendanceSession(selectedSession.session_id);
      
      // Update local state instantly
      setHistory(prev => 
        prev.map(s => 
          s.session_id === selectedSession.session_id 
            ? { ...s, status: 'CLOSED' } 
            : s
        )
      );
      
      setOpenConfirm(false);
      setSelectedSession(null);
    } catch (err) {
      console.error('Failed to close session:', err);
      alert(err.response?.data?.detail || 'Failed to close session');
    } finally {
      setClosingId(null);
    }
  };

  const columns = [
    { id: 'date', label: 'Date', field: 'date' },
    { id: 'class', label: 'Class', field: 'class_name' },
    { id: 'subject', label: 'Subject', render: (row) => `${row.subject_name} (${row.subject_code || ''})` },
    { id: 'time', label: 'Time', render: (row) => `${row.start_time} - ${row.end_time}` },
    { 
      id: 'status', 
      label: 'Status', 
      render: (row) => <StatusChip status={row.status} /> 
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'ACTIVE' ? (
            <>
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                onClick={() => navigate(`/teacher/attendance/${row.session_id}`)}
              >
                View Live
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                color="error"
                onClick={() => handleCloseClick(row)}
                disabled={closingId === row.session_id}
              >
                {closingId === row.session_id ? <CircularProgress size={16} color="inherit" /> : 'Close'}
              </Button>
            </>
          ) : (
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => navigate(`/teacher/attendance/${row.session_id}`)}
            >
              View Details
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <DashboardLayout title="Attendance History">
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Attendance Sessions</Typography>
          <DataTable 
            columns={columns} 
            data={history} 
            loading={loading} 
            emptyMessage="No attendance sessions found." 
          />
        </CardContent>
      </Card>

      {/* Close Session Confirmation Dialog */}
      <Dialog 
        open={openConfirm} 
        onClose={() => setOpenConfirm(false)}
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Close Attendance Session
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to close the attendance session for <strong>{selectedSession?.class_name}</strong> - <strong>{selectedSession?.subject_name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Once closed, students will no longer be able to mark attendance.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenConfirm(false)} disabled={closingId}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmClose} 
            variant="contained" 
            color="error"
            disabled={closingId}
          >
            {closingId ? <CircularProgress size={24} color="inherit" /> : 'Close Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default TeacherAttendanceHistory;