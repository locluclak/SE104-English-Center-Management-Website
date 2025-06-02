import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home'
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OtpForm from './pages/Otpform';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentPage from './pages/Student';
import AdminPage from './pages/Admin';
import TeacherPage from './pages/Teacher';
import RoleProtectedRoute from './routes/PrivateRoutes';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/reset" element={<ResetPassword />} />

        {/* Bảo vệ route theo role */}
        <Route
          path="/student"
          element={
            <RoleProtectedRoute allowedRoles={['STUDENT']}>
              <StudentPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <RoleProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherPage />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;