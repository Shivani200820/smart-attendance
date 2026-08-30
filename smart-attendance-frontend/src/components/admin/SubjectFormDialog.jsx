import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem } from '@mui/material';

const schema = yup.object({
  name: yup.string().required('Subject Name is required'),
  code: yup.string().required('Subject Code is required'),
  department_id: yup.number().required('Department is required'),
}).required();

const SubjectFormDialog = ({ open, onClose, subject, onSubmit, departments }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (subject) reset(subject);
    else reset({});
  }, [subject, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{subject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Subject Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Subject Code" {...register('code')} error={!!errors.code} helperText={errors.code?.message} /></Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Department" {...register('department_id')} error={!!errors.department_id} helperText={errors.department_id?.message}>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
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

export default SubjectFormDialog;