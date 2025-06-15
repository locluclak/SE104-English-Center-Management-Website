import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { MainApiRequest } from '@/services/MainApiRequest';
import { useSystemContext } from '@/hooks/useSystemContext';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { setToken } = useSystemContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await MainApiRequest.post('/login', { email, password });

      if (res.status === 200) {
        const { token, role, userId } = res.data;

        // Log token and role to check if they are received correctly
        console.log('Received token:', token);
        console.log('Received role:', role);

        // Set token and role in context and localStorage
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', userId);

        // Log the token saved in localStorage
        console.log('Token saved in localStorage:', localStorage.getItem('token'));

        // Optionally, navigate to home or other page after login
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="bg-login">
      <motion.div
        className="card1"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Đăng nhập</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="needs-validation">
          <div className="my-3">
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="me-2" /> Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              <FaLock className="me-2" /> Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary w-100" onClick={handleLogin}>
            Login
          </button>
        </form>
        <div className="text-center mt-3">
          <button type="button" className="btn btn-link" onClick={handleGoToRegister}>
            Have not an account? Register now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
