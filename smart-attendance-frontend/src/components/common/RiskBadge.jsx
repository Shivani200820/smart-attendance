import React from 'react';
import { Chip } from '@mui/material';

const riskConfig = {
  SAFE: { color: 'success', label: 'Safe' },
  NORMAL: { color: 'primary', label: 'Normal' },
  WARNING: { color: 'warning', label: 'Warning' },
  CRITICAL: { color: 'error', label: 'Critical' },
};

const RiskBadge = ({ level }) => {
  const config = riskConfig[level?.toUpperCase()] || riskConfig.NORMAL;
  return <Chip label={config.label} color={config.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
};

export default RiskBadge;