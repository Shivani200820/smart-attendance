import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Grid, Card, CardContent, Typography, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, 
  Select, MenuItem, CircularProgress, Menu, ListItemIcon, ListItemText 
} from '@mui/material';
import { Search, Plus, MoreVertical, Eye } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import { getStudents, createStudent, getDepartments, getClasses } from '../../services/adminApi';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [openForm, setOpenForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuStudentId, setMenuStudentId] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { 
      name: '', 
      email: '', 
      password: 'TempPass123!',
      enrollment_number: '', 
      roll_number: '',
      department_id: '',
      class_id: '',
      year: '',
      division: '',
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
      const [sData, dData, cData] = await Promise.all([
        getStudents(),
        getDepartments(),
        getClasses()
      ]);
      setStudents(sData);
      setDepartments(dData);
      setClasses(cData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

const onSubmit = async (data) => {
  setFormLoading(true);
  try {
    console.log('Creating student with data:', data);
    
    const response = await createStudent(data);
    console.log('Student created successfully:', response);
    
    alert('Student added successfully!');
    setOpenForm(false);
    reset();
    fetchData();
  } catch (err) {
    console.error('Error creating student:', err);
    console.error('Error response:', err.response);
    console.error('Error data:', err.response?.data);
    
    let errorMessage = 'Failed to add student';
    
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
        // Conflict - likely duplicate email or enrollment number
        errorMessage = 'Student with this email or enrollment number already exists';
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      }
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = 'Backend server is not running';
    }
    
    alert(errorMessage);
  } finally {
    setFormLoading(false);
  }
};

  // Menu Handlers
  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setMenuStudentId(student.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuStudentId(null);
  };

  const handleView = (student) => {
    handleMenuClose();
    alert(`Student Details:\n\nName: ${student.name}\nEmail: ${student.email}\nEnrollment: ${student.enrollment_number}\nRoll No: ${student.roll_number}\nClass: ${student.year} - ${student.division}\nDepartment ID: ${student.department_id}\nStatus: ${student.is_active ? 'Active' : 'Inactive'}`);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'roll', label: 'Roll No', field: 'roll_number' },
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'enrollment', label: 'Enrollment', field: 'enrollment_number' },
    { id: 'class', label: 'Class', render: (row) => `${row.year} - ${row.division}` },
    { id: 'email', label: 'Email', field: 'email' },
    { 
      id: 'status', 
      label: 'Status', 
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.is_active ? '#16A34A' : '#DC2626' }} />
          <Typography variant="body2" sx={{ color: row.is_active ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Typography>
        </Box>
      )
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      render: (row) => (
        <IconButton 
          size="small" 
          onClick={(e) => handleMenuOpen(e, row)}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertical size={18} />
        </IconButton>
      )
    }
  ];

  return (
    <DashboardLayout title="Student Management">
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name, enrollment, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search size={20} style={{ marginRight: 8, color: '#64748B' }} />
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button 
                variant="contained" 
                startIcon={<Plus size={18} />} 
                onClick={() => {
                  reset({ password: 'TempPass123!' });
                  setOpenForm(true);
                }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Add Student
              </Button>
            </Grid>
          </Grid>

          <DataTable 
            columns={columns} 
            data={filteredStudents} 
            loading={loading} 
            emptyMessage="No students found matching your search."
          />
        </CardContent>
      </Card>

      {/* Action Menu Dropdown - Only View Option */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}
      >
        <MenuItem onClick={() => {
          const student = students.find(s => s.id === menuStudentId);
          if (student) handleView(student);
        }}>
          <ListItemIcon><Eye size={18} /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Student Dialog - Add Only Mode */}
      <Dialog 
        open={openForm} 
        onClose={() => {
          setOpenForm(false);
          reset({ password: 'TempPass123!' });
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add New Student
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Controller 
                  name="name" 
                  control={control} 
                  rules={{ required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Full Name" 
                      fullWidth 
                      error={!!errors.name} 
                      helperText={errors.name?.message} 
                    />
                  )} 
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller 
                  name="email" 
                  control={control} 
                  rules={{ 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Email Address" 
                      type="email"
                      fullWidth 
                      error={!!errors.email} 
                      helperText={errors.email?.message} 
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="enrollment_number" 
                  control={control} 
                  rules={{ required: 'Enrollment number is required' }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Enrollment Number" 
                      fullWidth 
                      error={!!errors.enrollment_number} 
                      helperText={errors.enrollment_number?.message} 
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="roll_number" 
                  control={control} 
                  rules={{ required: 'Roll number is required', min: { value: 1, message: 'Must be > 0' } }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Roll Number" 
                      type="number"
                      fullWidth 
                      error={!!errors.roll_number} 
                      helperText={errors.roll_number?.message} 
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="department_id" 
                  control={control} 
                  rules={{ required: 'Department is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.department_id}>
                      <InputLabel>Department</InputLabel>
                      <Select {...field} label="Department">
                        {departments.map(dept => (
                          <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="class_id" 
                  control={control} 
                  rules={{ required: 'Class is required' }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.class_id}>
                      <InputLabel>Class</InputLabel>
                      <Select {...field} label="Class">
                        {classes.map(cls => (
                          <MenuItem key={cls.id} value={cls.id}>{cls.name} ({cls.year}-{cls.division})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller 
                  name="year" 
                  control={control} 
                  rules={{ required: 'Year is required', min: 1, max: 6 }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.year}>
                      <InputLabel>Year</InputLabel>
                      <Select {...field} label="Year">
                        {[1, 2, 3, 4, 5, 6].map(y => (
                          <MenuItem key={y} value={y}>Year {y}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller 
                  name="division" 
                  control={control} 
                  rules={{ required: 'Division is required' }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Division" 
                      fullWidth 
                      error={!!errors.division} 
                      helperText={errors.division?.message} 
                      placeholder="A, B, C..."
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller 
                  name="semester" 
                  control={control} 
                  rules={{ required: 'Semester is required', min: 1, max: 12 }} 
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.semester}>
                      <InputLabel>Semester</InputLabel>
                      <Select {...field} label="Semester">
                        {Array.from({ length: 12 }, (_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>Semester {i + 1}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="academic_year" 
                  control={control} 
                  rules={{ required: 'Academic year is required', minLength: 4 }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Academic Year" 
                      fullWidth 
                      error={!!errors.academic_year} 
                      helperText={errors.academic_year?.message} 
                      placeholder="2024-2025"
                    />
                  )} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller 
                  name="password" 
                  control={control} 
                  rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }} 
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Password" 
                      type="password"
                      fullWidth 
                      error={!!errors.password} 
                      helperText={errors.password?.message} 
                    />
                  )} 
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 2 }}>
            <Button 
              onClick={() => {
                setOpenForm(false);
                reset({ password: 'TempPass123!' });
              }} 
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formLoading}
              sx={{ minWidth: 100 }}
            >
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Student'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardLayout>
  );
};

export default Students;