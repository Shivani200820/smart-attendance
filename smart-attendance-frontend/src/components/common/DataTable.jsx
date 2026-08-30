import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, CircularProgress, Chip 
} from '@mui/material';

const DataTable = ({ columns, data, loading, error, emptyMessage = "No records found." }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'error.main', bgcolor: 'rgba(220, 38, 38, 0.04)', borderRadius: 2 }}>
        {error}
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
        {emptyMessage}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #E2E8F0', overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }} size="medium">
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {columns.map((col) => (
                <TableCell key={col.id} sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
                  {col.render ? col.render(row) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;