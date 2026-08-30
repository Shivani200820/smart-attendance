import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import RiskBadge from '../../components/common/RiskBadge';
import { getLowAttendance } from '../../services/analyticsApi';
import { getClasses, getSubjects, getDepartments } from '../../services/adminApi';

const LowAttendance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ class_id: '', subject_id: '', department_id: '' });
  const [dropdowns, setDropdowns] = useState({ classes: [], subjects: [], departments: [] });

  useEffect(() => {
    const fetchDropdowns = async () => {
      const [c, s, d] = await Promise.all([getClasses(), getSubjects(), getDepartments()]);
      setDropdowns({ classes: c, subjects: s, departments: d });
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Filter out empty string values for the API call
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        const result = await getLowAttendance(activeFilters);
        setData(result);
      } catch (err) {
        console.error('Failed to load low attendance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const columns = [
    { id: 'roll', label: 'Roll No', field: 'roll_number' },
    { id: 'name', label: 'Student Name', field: 'student_name' },
    { id: 'enrollment', label: 'Enrollment', field: 'enrollment_number' },
    { id: 'class', label: 'Class', field: 'class_name' },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: row.attendance_percentage < row.required_percentage ? 'error.main' : 'success.main' }}>
          {row.attendance_percentage.toFixed(1)}% / {row.required_percentage}%
        </Typography>
      )
    },
    { id: 'risk', label: 'Risk Level', render: (row) => <RiskBadge level={row.risk_level} /> }
  ];

  return (
    <DashboardLayout title="Low Attendance Analytics">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Department</InputLabel>
                <Select value={filters.department_id} onChange={(e) => setFilters({ ...filters, department_id: e.target.value })} label="Filter by Department">
                  <MenuItem value="">All Departments</MenuItem>
                  {dropdowns.departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Class</InputLabel>
                <Select value={filters.class_id} onChange={(e) => setFilters({ ...filters, class_id: e.target.value })} label="Filter by Class">
                  <MenuItem value="">All Classes</MenuItem>
                  {dropdowns.classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name} ({c.year}-{c.division})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Subject</InputLabel>
                <Select value={filters.subject_id} onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })} label="Filter by Subject">
                  <MenuItem value="">All Subjects</MenuItem>
                  {dropdowns.subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <DataTable columns={columns} data={data} loading={loading} emptyMessage="No students with low attendance found." />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default LowAttendance;