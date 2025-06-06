import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { login } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      let role = "";
      if (data.staff && data.staff.staff_type) {
        role = data.staff.staff_type.toUpperCase();
      } else if (data.role) {
        role = data.role.toUpperCase();
      } else {
        throw new Error("Missing role in response");
      }

      localStorage.setItem("role", role);
      localStorage.setItem("token", data.token);

      if (data.userId) { 
        localStorage.setItem("userId", data.userId); 
        console.log('User ID saved to localStorage:', data.userId);
      } else {
        console.warn("User ID not found in login response.");
    }

    console.log('Role saved to localStorage:', role);  // <-- Check đây

    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'TEACHER') {
      navigate('/teacher');
    } else if (role === 'ACCOUNTANT') {
      navigate('/accountant');
    } else if (role === 'STUDENT') {
      navigate('/student');
    } else {
      navigate('/login'); // fallback
    }
  } catch (err) {
    setError(err.message || 'Login failed');
  }
};

  return (
    <div className="login-container">
      <div className="login-image"></div>
      <div className="login-form">
        <div className="login-box">
          <h2>Login to English Center</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button type="submit" className="login-button">Log In</button>
          </form>
          <p className="login-link">Don't have an account? <a href="/signup">Sign up</a></p>
          <p className="login-link"><a href="/forgot-password">Forgot password?</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;