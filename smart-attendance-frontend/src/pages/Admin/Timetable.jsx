import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Chip, CircularProgress, 
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import { Clock, MapPin, User, Plus, Edit, Trash2, AlertCircle, CheckCircle2, Link2 } from 'lucide-react';
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
  
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [assignStatus, setAssignStatus] = useState({ classSubject: '', teacherSubject: '' });
  const [isReady, setIsReady] = useState(false);

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
  const selectedTeacher = watch('teacher_id');

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

  // Step 1: Assign Subject to Class
  const assignSubjectToClass = async (classId, subjectId) => {
    if (!classId || !subjectId) return false;
    
    try {
      await api.post('/admin/assignments/class-subject', {
        class_id: parseInt(classId),
        subject_id: parseInt(subjectId)
      });
      return true; // Success
    } catch (err) {
      if (err.response?.status === 409) return true; // Already assigned
      return false; // Failed
    }
  };

  // Step 2: Assign Teacher to Subject
  const assignTeacherToSubject = async (teacherId, subjectId) => {
    if (!teacherId || !subjectId) return false;
    
    try {
      await api.post('/admin/assignments/teacher-subject', {
        teacher_id: parseInt(teacherId),
        subject_id: parseInt(subjectId)
      });
      return true; // Success
    } catch (err) {
      if (err.response?.status === 409) return true; // Already assigned
      console.error('Teacher-Subject assignment error:', err);
      return false; // Failed
    }
  };

  // Check all assignments when selections change
  useEffect(() => {
    const checkAllAssignments = async () => {
      if (!selectedClass || !selectedSubject || !selectedTeacher) {
        setIsReady(false);
        return;
      }

      // Check Class-Subject
      const classSubjectOk = await assignSubjectToClass(selectedClass, selectedSubject);
      setAssignStatus(prev => ({ ...prev, classSubject: classSubjectOk ? 'success' : 'error' }));

      // Check Teacher-Subject
      const teacherSubjectOk = await assignTeacherToSubject(selectedTeacher, selectedSubject);
      setAssignStatus(prev => ({ ...prev, teacherSubject: teacherSubjectOk ? 'success' : 'error' }));

      // Enable form only if both are assigned
      setIsReady(classSubjectOk && teacherSubjectOk);
    };

    checkAllAssignments();
  }, [selectedClass, selectedSubject, selectedTeacher]);

 // Just update the onSubmit function in your existing Timetable.jsx:

const onSubmit = async (data) => {
  setFormLoading(true);
  setApiError('');
  setSuccessMessage('');
  
  // Validate time range
  const start = new Date(`2000-01-01 ${data.start_time}`);
  const end = new Date(`2000-01-01 ${data.end_time}`);
  const durationHours = (end - start) / (1000 * 60 * 60);
  
  if (durationHours <= 0) {
    alert('❌ End time must be after start time!');
    setFormLoading(false);
    return;
  }
  
  if (durationHours > 4) {
    alert(`️ Warning: This class is ${durationHours} hours long. Are you sure this is correct?\n\nMost classes are 1-2 hours.`);
    if (!window.confirm('Click OK to proceed anyway, or Cancel to fix the time.')) {
      setFormLoading(false);
      return;
    }
  }
  
  try {
    // Ensure assignments exist
    const classSubjectOk = await assignSubjectToClass(data.class_id, data.subject_id);
    const teacherSubjectOk = await assignTeacherToSubject(data.teacher_id, data.subject_id);
    
    if (!classSubjectOk || !teacherSubjectOk) {
      throw new Error('Failed to setup required assignments.');
    }

    const payload = {
      class_id: parseInt(data.class_id),
      subject_id: parseInt(data.subject_id),
      teacher_id: parseInt(data.teacher_id),
      day_of_week: data.day_of_week.toUpperCase(),
      start_time: data.start_time,
      end_time: data.end_time,
      room: data.room || null
    };

    console.log('🚀 Sending Payload:', payload);
    
    if (selectedItem) {
      await updateTimetable(selectedItem.id, payload);
      setSuccessMessage('✅ Timetable updated successfully!');
    } else {
      await createTimetable(payload);
      setSuccessMessage('✅ Timetable entry created successfully!');
    }
    
    setOpenForm(false);
    reset();
    setSelectedItem(null);
    setIsReady(false);
    setAssignStatus({ classSubject: '', teacherSubject: '' });
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchData();
  } catch (err) {
    console.error('❌ Backend Error:', err.response?.data);
    
    const errorDetails = err.response?.data 
      ? JSON.stringify(err.response.data, null, 2) 
      : err.message;
    
    // Show specific error based on status
    let userMessage = 'Backend Rejected Request!';
    let errorMessage = 'Operation failed';
    
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;
      
      if (status === 400) {
        const detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        
        if (detail.includes('Timetable conflict detected') || detail.includes('conflict')) {
          userMessage = '⚠️ Scheduling Conflict!\n\nThis time slot is already booked. Possible reasons:\n\n1. Teacher is teaching another class\n2. Room is already reserved\n3. Class already has a subject at this time\n\nPlease choose a different time, teacher, or room.';
          errorMessage = detail;
        } else if (detail.includes('not assigned')) {
          userMessage = `⚠️ Missing Assignment\n\n${detail}\n\nPlease ensure all required assignments are made.`;
          errorMessage = detail;
        } else {
          userMessage = ` Backend Error\n\n${detail}`;
          errorMessage = detail;
        }
      } else if (status === 409) {
        userMessage = '⚠️ Duplicate Entry\n\nA timetable entry already exists for this exact time slot.';
        errorMessage = 'Timetable entry already exists';
      } else if (status === 422) {
        const details = data.detail;
        errorMessage = Array.isArray(details) ? details.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(' | ') : 'Validation error';
        userMessage = ` Validation Error\n\n${errorMessage}`;
      }
    }
    
    alert(userMessage);
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
      setSuccessMessage('✅ Timetable entry deleted successfully!');
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
            setIsReady(false);
            setAssignStatus({ classSubject: '', teacherSubject: '' });
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
                {timetables.filter(t => t.day_of_week === day && t.is_active !== false).map((t) => {
                  const subject = subjects.find(s => s.id === t.subject_id);
                  const teacher = teachers.find(tea => tea.id === t.teacher_id);
                  const cls = classes.find(c => c.id === t.class_id);
                  return (
                    <Card key={t.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => { 
                          setSelectedItem(t); 
                          reset({
                            class_id: t.class_id,
                            subject_id: t.subject_id,
                            teacher_id: t.teacher_id,
                            day_of_week: t.day_of_week,
                            start_time: t.start_time,
                            end_time: t.end_time,
                            room: t.room || ''
                          }); 
                          setOpenForm(true); 
                        }}>
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
                {timetables.filter(t => t.day_of_week === day && t.is_active !== false).length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No classes</Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add/Edit Timetable Dialog */}
      <Dialog open={openForm} onClose={() => { setOpenForm(false); reset(); setApiError(''); setSuccessMessage(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {selectedItem ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            
            {/* Assignment Status Indicators */}
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity={assignStatus.classSubject === 'error' ? 'error' : 'success'} 
                sx={{ mb: 1, fontSize: '0.8rem' }}
                icon={assignStatus.classSubject === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              >
                {assignStatus.classSubject === 'success' ? 'Subject linked to Class ✓' : 'Linking subject to class...'}
              </Alert>
              <Alert 
                severity={assignStatus.teacherSubject === 'error' ? 'error' : 'success'} 
                sx={{ mb: 1, fontSize: '0.8rem' }}
                icon={assignStatus.teacherSubject === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              >
                {assignStatus.teacherSubject === 'success' ? 'Teacher linked to Subject ✓' : 'Linking teacher to subject...'}
              </Alert>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller 
                  name="class_id" 
                  control={control} 
                  rules={{ required: 'Class is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.class_id}>
                      <InputLabel>Class *</InputLabel>
                      <Select {...field} label="Class *">
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
                      <InputLabel>Subject *</InputLabel>
                      <Select {...field} label="Subject *">
                        {subjects.map(s => (
                          <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>
                        ))}
                      </Select>
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
                      <InputLabel>Teacher *</InputLabel>
                      <Select {...field} label="Teacher *">
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
                      <InputLabel>Day *</InputLabel>
                      <Select {...field} label="Day *">
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
                      label="Start Time *" 
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
                      label="End Time *" 
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
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 2 }}>
            <Button onClick={() => { setOpenForm(false); reset(); setApiError(''); setSuccessMessage(''); }} disabled={formLoading}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formLoading || !isReady}
              startIcon={isReady ? <CheckCircle2 size={16} /> : <Link2 size={16} />}
            >
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