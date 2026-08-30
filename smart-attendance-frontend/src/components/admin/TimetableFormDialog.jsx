import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem } from '@mui/material';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const schema = yup.object({
  class_id: yup.number().required('Class is required'),
  subject_id: yup.number().required('Subject is required'),
  teacher_id: yup.number().required('Teacher is required'),
  day_of_week: yup.string().required('Day is required'),
  start_time: yup.string().required('Start Time is required'),
  end_time: yup.string().required('End Time is required'),
  room: yup.string(),
}).required();

const TimetableFormDialog = ({ open, onClose, timetable, onSubmit, classes, subjects, teachers }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (timetable) {
      reset({
        class_id: timetable.class_id,
        subject_id: timetable.subject_id,
        teacher_id: timetable.teacher_id,
        day_of_week: timetable.day_of_week,
        start_time: timetable.start_time,
        end_time: timetable.end_time,
        room: timetable.room || '',
      });
    } else {
      reset({});
    }
  }, [timetable, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{timetable ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Class" {...register('class_id')} error={!!errors.class_id} helperText={errors.class_id?.message}>
                {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} - {c.division}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Subject" {...register('subject_id')} error={!!errors.subject_id} helperText={errors.subject_id?.message}>
                {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Teacher" {...register('teacher_id')} error={!!errors.teacher_id} helperText={errors.teacher_id?.message}>
                {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Day of Week" {...register('day_of_week')} error={!!errors.day_of_week} helperText={errors.day_of_week?.message}>
                {daysOfWeek.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Room" {...register('room')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Start Time" type="time" InputLabelProps={{ shrink: true }} {...register('start_time')} error={!!errors.start_time} helperText={errors.start_time?.message} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="End Time" type="time" InputLabelProps={{ shrink: true }} {...register('end_time')} error={!!errors.end_time} helperText={errors.end_time?.message} />
            </Grid>
          </Grid>
          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableFormDialog;