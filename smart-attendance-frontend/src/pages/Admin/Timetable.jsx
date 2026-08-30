import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Chip, CircularProgress, 
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { Clock, MapPin, User, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getTimetables, createTimetable, updateTimetable, deleteTimetable, getClasses, getSubjects, getTeachers } from '../../services/adminApi';

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

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
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
    } finally {
      setLoading(false);
    }
  };

 const onSubmit = async (data) => {
  setFormLoading(true);
  try {
    console.log('Creating timetable with data:', data);
    
    // Ensure we're sending the correct data types
    const payload = {
      class_id: parseInt(data.class_id),
      subject_id: parseInt(data.subject_id),
      teacher_id: parseInt(data.teacher_id),
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      room: data.room || null
    };
    
    console.log('Payload being sent:', payload);
    
    if (selectedItem) {
      await updateTimetable(selectedItem.id, payload);
    } else {
      await createTimetable(payload);
    }
    
    setOpenForm(false);
    reset();
    setSelectedItem(null);
    fetchData();
  } catch (err) {
    console.error('Error creating timetable:', err);
    console.error('Error response:', err.response);
    console.error('Error data:', err.response?.data);
    
    let errorMessage = 'Operation failed';
    
    if (err.response) {
      // Backend returned an error
      if (err.response.status === 422) {
        // Validation error
        const details = err.response.data.detail;
        if (Array.isArray(details)) {
          errorMessage = details.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else if (details) {
          errorMessage = details;
        }
      } else if (err.response.status === 409) {
        // Conflict - timetable entry already exists
        errorMessage = 'A timetable entry already exists for this time slot';
      } else if (err.response.status === 404) {
        errorMessage = 'Class, Subject, or Teacher not found';
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      }
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = 'Backend server is not running';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    alert(errorMessage);
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
      fetchData();
    } catch (err) {
      alert('Failed to delete timetable');
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
            setOpenForm(true);
          }}
        >
          Add Timetable Entry
        </Button>
      </Box>

      {/* Mobile View: Stacked Cards by Day */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {DAYS.map(day => {
          const dayClasses = timetables.filter(t => t.day_of_week === day && t.is_active);
          return (
            <Card key={day} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>{day}</Typography>
                {dayClasses.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No classes</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {dayClasses.map((t) => {
                      const subject = subjects.find(s => s.id === t.subject_id);
                      const teacher = teachers.find(tea => tea.id === t.teacher_id);
                      const cls = classes.find(c => c.id === t.class_id);
                      return (
                        <Grid item xs={12} key={t.id}>
                          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, position: 'relative' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{subject?.name || `Subject ${t.subject_id}`}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{cls?.name || `Class ${t.class_id}`}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
                              <Clock size={16} /> <Typography variant="body2">{t.start_time} - {t.end_time}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                              <MapPin size={16} /> <Typography variant="body2">{t.room || 'TBA'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                              <User size={16} /> <Typography variant="body2">{teacher?.name || `Teacher ${t.teacher_id}`}</Typography>
                            </Box>
                            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => { setSelectedItem(t); reset(t); setOpenForm(true); }}>
                                <Edit size={16} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => { setSelectedItem(t); setOpenConfirm(true); }}>
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

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
      <Dialog open={openForm} onClose={() => { setOpenForm(false); reset(); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {selectedItem ? 'Edit Timetable' : 'Add Timetable Entry'}
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
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
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 2 }}>
            <Button onClick={() => { setOpenForm(false); reset(); }} disabled={formLoading}>Cancel</Button>
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