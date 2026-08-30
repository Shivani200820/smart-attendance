import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  PRESENT: { color: 'success', label: 'Present' },
  ABSENT: { color: 'error', label: 'Absent' },
  LEAVE: { color: 'warning', label: 'Leave' },
  ACTIVE: { color: 'primary', label: 'Active' },
  CLOSED: { color: 'default', label: 'Closed' },
};

const StatusChip = ({ status }) => {
  const config = statusConfig[status?.toUpperCase()] || { color: 'default', label: status };
  return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600 }} />;
};

export default StatusChip;