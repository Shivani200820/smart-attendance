import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box } from '@mui/material';

const FormDialog = ({ open, onClose, title, onSubmit, children, loading, submitText = 'Save' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{title}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {children}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 2 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: 100 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;