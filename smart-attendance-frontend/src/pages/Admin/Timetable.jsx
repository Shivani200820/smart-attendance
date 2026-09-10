import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Chip, CircularProgress, 
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField, Alert
} from '@mui/material';
import { Clock, MapPin, User, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getTimetables, createTimetable, updateTimetable, deleteTimetable, getClasses, getSubjects, getTeachers } from '../../services/adminApi';
import api from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog States
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      class_id: '',
      subject_id: '',
      teacher_id: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      room: ''
    }
  });

  const selectedClass = watch('class_id');
  const selectedSubject = watch('subject_id');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, cData, sData, teaData] = await Promise.all([
        getTimetables(),
        getClasses(),
        getSubjects(),
        getTeachers()
      ]);
      setTimetables(tData);
      setClasses(cData);
      setSubjects(sData);
      setTeachers(teaData);
    } catch (err) {
      console.error('Failed to load data', err);
      setApiError('Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-assign subject to class if not already assigned
  const handleAutoAssign = async () => {
    if (!selectedClass || !selectedSubject) {
      setApiError('Please select both class and subject first');
      return;
    }

    try {
      // First check if already assigned
      await api.post('/admin/assignments/class-subject', {
        class_id: parseInt(selectedClass),
        subject_id: parseInt(selectedSubject)
      });
      
      setSuccessMessage('✅ Subject assigned to class successfully!');
      setApiError('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setSuccessMessage('Subject is already assigned to this class');
        setApiError('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setApiError(err.response?.data?.detail || 'Failed to assign subject');
        setSuccessMessage('');
      }
    }
  };

  const onSubmit = async (data) => {
    setFormLoading(true);
    setApiError('');
    
    try {
      // Ensure we're sending correct data types
      const payload = {
        class_id: parseInt(data.class_id),
        subject_id: parseInt(data.subject_id),
        teacher_id: parseInt(data.teacher_id),
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        room: data.room || null
      };

      console.log('Sending payload:', payload);
      
      if (selectedItem) {
        await updateTimetable(selectedItem.id, payload);
      } else {
        await createTimetable(payload);
      }
      
      setOpenForm(false);
      reset();
      setSelectedItem(null);
      setSuccessMessage('Timetable entry created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Error creating timetable:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Operation failed';
      
      if (err.response) {
        if (err.response.status === 422) {
          const details = err.response.data.detail;
          if (Array.isArray(details)) {
            errorMessage = details.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
          } else if (details) {
            errorMessage = details;
          }
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.detail || 'Subject is not assigned to this class. Please assign it first.';
        } else if (err.response.status === 409) {
          errorMessage = 'A timetable entry already exists for this time slot';
        } else if (err.response.status === 404) {
          errorMessage = 'Class, Subject, or Teacher not found';
        }
      }
      
      setApiError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteTimetable(selectedItem.id);
      setOpenConfirm(false);
      setSelectedItem(null);
      setSuccessMessage('Timetable entry deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err) {
      setApiError('Failed to delete timetable');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Class Timetable">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Class Timetable">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />}
          onClick={() => {
            setSelectedItem(null);
            reset();
            setApiError('');
            setSuccessMessage('');
            setOpenForm(true);
          }}
        >
          Add Timetable Entry
        </Button>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError('')}>
          {apiError}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Desktop View: Weekly Grid */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Grid container spacing={2}>
          {DAYS.map(day => (
            <Grid item xs={12} md={2} key={day}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'primary.main' }}>{day}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {timetables.filter(t => t.day_of_week === day && t.is_active).map((t) => {
                  const subject = subjects.find(s => s.id === t.subject_id);
                  const teacher = teachers.find(tea => tea.id === t.teacher_id);
                  const cls = classes.find(c => c.id === t.class_id);
                  return (
                    <Card key={t.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => { setSelectedItem(t); reset(t); setOpenForm(true); }}>
                          <Edit size={14} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => { setSelectedItem(t); setOpenConfirm(true); }}>
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, pr: 4 }}>{subject?.name || `Subject ${t.subject_id}`}</Typography>
                      <Chip label={`${t.start_time} - ${t.end_time}`} size="small" sx={{ mb: 1, bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main', fontWeight: 600 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem', mb: 0.5 }}>
                        <MapPin size={14} /> {t.room || 'TBA'}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                        <User size={14} /> {teacher?.name?.split(' ')[0] || `T${t.teacher_id}`}
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>{cls?.name}</Typography>
                    </Card>
                  );
                })}
                {timetables.filter(t => t.day_of_week === day && t.is_active).length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No classes</Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add/Edit Timetable Dialog */}
      <Dialog open={openForm} onClose={() => { setOpenForm(false); reset(); setApiError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {selectedItem ? 'Edit Timetable' : 'Add Timetable Entry'}
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller 
                  name="class_id" 
                  control={control} 
                  rules={{ required: 'Class is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.class_id}>
                      <InputLabel>Class</InputLabel>
                      <Select {...field} label="Class">
                        {classes.map(c => (
                          <MenuItem key={c.id} value={c.id}>{c.name} ({c.year}-{c.division})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="subject_id" 
                  control={control} 
                  rules={{ required: 'Subject is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.subject_id}>
                      <InputLabel>Subject</InputLabel>
                      <Select {...field} label="Subject">
                        {subjects.map(s => (
                          <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>
                        ))}
                      </Select>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <AlertCircle size={14} style={{ color: '#F59E0B' }} />
                        <Typography variant="caption" sx={{ color: '#F59E0B' }}>
                          Must be assigned to this class
                        </Typography>
                      </Box>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="teacher_id" 
                  control={control} 
                  rules={{ required: 'Teacher is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.teacher_id}>
                      <InputLabel>Teacher</InputLabel>
                      <Select {...field} label="Teacher">
                        {teachers.map(t => (
                          <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="day_of_week" 
                  control={control} 
                  rules={{ required: 'Day is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.day_of_week}>
                      <InputLabel>Day</InputLabel>
                      <Select {...field} label="Day">
                        {DAYS.map(day => (
                          <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="start_time" 
                  control={control} 
                  rules={{ required: 'Start time is required' }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Start Time" 
                      type="time"
                      fullWidth 
                      error={!!errors.start_time} 
                      helperText={errors.start_time?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="end_time" 
                  control={control} 
                  rules={{ required: 'End time is required' }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="End Time" 
                      type="time"
                      fullWidth 
                      error={!!errors.end_time} 
                      helperText={errors.end_time?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12}>
                <Controller 
                  name="room" 
                  control={control} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Room Number" 
                      fullWidth 
                      error={!!errors.room} 
                      helperText={errors.room?.message}
                      placeholder="e.g., Room 101, Lab A"
                    />
                  )} 
                />
              </Grid>
            </Grid>

            {/* Auto-Assign Button */}
            {selectedClass && selectedSubject && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={handleAutoAssign}
                  startIcon={<Plus size={16} />}
                  sx={{ textTransform: 'none' }}
                >
                  Auto-Assign Subject to Class
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 2 }}>
            <Button onClick={() => { setOpenForm(false); reset(); setApiError(''); }} disabled={formLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formLoading}>
              {formLoading ? <CircularProgress size={24} color="inherit" /> : (selectedItem ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Timetable</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this timetable entry? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenConfirm(false)} disabled={formLoading}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Timetable;