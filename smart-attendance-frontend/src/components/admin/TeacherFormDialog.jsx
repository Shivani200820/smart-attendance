import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem
} from '@mui/material';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  employee_id: yup.string().required('Employee ID is required').min(2, 'Employee ID must be at least 2 characters'),
  department_id: yup.number().positive('Department is required').required('Department is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required for new teachers'),
    otherwise: (schema) => schema.notRequired(),
  }),
}).required();

const TeacherFormDialog = ({ open, onClose, teacher, onSubmit, departments }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: !!teacher },
  });

  useEffect(() => {
    if (teacher) {
      reset({
        name: teacher.name,
        email: teacher.email,
        employee_id: teacher.employee_id,
        department_id: teacher.department_id,
      });
    } else {
      reset({});
    }
  }, [teacher, open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
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
                label="Employee ID"
                {...register('employee_id')}
                error={!!errors.employee_id}
                helperText={errors.employee_id?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Department"
                {...register('department_id')}
                error={!!errors.department_id}
                helperText={errors.department_id?.message}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name} ({dept.code})</MenuItem>
                ))}
              </TextField>
            </Grid>
            {!teacher && (
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
              {teacher ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherFormDialog;