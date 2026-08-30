import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert
} from '@mui/material';
import { authService } from '../../services/authService';

const schema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
}).required();

const ChangePasswordDialog = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.changePassword(data);
      setSuccess('Password changed successfully!');
      reset();
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth label="Current Password" type="password" {...register('current_password')}
            error={!!errors.current_password} helperText={errors.current_password?.message}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth label="New Password" type="password" {...register('new_password')}
            error={!!errors.new_password} helperText={errors.new_password?.message}
          />
          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;