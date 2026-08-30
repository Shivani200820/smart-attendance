import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem } from '@mui/material';

const schema = yup.object({
  name: yup.string().required('Class Name is required'), // e.g., "SE"
  division: yup.string().required('Division is required'), // e.g., "A"
  year: yup.number().min(1).max(6).required('Year is required'),
  semester: yup.number().min(1).max(12).required('Semester is required'),
  department_id: yup.number().required('Department is required'),
  academic_year: yup.string().required('Academic Year is required'), // e.g., "2023-2024"
}).required();

const ClassFormDialog = ({ open, onClose, classData, onSubmit, departments }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (classData) reset(classData);
    else reset({});
  }, [classData, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{classData ? 'Edit Class' : 'Add Class'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField fullWidth label="Class Name (e.g., SE)" {...register('name')} error={!!errors.name} helperText={errors.name?.message} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Division (e.g., A)" {...register('division')} error={!!errors.division} helperText={errors.division?.message} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Year" type="number" {...register('year')} error={!!errors.year} helperText={errors.year?.message} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Semester" type="number" {...register('semester')} error={!!errors.semester} helperText={errors.semester?.message} /></Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Department" {...register('department_id')} error={!!errors.department_id} helperText={errors.department_id?.message}>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Academic Year (e.g., 2023-2024)" {...register('academic_year')} error={!!errors.academic_year} helperText={errors.academic_year?.message} /></Grid>
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

export default ClassFormDialog;