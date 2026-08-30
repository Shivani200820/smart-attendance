import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Grid, Card, CardContent, Typography, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getClasses, createClass, updateClass, deleteClass, getDepartments } from '../../services/adminApi';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { 
      name: '', 
      year: '', 
      division: '', 
      department_id: '', 
      academic_year: '', 
      semester: '' 
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, dData] = await Promise.all([getClasses(), getDepartments()]);
      setClasses(cData);
      setDepartments(dData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (selectedItem) {
        await updateClass(selectedItem.id, data);
      } else {
        await createClass(data);
      }
      setOpenForm(false);
      reset();
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail?.[0]?.msg || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };
const handleDelete = async () => {
  setFormLoading(true);
  try {
    await deleteClass(selectedItem.id);
    setOpenConfirm(false);
    setSelectedItem(null);
    fetchData();
  } catch (err) {
    console.error('Delete error:', err);
    
    // Show specific error message
    let errorMessage = 'Failed to delete class';
    
    if (err.response) {
      // Backend returned an error
      if (err.response.status === 404) {
        errorMessage = 'Class not found';
      } else if (err.response.status === 409) {
        errorMessage = 'Cannot delete: Class has associated data (students, timetable, etc.)';
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = 'Backend server is not running';
    }
    
    alert(errorMessage);
  } finally {
    setFormLoading(false);
  }
};

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.year.toString().includes(searchTerm.toLowerCase()) ||
    c.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'name', label: 'Class Name', field: 'name' },
    { id: 'year', label: 'Year', field: 'year' },
    { id: 'division', label: 'Division', field: 'division' },
    { 
      id: 'dept', 
      label: 'Department', 
      render: (row) => departments.find(d => d.id === row.department_id)?.name || 'N/A' 
    },
    { id: 'academic', label: 'Academic Year', field: 'academic_year' },
    { id: 'semester', label: 'Semester', field: 'semester' },
    { 
      id: 'actions', 
      label: 'Actions', 
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" color="primary" onClick={() => { setSelectedItem(row); reset(row); setOpenForm(true); }}>Edit</IconButton>
          <IconButton size="small" color="error" onClick={() => { setSelectedItem(row); setOpenConfirm(true); }}>Delete</IconButton>
        </Box>
      )
    }
  ];

  return (
    <DashboardLayout title="Class Management">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                placeholder="Search by class name, year, or division..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                InputProps={{ startAdornment: <Search size={20} style={{ marginRight: 8, color: '#64748B' }} /> }} 
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<Plus size={18} />} 
                onClick={() => { setSelectedItem(null); reset(); setOpenForm(true); }}
              >
                Add Class
              </Button>
            </Grid>
          </Grid>
          <DataTable columns={columns} data={filteredClasses} loading={loading} emptyMessage="No classes found." />
        </CardContent>
      </Card>

      <FormDialog open={openForm} onClose={() => { setOpenForm(false); reset(); }} title={selectedItem ? 'Edit Class' : 'Add Class'} onSubmit={handleSubmit(onSubmit)} loading={formLoading}>
        <Controller name="name" control={control} rules={{ required: 'Class name is required', minLength: { value: 2, message: 'Minimum 2 characters' } }} render={({ field }) => <TextField {...field} label="Class Name" fullWidth error={!!errors.name} helperText={errors.name?.message} placeholder="e.g., SE-A, TE-B" />} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller name="year" control={control} rules={{ required: 'Year is required', min: { value: 1, message: 'Year must be 1-6' }, max: { value: 6, message: 'Year must be 1-6' } }} render={({ field }) => (
              <FormControl fullWidth error={!!errors.year}>
                <InputLabel>Year</InputLabel>
                <Select {...field} label="Year">
                  {[1, 2, 3, 4, 5, 6].map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                </Select>
              </FormControl>
            )} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller name="division" control={control} rules={{ required: 'Division is required', minLength: { value: 1, message: 'Division required' } }} render={({ field }) => <TextField {...field} label="Division" fullWidth error={!!errors.division} helperText={errors.division?.message} placeholder="A, B, C..." />} />
          </Grid>
        </Grid>

        <Controller name="department_id" control={control} rules={{ required: 'Department is required' }} render={({ field }) => (
          <FormControl fullWidth error={!!errors.department_id}>
            <InputLabel>Department</InputLabel>
            <Select {...field} label="Department">
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
        )} />

        <Controller name="academic_year" control={control} rules={{ required: 'Academic year is required', minLength: { value: 4, message: 'Invalid format' } }} render={({ field }) => <TextField {...field} label="Academic Year" fullWidth error={!!errors.academic_year} helperText={errors.academic_year?.message} placeholder="2024-2025" />} />
        
        <Controller name="semester" control={control} rules={{ required: 'Semester is required', min: { value: 1, message: 'Semester must be 1-12' }, max: { value: 12, message: 'Semester must be 1-12' } }} render={({ field }) => (
          <FormControl fullWidth error={!!errors.semester}>
            <InputLabel>Semester</InputLabel>
            <Select {...field} label="Semester">
              {Array.from({ length: 12 }, (_, i) => <MenuItem key={i + 1} value={i + 1}>Semester {i + 1}</MenuItem>)}
            </Select>
          </FormControl>
        )} />
      </FormDialog>

      <ConfirmDialog open={openConfirm} onClose={() => setOpenConfirm(false)} onConfirm={handleDelete} title="Delete Class" message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`} loading={formLoading} />
    </DashboardLayout>
  );
};

export default Classes;