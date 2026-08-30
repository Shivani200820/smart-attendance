import React, { useState } from 'react';
import { Box, Grid, Card, CardContent, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Typography, Button } from '@mui/material';
import { FileDown } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getDailyReport, getMonthlyReport } from '../../services/reportsApi';

const Reports = () => {
  const [tab, setTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const data = await getDailyReport(dailyDate);
        setReportData({ type: 'Daily', date: dailyDate, ...data });
      } else {
        const data = await getMonthlyReport(monthlyYear, monthlyMonth);
        setReportData({ type: 'Monthly', date: `${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}`, ...data });
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  const StatBox = ({ label, value, color = 'text.primary' }) => (
    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{label}</Typography>
    </Box>
  );

  return (
    <DashboardLayout title="Reports">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Tabs value={tab} onChange={(e, v) => { setTab(v); setReportData(null); }} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Daily Report" />
            <Tab label="Monthly Report" />
          </Tabs>

          <Grid container spacing={3} sx={{ mb: 4, alignItems: 'flex-end' }}>
            {tab === 0 ? (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Date</InputLabel>
                  <Select value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} label="Select Date">
                    <MenuItem value={dailyDate}>{dailyDate}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select value={monthlyYear} onChange={(e) => setMonthlyYear(e.target.value)} label="Year">
                      {[2023, 2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select value={monthlyMonth} onChange={(e) => setMonthlyMonth(e.target.value)} label="Month">
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} md={4}>
              <Button variant="contained" fullWidth onClick={fetchReport} disabled={loading} sx={{ py: 1.5 }}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>

          {reportData && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {reportData.type} Attendance Report: {reportData.date}
                </Typography>
                <Button variant="outlined" startIcon={<FileDown size={18} />} disabled>
                  Export PDF (Backend Pending)
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={2.4}><StatBox label="Total Students" value={reportData.total_students} /></Grid>
                <Grid item xs={6} md={2.4}><StatBox label="Present" value={reportData.present_students || reportData.present_count} color="success.main" /></Grid>
                <Grid item xs={6} md={2.4}><StatBox label="Absent" value={reportData.absent_students || reportData.absent_count} color="error.main" /></Grid>
                <Grid item xs={6} md={2.4}><StatBox label="Leave" value={reportData.leave_students || reportData.leave_count} color="warning.main" /></Grid>
                <Grid item xs={6} md={2.4}>
                  <StatBox 
                    label="Attendance %" 
                    value={`${reportData.attendance_percentage.toFixed(1)}%`} 
                    color={reportData.attendance_percentage >= 75 ? 'success.main' : 'error.main'} 
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Reports;