// import { LoadingOverlay } from 'react-loading-overlay';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSystemContext } from '@/hooks/useSystemContext';
import { FaPhoneAlt, FaLock } from 'react-icons/fa';
import { MainApiRequest } from '@/services/MainApiRequest';
import './Login.scss';

const Login = () => {
    const navigate = useNavigate();
    const context = useSystemContext();
    const { isLoggedIn, setToken } = context;


    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [remember, setRemember] = React.useState(false);

    const handleRememberOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRemember(e.target.checked);
    }

    const handleLogin = async () => {
        try {
            const res = await MainApiRequest.post('/auth/signin', { phone, password });

            if (res.status === 200) {
                const data = res.data;
                setToken(data.token); // Lưu token vào context

                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);

                // Điều hướng đến trang dashboard sau khi đăng nhập thành công
                navigate('/order/choose-table');
            }
        } catch (error) {
            console.error('Đăng nhập thất bại:', error);
        }
    }

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/order/choose-table');
        }
    }, [isLoggedIn]);

    return (
        <div className="bg-login">
            <motion.div
                className="card1"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Đăng nhập</h1>
                <form method="POST" className="needs-validation">
                    <div className="my-3">
                        <label htmlFor="phone" className="form-label">
                            <FaPhoneAlt className="mx-3 me-2 my-2" /> Số điện thoại
                        </label>
                        <input
                            type="phone"
                            id="phone"
                            className="form-control"
                            name="phone"
                            value={phone}
                            placeholder="Nhập số điện thoại"
                            required
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <div className="invalid-feedback">Số điện thoại không hợp lệ</div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">
                            <FaLock className="mx-3 me-2 mb-2" /> Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            name="password"
                            value={password}
                            placeholder="Nhập mật khẩu"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="invalid-feedback">Mật khẩu không hợp lệ</div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <input type="checkbox" id="remember" className="form-check-input" onChange={handleRememberOnChange} />
                            <label htmlFor="remember" className="form-check-label ms-2 mt-1">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>
                        <a href="/forgot-password" className="text-muted">
                            Quên mật khẩu?
                        </a>
                    </div>
                    <button 
                        type="button" 
                        className="btn btn-primary w-100"
                        onClick={handleLogin}
                    >
                        Đăng nhập
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;