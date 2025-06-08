import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import OtpForm from './pages/OTP/Otpform';
import ForgotPassword from './pages/Password/Forgotpassword';
import ResetPassword from './pages/Password/Resetpassword';
import StudentPage from './pages/Student/Student';
import AdminPage from './pages/Admin/Admin';
import TeacherPage from './pages/Teacher/Teacher';
import AccountantPage from './pages/Accountant/Accountant';
import RoleProtectedRoute from './routes/PrivateRoutes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
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
        <Route
          path="/accountant"
          element={
            <RoleProtectedRoute allowedRoles={['ACCOUNTANT']}>
              <AccountantPage />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
