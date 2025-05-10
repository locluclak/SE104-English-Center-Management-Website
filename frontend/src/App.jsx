import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';  // Đảm bảo đường dẫn đúng
import SignUp from './pages/SignUp'; // Đảm bảo đường dẫn đúng
import OtpForm from './pages/Otpform'; // Thêm đường dẫn OTP
import ForgotPassword from './pages/Forgotpassword'; // Đường dẫn Forgot Password
import ResetPassword from './pages/Resetpassword'; // Đường dẫn Reset Password

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpForm />} />  {/* Thêm Route cho OTP */}
        <Route path="/forgot-password" element={<ForgotPassword />} />  {/* Forgot Password */}
        <Route path="/forgot-password/otp" element={<OtpForm />} /> {/* Nhập OTP */}
        <Route path="/forgot-password/reset" element={<ResetPassword />} /> {/* Reset mật khẩu */}
      </Routes>
    </Router>
  );
}

export default App;