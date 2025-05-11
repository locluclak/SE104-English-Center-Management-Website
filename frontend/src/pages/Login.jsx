import React, { useState } from 'react';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Login successful!");
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
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
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