import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getClassAnalytics, getSubjectAnalytics, getDepartmentAnalytics, getMonthlyAnalytics } from '../../services/analyticsApi';

const Analytics = () => {
  const [classData, setClassData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, subjectRes, deptRes, monthlyRes] = await Promise.all([
        getClassAnalytics(),
        getSubjectAnalytics(),
        getDepartmentAnalytics(),
        getMonthlyAnalytics(selectedYear, selectedMonth)
      ]);
      setClassData(classRes);
      setSubjectData(subjectRes);
      setDepartmentData(deptRes);
      setMonthlyData(monthlyRes);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics Dashboard">
      {/* Monthly Filter */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                  {[2023, 2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      {monthlyData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>{monthlyData.total_lectures}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Lectures</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{monthlyData.present_count}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Present</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>{monthlyData.absent_count}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Absent</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{monthlyData.leave_count}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Leave</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>{monthlyData.attendance_percentage.toFixed(1)}%</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Attendance %</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Class-wise Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Class-wise Attendance</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="class_name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="average_attendance" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Department-wise Attendance</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="average_attendance"
                    nameKey="department_name"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {departmentData.map((dept, index) => (
                <Box key={dept.department_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                  <Typography variant="caption">{dept.department_name}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Subject-wise Analytics */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Subject-wise Attendance</Typography>
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={subjectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <YAxis dataKey="subject_name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} width={150} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="attendance_percentage" fill="#16A34A" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;