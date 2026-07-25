import './App.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage.tsx'
import LoginPage from './LoginPage.tsx' 
import StudentDashboard from './StudentDashboard.tsx'
import TeacherDashboard from './TeacherDashboard.tsx'
import TeacherLogin from './TeacherLogin.tsx'
import {
  DashboardHomePage,
  ProfilePage,
} from "@/components/student-section.tsx";
import { AttendanceManagementPage, QRScannerPage, StudentListPage, TeacherHomePage } from "@/components/teacher-section.tsx";
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<StudentDashboard />}>
          <Route path="/student/dashboard" element={<DashboardHomePage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<TeacherDashboard />}>
          <Route path="/teacher/dashboard" element={<TeacherHomePage />} />
          <Route path="/teacher/attendance" element={<AttendanceManagementPage />} />
          <Route path="/teacher/attendance/scanner" element={<QRScannerPage />} />
          <Route path="/teacher/students" element={<StudentListPage />} />
        </Route>
        <Route path="/teacher/login" element={<TeacherLogin />} />
      </Routes>
    </>
  )
}

export default App
