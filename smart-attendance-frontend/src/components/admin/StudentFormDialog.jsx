import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem
} from '@mui/material';

// Validation Schema
const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  enrollment_number: yup.string().required('Enrollment Number is required'),
  roll_number: yup.number().positive('Roll number must be positive').required('Roll Number is required'),
  department_id: yup.number().positive('Department is required').required('Department is required'),
  class_id: yup.number().positive('Class is required').required('Class is required'),
  year: yup.number().min(1).max(6).required('Year is required'),
  division: yup.string().required('Division is required'),
  academic_year: yup.string().required('Academic Year is required'),
  semester: yup.number().min(1).max(12).required('Semester is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required for new students'),
    otherwise: (schema) => schema.notRequired(),
  }),
}).required();

const StudentFormDialog = ({ open, onClose, student, onSubmit, departments, classes }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: !!student },
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        email: student.email,
        enrollment_number: student.enrollment_number,
        roll_number: student.roll_number,
        department_id: student.department_id,
        class_id: student.class_id,
        year: student.year,
        division: student.division,
        academic_year: student.academic_year,
        semester: student.semester,
      });
    } else {
      reset({});
    }
  }, [student, open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Enrollment Number"
                {...register('enrollment_number')}
                error={!!errors.enrollment_number}
                helperText={errors.enrollment_number?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roll Number"
                type="number"
                {...register('roll_number')}
                error={!!errors.roll_number}
                helperText={errors.roll_number?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                {...register('department_id')}
                error={!!errors.department_id}
                helperText={errors.department_id?.message}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Class"
                {...register('class_id')}
                error={!!errors.class_id}
                helperText={errors.class_id?.message}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name} - {cls.division}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                {...register('year')}
                error={!!errors.year}
                helperText={errors.year?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Division"
                {...register('division')}
                error={!!errors.division}
                helperText={errors.division?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                {...register('academic_year')}
                error={!!errors.academic_year}
                helperText={errors.academic_year?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                type="number"
                {...register('semester')}
                error={!!errors.semester}
                helperText={errors.semester?.message}
              />
            </Grid>
            {!student && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
            )}
          </Grid>
          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {student ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;