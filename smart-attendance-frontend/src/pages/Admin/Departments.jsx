import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Grid, Card, CardContent, Typography, IconButton, Switch } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/adminApi';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', code: '' }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
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
        await updateDepartment(selectedItem.id, data);
      } else {
        await createDepartment(data);
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
      await deleteDepartment(selectedItem.id);
      setOpenConfirm(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert('Failed to delete department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (department) => {
    try {
      // Note: OpenAPI spec shows this endpoint requires query parameter
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/departments/${department.id}/status?is_active=${!department.is_active}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update department status');
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'code', label: 'Code', field: 'code' },
    { id: 'name', label: 'Name', field: 'name' },
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
    <DashboardLayout title="Department Management">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                placeholder="Search by name or code..." 
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
                Add Department
              </Button>
            </Grid>
          </Grid>
          <DataTable columns={columns} data={filteredDepartments} loading={loading} emptyMessage="No departments found." />
        </CardContent>
      </Card>

      <FormDialog open={openForm} onClose={() => { setOpenForm(false); reset(); }} title={selectedItem ? 'Edit Department' : 'Add Department'} onSubmit={handleSubmit(onSubmit)} loading={formLoading}>
        <Controller name="name" control={control} rules={{ required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } }} render={({ field }) => <TextField {...field} label="Department Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} />
        <Controller name="code" control={control} rules={{ required: 'Code is required', minLength: { value: 2, message: 'Minimum 2 characters' } }} render={({ field }) => <TextField {...field} label="Department Code" fullWidth error={!!errors.code} helperText={errors.code?.message} placeholder="e.g., CS, IT, ME" />} />
      </FormDialog>

      <ConfirmDialog open={openConfirm} onClose={() => setOpenConfirm(false)} onConfirm={handleDelete} title="Delete Department" message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`} loading={formLoading} />
    </DashboardLayout>
  );
};

export default Departments;