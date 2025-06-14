import { useNavigate, Outlet } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <h1 className="mb-4">WELCOME TO HALO CENTER</h1>
      <div className="d-flex gap-3">
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
            LOG IN
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/register')}>
            REGISTER
        </button>
      </div>
      <div className="mt-4 w-100">
        <Outlet />
      </div>
    </div>
  )
}

export default Home
