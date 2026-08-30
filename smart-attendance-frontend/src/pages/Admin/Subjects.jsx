import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Grid, Card, CardContent, Typography, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getSubjects, createSubject, updateSubject, deleteSubject, getDepartments } from '../../services/adminApi';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', code: '', department_id: '' }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, dData] = await Promise.all([getSubjects(), getDepartments()]);
      setSubjects(sData);
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
        await updateSubject(selectedItem.id, data);
      } else {
        await createSubject(data);
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
      await deleteSubject(selectedItem.id);
      setOpenConfirm(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert('Failed to delete subject');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'code', label: 'Code', field: 'code' },
    { id: 'name', label: 'Name', field: 'name' },
    { 
      id: 'dept', 
      label: 'Department', 
      render: (row) => departments.find(d => d.id === row.department_id)?.name || 'N/A' 
    },
    { 
      id: 'status', 
      label: 'Status', 
      render: (row) => (
        <Typography variant="body2" sx={{ color: row.is_active ? 'success.main' : 'error.main', fontWeight: 600 }}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Typography>
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
    <DashboardLayout title="Subject Management">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                placeholder="Search by subject name or code..." 
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
                Add Subject
              </Button>
            </Grid>
          </Grid>
          <DataTable columns={columns} data={filteredSubjects} loading={loading} emptyMessage="No subjects found." />
        </CardContent>
      </Card>

      <FormDialog open={openForm} onClose={() => { setOpenForm(false); reset(); }} title={selectedItem ? 'Edit Subject' : 'Add Subject'} onSubmit={handleSubmit(onSubmit)} loading={formLoading}>
        <Controller name="name" control={control} rules={{ required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } }} render={({ field }) => <TextField {...field} label="Subject Name" fullWidth error={!!errors.name} helperText={errors.name?.message} placeholder="e.g., Data Structures" />} />
        
        <Controller name="code" control={control} rules={{ required: 'Code is required', minLength: { value: 2, message: 'Minimum 2 characters' } }} render={({ field }) => <TextField {...field} label="Subject Code" fullWidth error={!!errors.code} helperText={errors.code?.message} placeholder="e.g., CS301" />} />
        
        <Controller name="department_id" control={control} rules={{ required: 'Department is required' }} render={({ field }) => (
          <FormControl fullWidth error={!!errors.department_id}>
            <InputLabel>Department</InputLabel>
            <Select {...field} label="Department">
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
        )} />
      </FormDialog>

      <ConfirmDialog open={openConfirm} onClose={() => setOpenConfirm(false)} onConfirm={handleDelete} title="Delete Subject" message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`} loading={formLoading} />
    </DashboardLayout>
  );
};

export default Subjects;