import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import { getStudentAttendanceHistory } from '../../services/attendanceApi';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudentAttendanceHistory(50, 0);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { id: 'date', label: 'Date', field: 'date' },
    { id: 'subject', label: 'Subject', render: (row) => `${row.subject_name} (${row.subject_code})` },
    { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { id: 'marked', label: 'Marked At', render: (row) => row.marked_at ? new Date(row.marked_at).toLocaleTimeString() : 'N/A' }
  ];

  return (
    <DashboardLayout title="Attendance History">
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Attendance Records</Typography>
          <DataTable 
            columns={columns} 
            data={history} 
            loading={loading} 
            emptyMessage="No attendance records found." 
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AttendanceHistory;