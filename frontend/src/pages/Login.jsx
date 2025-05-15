import React, { useState } from 'react';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        // Gọi API đăng nhập
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password }),
        });

        const data = await response.json();
        if (!response.ok) {
            // Nếu đăng nhập thất bại
            setError(data.error || 'Login failed. Please try again.');
        } else {
            // Nếu đăng nhập thành công, lưu token và chuyển hướng
            localStorage.setItem('token', data.token); // Lưu token vào localStorage
            alert('Login successful!');
            navigate('/courses'); // Chuyển đến trang CourseList
        }
    } catch (err) {
        console.error(err);
        setError('System error. Please try again later.');
    }
};

    return (
        <div className="login-container">
            <div className="login-image"> {/* Phần màu tím */}
                {/* Bạn có thể thêm nội dung hoặc để trống */}
            </div>
            <div className="login-form"> {/* Phần chứa form */}
                <div className="login-box">
                    <h2>Login to English Center</h2>
                    <form onSubmit={handleSubmit}>
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