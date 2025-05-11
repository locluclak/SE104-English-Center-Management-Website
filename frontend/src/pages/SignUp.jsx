import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEmail, setIsEmail] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Kiểm tra nếu mật khẩu và xác nhận mật khẩu trùng khớp
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Kiểm tra số điện thoại hoặc email
        const phoneRegex = /^[0-9]{10}$/; // Giả định số điện thoại là 10 chữ số
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if (phoneRegex.test(phoneNumber)) {
            setIsEmail(false);  // Đây là số điện thoại
        } else if (emailRegex.test(email)) {
            setIsEmail(true);   // Đây là email
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
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
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