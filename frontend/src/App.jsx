import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/Forgotpassword';
import ResetPassword from './pages/Resetpassword';
import StudentPage from './pages/Student'; // Đảm bảo đường dẫn chính xác
import AdminPage from './pages/Admin';
import TeacherPage from './pages/Teacher';
import AccountantPage from './pages/Accountant'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/reset" element={<ResetPassword />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/accountant" element={<AccountantPage />} />
      </Routes>
    </Router>
  );
}

export default App;