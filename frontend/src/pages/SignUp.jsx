import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Thêm useNavigate từ react-router-dom
import './SignUp.css'; // Đảm bảo đường dẫn đúng

function SignUp() {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Simple check to distinguish email or phone number
    const phoneRegex = /^[0-9]{10}$/; // Assuming phone number is 10 digits long
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (phoneRegex.test(emailOrPhone)) {
      setIsEmail(false);
    } else if (emailRegex.test(emailOrPhone)) {
      setIsEmail(true);
    } else {
      alert("Please enter a valid email or phone number.");
      return;
    }

    // Giả lập đăng ký thành công (thực tế sẽ gửi dữ liệu lên server)
    alert("Sign up successful!");

    // Sau khi đăng ký thành công, điều hướng đến trang OTP
    navigate('/otp');  // Chuyển hướng đến trang OTP
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up for English Center</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              type="date"
              id="birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailOrPhone">Email Address / Phone Number</label>
            <input
              type="text"
              id="emailOrPhone"
              placeholder="Enter your email or phone number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="signup-button">Create an account</button>
        </form>
        <p>Already a member? <a href="/login">Log in</a></p>
      </div>
    </div>
  );
}

export default SignUp;