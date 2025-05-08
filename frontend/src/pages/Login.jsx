import React from 'react';
import './Login.css';

function Login({ goBack }) {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to English Center</h2>
        <form>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <button onClick={goBack} className="back-button">Back to Home</button>
      </div>
    </div>
  );
}

export default Login;