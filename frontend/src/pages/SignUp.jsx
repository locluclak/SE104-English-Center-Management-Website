import React from 'react';
import './SignUp.css';

function SignUp({ goBack }) {
  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up for English Center</h2>
        <form>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <button onClick={goBack} className="back-button">Back to Home</button>
      </div>
    </div>
  );
}

export default SignUp;