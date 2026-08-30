import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';

const schema = yup.object({
  name: yup.string().required('Department Name is required').min(2),
  code: yup.string().required('Department Code is required').min(2).max(20),
}).required();

const DepartmentFormDialog = ({ open, onClose, department, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (department) {
      reset({ name: department.name, code: department.code });
    } else {
      reset({});
    }
  }, [department, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{department ? 'Edit Department' : 'Add Department'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Department Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Department Code (e.g., CS, IT)" {...register('code')} error={!!errors.code} helperText={errors.code?.message} />
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

export default DepartmentFormDialog;