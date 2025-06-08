import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Forgotpassword.css'; // Đảm bảo đường dẫn đúng

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của email (có thể sử dụng regex để kiểm tra)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailRegex.test(email)) {
      // Gửi OTP qua email (Giả lập)
      alert("OTP has been sent to your email");

      // Chuyển đến trang nhập OTP
      navigate('/forgot-password/otp');
    } else {
      setError('Please enter a valid email.');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="otp-button">Send OTP</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;