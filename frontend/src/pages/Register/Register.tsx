import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainApiRequest } from '@/services/MainApiRequest';
import { useSystemContext } from '@/hooks/useSystemContext';
import './Register.scss';
import { AxiosError } from 'axios'; // Import AxiosError


interface ApiErrorResponse {
  message?: string; 

}

const Register = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useSystemContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [name, setName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [date_of_birth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    // --- Email format validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không đúng định dạng.');
      return;
    }
    // --- End of Email format validation ---

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
      const res = await MainApiRequest.post('/signup', {
        name,
        email,
        password,
        phone_number,
        date_of_birth,
        role: 'STUDENT',
      });

      if (res.status === 201) {
        navigate('/login');
      }
    } catch (err: unknown) {
      console.error('Lỗi đăng ký:', err);

      if (isAxiosError(err) && err.response) {
        const errorData = err.response.data as ApiErrorResponse;
        setError(errorData.message || 'Đăng ký thất bại');
      } else if (err instanceof Error) {
        setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
      } else {
        setError('Đã xảy ra lỗi không xác định trong quá trình đăng ký.');
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]); 

  function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
    return (error as AxiosError).isAxiosError !== undefined;
  }

  return (
    <section className="bg-register">
      <div className="container h-100">
        <div className="row justify-content-sm-center h-100">
          <div className="col-md-6">
            <div className="card1">
              <h1 className="mb-4">Đăng ký tài khoản</h1>
              {error && <div className="alert alert-danger">{error}</div>}
              <form>
                <div className="mb-3">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="name">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    id="phoneNumber"
                    value={phone_number}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="dateOfBirth">Ngày sinh</label>
                  <input
                    type="date"
                    className="form-control"
                    id="dateOfBirth"
                    value={date_of_birth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleRegister}
                >
                  Đăng ký
                </button>
              </form>
              <div className="text-center mt-3">
                <a href="/login">Bạn đã có tài khoản? Đăng nhập</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;