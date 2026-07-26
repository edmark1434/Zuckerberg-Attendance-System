import './App.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage.tsx'
import LoginPage from './LoginPage.tsx' 
import StudentDashboard from './StudentDashboard.tsx'
import TeacherDashboard from './TeacherDashboard.tsx'
import TeacherLogin from './TeacherLogin.tsx'
import AdminDashboard from './AdminDashboard.tsx'

// Student components
import {
  DashboardHomePage,
  ProfilePage,
} from "@/components/student-section.tsx"

// Teacher components
import {
  AttendanceManagementPage,
  QRScannerPage,
  StudentListPage,
  TeacherHomePage,
} from "@/components/teacher-section.tsx"

// Admin components
import {
  AdminHomePage,
  StudentAccountsPage,
  TeacherAccountsPage,
  ClassesPage,
  AssignTeachersPage,
  ResetPasswordsPage,
  AcademicYearsPage,
  AttendanceReportsPage,
} from "@/components/admin-section.tsx"

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      
      {/* Student Routes */}
      <Route element={<StudentDashboard />}>
        <Route path="/student/dashboard" element={<DashboardHomePage />} />
        <Route path="/student/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Teacher Routes */}
      <Route element={<TeacherDashboard />}>
        <Route path="/teacher/dashboard" element={<TeacherHomePage />} />
        <Route path="/teacher/attendance" element={<AttendanceManagementPage />} />
        <Route path="/teacher/attendance/scanner" element={<QRScannerPage />} />
        <Route path="/teacher/students" element={<StudentListPage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route element={<AdminDashboard />}>
        <Route path="/admin/dashboard" element={<AdminHomePage />} />
        <Route path="/admin/students" element={<StudentAccountsPage />} />
        <Route path="/admin/teachers" element={<TeacherAccountsPage />} />
        <Route path="/admin/classes" element={<ClassesPage />} />
        <Route path="/admin/assign-teachers" element={<AssignTeachersPage />} />
        <Route path="/admin/reset-passwords" element={<ResetPasswordsPage />} />
        <Route path="/admin/academic-years" element={<AcademicYearsPage />} />
        <Route path="/admin/attendance-reports" element={<AttendanceReportsPage />} />
      </Route>
    </Routes>
  )
}

export default App