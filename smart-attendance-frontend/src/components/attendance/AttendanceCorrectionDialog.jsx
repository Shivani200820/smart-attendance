import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Box } from '@mui/material';
import FormDialog from '../common/FormDialog';

const AttendanceCorrectionDialog = ({ open, onClose, onSubmit, loading, studentName }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { status: 'PRESENT', correction_reason: '' }
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <FormDialog 
      open={open} 
      onClose={() => { onClose(); reset(); }} 
      title="Correct Attendance Record" 
      onSubmit={handleSubmit(handleFormSubmit)} 
      loading={loading}
      submitText="Update Record"
    >
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 1 }}>
        Correcting record for: <strong>{studentName}</strong>
      </Box>
      
      <Controller 
        name="status" 
        control={control} 
        rules={{ required: 'Status is required' }} 
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Change Status To</InputLabel>
            <Select {...field} label="Change Status To">
              <MenuItem value="PRESENT">Present</MenuItem>
              <MenuItem value="ABSENT">Absent</MenuItem>
              <MenuItem value="LEAVE">Leave</MenuItem>
            </Select>
          </FormControl>
        )} 
      />
      
      <Controller 
        name="correction_reason" 
        control={control} 
        rules={{ required: 'Reason is required', minLength: { value: 5, message: 'Reason must be at least 5 characters' } }} 
        render={({ field }) => (
          <TextField 
            {...field} 
            label="Reason for Correction" 
            multiline 
            rows={3} 
            fullWidth 
            error={!!errors.correction_reason} 
            helperText={errors.correction_reason?.message} 
            placeholder="e.g., QR scanner failed, student was present but marked absent"
          />
        )} 
      />
    </FormDialog>
  );
};

export default AttendanceCorrectionDialog;