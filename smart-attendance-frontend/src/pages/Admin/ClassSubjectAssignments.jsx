import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Chip, CircularProgress, 
  Button, IconButton, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getClasses, getSubjects } from '../../services/adminApi';
import api from '../../services/api';

const ClassSubjectAssignments = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, sData] = await Promise.all([
        getClasses(),
        getSubjects()
      ]);
      setClasses(cData);
      setSubjects(sData);
      
      // Fetch existing assignments (you might need to add this endpoint)
      // For now, we'll just show the form
    } catch (err) {
      console.error('Failed to load data', err);
      setMessage({ type: 'error', text: 'Failed to load classes or subjects' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClass || !selectedSubject) {
      setMessage({ type: 'error', text: 'Please select both class and subject' });
      return;
    }

    setAssigning(true);
    try {
      await api.post('/admin/assignments/class-subject', {
        class_id: parseInt(selectedClass),
        subject_id: parseInt(selectedSubject)
      });
      
      setMessage({ type: 'success', text: 'Subject assigned to class successfully!' });
      setSelectedSubject(''); // Reset subject selection
    } catch (err) {
      console.error('Assignment error:', err);
      if (err.response?.status === 409) {
        setMessage({ type: 'error', text: 'This subject is already assigned to this class' });
      } else {
        setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to assign subject' });
      }
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Class-Subject Assignments">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Class-Subject Assignments">
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Before creating a timetable entry, you must assign subjects to classes. 
          This ensures that only valid subject-class combinations can be scheduled.
        </Typography>
      </Alert>

      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Assign Subject to Class
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Class</InputLabel>
                <Select 
                  value={selectedClass} 
                  label="Class"
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubject(''); // Reset subject when class changes
                  }}
                >
                  {classes.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} (Year {c.year} - {c.division})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Subject</InputLabel>
                <Select 
                  value={selectedSubject} 
                  label="Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass}
                >
                  {subjects.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button 
                variant="contained" 
                fullWidth
                startIcon={assigning ? <CircularProgress size={20} color="inherit" /> : <Plus size={18} />}
                onClick={handleAssign}
                disabled={assigning || !selectedClass || !selectedSubject}
                sx={{ py: 1.5 }}
              >
                {assigning ? 'Assigning...' : 'Assign Subject to Class'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                How It Works
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CheckCircle size={20} color="#16A34A" style={{ marginTop: 2 }} />
                  <Typography variant="body2">
                    <strong>Step 1:</strong> Select a class from the dropdown
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CheckCircle size={20} color="#16A34A" style={{ marginTop: 2 }} />
                  <Typography variant="body2">
                    <strong>Step 2:</strong> Select a subject to assign to that class
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CheckCircle size={20} color="#16A34A" style={{ marginTop: 2 }} />
                  <Typography variant="body2">
                    <strong>Step 3:</strong> Click "Assign Subject to Class"
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CheckCircle size={20} color="#16A34A" style={{ marginTop: 2 }} />
                  <Typography variant="body2">
                    <strong>Step 4:</strong> Now you can create timetable entries for this class-subject combination
                  </Typography>
                </Box>
              </Box>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> A subject must be assigned to a class before you can:
                  <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                    <li>Create timetable entries</li>
                    <li>Start attendance sessions</li>
                    <li>Mark attendance for that subject</li>
                  </ul>
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ClassSubjectAssignments;