import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // THÊM Navigate ở đây
import Login from './pages/Login';  // Đảm bảo đường dẫn đúng
import SignUp from './pages/SignUp'; // Đảm bảo đường dẫn đúng
import OtpForm from './pages/Otpform'; // Thêm đường dẫn OTP
import ForgotPassword from './pages/Forgotpassword'; // Đường dẫn Forgot Password
import ResetPassword from './pages/Resetpassword'; // Đường dẫn Reset Password

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />  {/* CHUYỂN HƯỚNG MẶC ĐỊNH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/reset" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;