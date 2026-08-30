import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading, confirmText = 'Confirm', color = 'error' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: color === 'error' ? 'error.main' : 'primary.main' }}>
        <AlertTriangle size={24} /> {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={color} disabled={loading} sx={{ minWidth: 100 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;