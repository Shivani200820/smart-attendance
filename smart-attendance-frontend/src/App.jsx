import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public & Auth
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import NotFound from './pages/Errors/NotFound';

// Admin
import AdminDashboard from './pages/Admin/AdminDashboard';
import Students from './pages/Admin/Students';
import Teachers from './pages/Admin/Teachers';
import LowAttendance from './pages/Admin/LowAttendance';
import Reports from './pages/Admin/Reports';
import Departments from './pages/Admin/Departments';
import Classes from './pages/Admin/Classes';
import Subjects from './pages/Admin/Subjects';
import Analytics from './pages/Admin/Analytics';
import Timetable from './pages/Admin/Timetable';
import ClassSubjectAssignments from './pages/Admin/ClassSubjectAssignments';


// Teacher
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import TeacherAttendance from './pages/Teacher/TeacherAttendance';
import LiveAttendanceSession from './pages/Teacher/LiveAttendanceSession';
import TeacherLowAttendance from './pages/Teacher/TeacherLowAttendance';
import TeacherAttendanceHistory from './pages/Teacher/TeacherAttendanceHistory';
import TeacherClasses from './pages/Teacher/TeacherClasses';

// Student
import StudentDashboard from './pages/Student/StudentDashboard';
import ScanAttendance from './pages/Student/ScanAttendance';
import AttendanceHistory from './pages/Student/AttendanceHistory';

const Forbidden = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>403 - Forbidden</h2>
    <p>You do not have permission to access this page.</p>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/teachers" element={<Teachers />} />
              <Route path="/admin/timetable" element={<Timetable />} />
              <Route path="/admin/low-attendance" element={<LowAttendance />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/departments" element={<Departments />} />
              <Route path="/admin/classes" element={<Classes />} />
              <Route path="/admin/subjects" element={<Subjects />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/class-subjects" element={<ClassSubjectAssignments />} />
            </Route>

            {/* Protected Teacher Routes */}
           <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']} />}>
  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
  <Route path="/teacher/classes" element={<TeacherClasses />} />  {/* ADD THIS */}
  <Route path="/teacher/attendance" element={<TeacherAttendance />} />
  <Route path="/teacher/attendance/:sessionId" element={<LiveAttendanceSession />} />
  <Route path="/teacher/attendance-history" element={<TeacherAttendanceHistory />} />  {/* ADD THIS */}
  <Route path="/teacher/low-attendance" element={<TeacherLowAttendance />} />  {/* ADD THIS */}
</Route>

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/scan-attendance" element={<ScanAttendance />} />
              <Route path="/student/attendance" element={<AttendanceHistory />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;