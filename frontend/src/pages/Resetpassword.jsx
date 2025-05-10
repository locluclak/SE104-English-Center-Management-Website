import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      // Thực hiện thay đổi mật khẩu (gửi qua backend)
      alert('Password has been successfully reset!');
      // Chuyển đến trang đăng nhập sau khi thay đổi mật khẩu thành công
      navigate('/login');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="reset-password-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;