import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Students from '../pages/admin/Students';
import Teachers from '../pages/admin/Teachers';
import Departments from '../pages/admin/Departments';
import Classes from '../pages/admin/Classes';
import Subjects from '../pages/admin/Subjects';
import Timetable from '../pages/admin/Timetable';
import LowAttendanceStudents from '../pages/admin/LowAttendanceStudents';
import Reports from '../pages/admin/Reports';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import LiveAttendance from '../pages/teacher/LiveAttendance';
import TeacherAnalytics from '../pages/teacher/TeacherAnalytics';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentScanAttendance from '../pages/student/StudentScanAttendance';
import SubjectAttendance from '../pages/student/SubjectAttendance';
import AttendancePrediction from '../pages/student/AttendancePrediction';
import TeacherAttendanceHistory from '../pages/teacher/TeacherAttendanceHistory';



const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/classes" element={<Classes />} />
            <Route path="/admin/subjects" element={<Subjects />} />
            <Route path="/admin/timetable" element={<Timetable />} />
            <Route path="/admin/low-attendance" element={<LowAttendanceStudents />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/attendance/:sessionId" element={<LiveAttendance />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
            <Route path="/teacher/reports" element={<Reports />} />
            <Route path="/teacher/attendance" element={<TeacherAttendanceHistory />} />
<Route path="/teacher/attendance/:sessionId" element={<LiveAttendance />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/scan-attendance" element={<StudentScanAttendance />} />
            <Route path="/student/attendance/subjects" element={<SubjectAttendance />} />
            <Route path="/student/attendance/prediction" element={<AttendancePrediction />} />
          </Route>

        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;