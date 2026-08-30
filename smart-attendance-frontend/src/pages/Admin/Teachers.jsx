import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Grid, Card, CardContent, Typography, IconButton, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, toggleTeacherStatus, getDepartments } from '../../services/adminApi';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', employee_id: '', department_id: '', password: 'TempPass123!' }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, dData] = await Promise.all([getTeachers(), getDepartments()]);
      setTeachers(tData);
      setDepartments(dData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Single, optimized toggle function
  const handleToggleStatus = async (teacher) => {
    try {
      const newStatus = !teacher.is_active;
      
      // Call API with correct OpenAPI schema: { is_active: boolean }
      await toggleTeacherStatus(teacher.id, newStatus);
      
      // Update local state immediately for better UX (no page reload needed)
      setTeachers(prev => 
        prev.map(t => 
          t.id === teacher.id ? { ...t, is_active: newStatus } : t
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.detail || 'Failed to update teacher status');
      // Revert the switch visually if API fails
      fetchData();
    }
  };
const onSubmit = async (data) => {
  setFormLoading(true);
  try {
    console.log('Creating teacher with data:', data);
    
    if (selectedItem) {
      await updateTeacher(selectedItem.id, data);
    } else {
      await createTeacher(data);
    }
    
    setOpenForm(false);
    reset();
    setSelectedItem(null);
    fetchData();
    alert('Teacher added successfully!');
  } catch (err) {
    console.error('Error creating teacher:', err);
    console.error('Error response:', err.response);
    console.error('Error data:', err.response?.data);
    
    let errorMessage = 'Operation failed';
    
    if (err.response) {
      // Backend returned an error
      if (err.response.status === 422) {
        // Validation error
        const details = err.response.data.detail;
        if (Array.isArray(details)) {
          errorMessage = details.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else if (details) {
          errorMessage = details;
        }
      } else if (err.response.status === 409) {
        // Conflict - likely duplicate email or employee_id
        errorMessage = 'Teacher with this email or employee ID already exists';
      } else if (err.response.status === 404) {
        errorMessage = 'Department not found';
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      }
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = 'Backend server is not running';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    alert(errorMessage);
  } finally {
    setFormLoading(false);
  }
};

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteTeacher(selectedItem.id);
      setOpenConfirm(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert('Failed to delete teacher');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'emp', label: 'Employee ID', field: 'employee_id' },
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
    { 
      id: 'dept', 
      label: 'Department', 
      render: (row) => departments.find(d => d.id === row.department_id)?.name || 'N/A' 
    },
    { 
      id: 'status', 
      label: 'Status', 
      render: (row) => (
        <Switch 
          checked={row.is_active} 
          onChange={() => handleToggleStatus(row)} 
          color="primary" 
          size="small" 
        />
      )
    },
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
    <DashboardLayout title="Teacher Management">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                placeholder="Search by name or employee ID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                InputProps={{ startAdornment: <Search size={20} style={{ marginRight: 8, color: '#64748B' }} /> }} 
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<Plus size={18} />} 
                onClick={() => { setSelectedItem(null); reset({ password: 'TempPass123!' }); setOpenForm(true); }}
              >
                Add Teacher
              </Button>
            </Grid>
          </Grid>
          <DataTable columns={columns} data={filteredTeachers} loading={loading} emptyMessage="No teachers found." />
        </CardContent>
      </Card>

      <FormDialog open={openForm} onClose={() => { setOpenForm(false); reset(); }} title={selectedItem ? 'Edit Teacher' : 'Add Teacher'} onSubmit={handleSubmit(onSubmit)} loading={formLoading}>
        <Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field }) => <TextField {...field} label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} />
        <Controller name="email" control={control} rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } }} render={({ field }) => <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />} />
        <Controller name="employee_id" control={control} rules={{ required: 'Employee ID is required' }} render={({ field }) => <TextField {...field} label="Employee ID" fullWidth error={!!errors.employee_id} helperText={errors.employee_id?.message} />} />
        {!selectedItem && <Controller name="password" control={control} rules={{ required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } }} render={({ field }) => <TextField {...field} label="Password" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />} />}
        <Controller name="department_id" control={control} rules={{ required: 'Department is required' }} render={({ field }) => (
          <FormControl fullWidth error={!!errors.department_id}>
            <InputLabel>Department</InputLabel>
            <Select {...field} label="Department">
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
        )} />
      </FormDialog>

      <ConfirmDialog open={openConfirm} onClose={() => setOpenConfirm(false)} onConfirm={handleDelete} title="Delete Teacher" message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`} loading={formLoading} />
    </DashboardLayout>
  );
};

export default Teachers;