import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainApiRequest } from '@/services/MainApiRequest'
import { useSystemContext } from '@/hooks/useSystemContext'

const Register = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useSystemContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone_number, setPhoneNumber] = useState('')
  const [date_of_birth, setDateOfBirth] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async () => {
    try {
      const res = await MainApiRequest.post('/signup', {
        name,
        email,
        password,
        phone_number,
        date_of_birth,
        role: 'STUDENT',
      })

      if (res.status === 201) {
        navigate('/login')
      }
    } catch (err: any) {
      console.error('Register error:', err)
      setError(err?.response?.data?.message || 'Đăng ký thất bại')
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn])

  return (
    <section className="h-100 bg-login">
      <div className="container h-100">
        <div className="row justify-content-sm-center h-100">
          <div className="col-md-6">
            <div className="card shadow-lg p-4">
              <h1 className="mb-4">Đăng ký tài khoản</h1>
              {error && <div className="alert alert-danger">{error}</div>}
              <form>
                <div className="mb-3">
                  <label>Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Mật khẩu</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Họ tên</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Số điện thoại</label>
                  <input type="text" className="form-control" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Ngày sinh</label>
                  <input type="date" className="form-control" value={date_of_birth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
                <button type="button" className="btn btn-primary w-100" onClick={handleRegister}>
                  Đăng ký
                </button>
              </form>
              <div className="text-center mt-3">
                <a href="/login">Đã có tài khoản? Đăng nhập</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Register
