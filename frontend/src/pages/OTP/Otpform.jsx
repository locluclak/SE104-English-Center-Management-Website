import React, { useState } from 'react';
import './Otpform.css'; // Đảm bảo đường dẫn đúng

function OtpForm() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  // Giả lập OTP gửi qua email (thực tế sẽ gửi qua backend)
  const generatedOtp = '123456';  // OTP giả lập, thay thế bằng mã OTP thực tế

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra mã OTP
    if (otp === generatedOtp) {
      alert('OTP verified successfully!');
      // Tiến hành bước tiếp theo (chuyển sang trang mới hoặc xác nhận)
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Enter OTP</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">OTP (sent to your email)</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter OTP"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="otp-button">Verify OTP</button>
        </form>
      </div>
    </div>
  );
}

export default OtpForm;