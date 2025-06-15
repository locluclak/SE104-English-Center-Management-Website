import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.scss';
import { comparePathname } from '@/utils/uri';
import AvtImg from '@/assets/profile.jpg';
import { MainApiRequest } from '@/services/MainApiRequest';

type Route = {
  title: string;
  link: string;
  icon: string;
  roles: string[];
  children?: Route[];
};

type SubRoutesState = { [key: string]: boolean };

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [userName, setUserName] = useState<string>("User Name");
  const [userRole, setUserRole] = useState<string>("User Role");
  const [openSubRoutes, setOpenSubRoutes] = useState<SubRoutesState>({});

  const roleRoutes: Record<string, Route[]> = {
    ADMIN: [
      { title: 'COURSES', link: '/admin/courses', icon: 'fas fa-book', roles: ['ADMIN'] },
      { title: 'STUDENTS', link: '/admin/students', icon: 'fas fa-user-graduate', roles: ['ADMIN'] },
      { title: 'TEACHERS', link: '/admin/teachers', icon: 'fas fa-chalkboard-teacher', roles: ['ADMIN'] },
      { title: 'ACCOUNTANTS', link: '/admin/accountants', icon: 'fas fa-money-bill', roles: ['ADMIN'] },
    ],
    ACCOUNTANT: [
      { title: 'DASHBOARD', link: '/accountant/dashboard', icon: 'fas fa-tachometer-alt', roles: ['ACCOUNTANT'] },
      { title: 'STUDENT FEES', link: '/accountant/studentfees', icon: 'fas fa-file-invoice-dollar', roles: ['ACCOUNTANT'] },
      { title: 'REPORTS', link: '/accountant/reports', icon: 'fas fa-chart-line', roles: ['ACCOUNTANT'] },
    ],
  };

  useEffect(() => {
    const fetchAndSetSidebarData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64);
        const decodedToken = JSON.parse(payloadJson);

        const storedEmail = decodedToken.email;
        const storedRole = decodedToken.role;

        setRole(storedRole);

        setUserRole(storedRole || "Unknown");

        if (storedRole && roleRoutes[storedRole]) {
          setRoutes(roleRoutes[storedRole]);
        } else {
          setRoutes([]); 
        }

        const res = await MainApiRequest.get(`/person?email=${storedEmail}`);
        const data = res.data;
        setUserName(data.NAME || "Họ và tên");

      } catch (error) {
        console.error("Error fetching user info or setting sidebar data:", error);
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchAndSetSidebarData();

    setCurrentPath(location.pathname);

  }, [location.pathname, navigate]); // Depend on location.pathname to update active state, and navigate for potential redirects

  const toggleSubRoutes = (path: string) => {
    setOpenSubRoutes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    if (role) {
      navigate(`/${role.toLowerCase()}/profile`);
    } else {
      navigate('/login'); 
    }
  };

  const renderNavigationList = () => {
    return routes.map((route, index) => {
      if (!role || !route.roles.includes(role)) return null;

      const hasChildren = Array.isArray(route.children) && route.children.length > 0;
      const isActive = comparePathname(route.link, currentPath);
      const isOpen = openSubRoutes[route.link];

      return (
        <li key={index} className={`nav-item ${hasChildren ? 'dropdown' : ''}`}>
          <Link
            to={hasChildren ? '#' : route.link}
            className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={
              hasChildren
                ? e => {
                    e.preventDefault();
                    toggleSubRoutes(route.link);
                  }
                : undefined
            }
          >
            <span className="icon">
              <i className={route.icon}></i>
            </span>
            <span className={`title ${isActive ? 'title-active' : ''}`}>{route.title}</span>
            {hasChildren && (
              <span className={`arrow ${isOpen ? 'up' : 'down'}`}>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
              </span>
            )}
          </Link>

          {hasChildren && isOpen && (
            <ul className="nav-children nav nav-pills">
              {route.children?.map((subRoute, subIndex) => {
                if (!subRoute.roles.includes(role)) return null;
                const fullLink = `${route.link}${subRoute.link.startsWith('/') ? subRoute.link : '/' + subRoute.link}`; // Ensure correct path construction
                const active = comparePathname(fullLink, currentPath);

                return (
                  <li key={subIndex} className="nav-item">
                    <Link to={fullLink} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
                      <span className="icon">
                        <i className={subRoute.icon}></i>
                      </span>
                      <span className={`title ${active ? 'title-active' : ''}`}>{subRoute.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });
  };

  const getPortalTitle = () => {
    if (role === 'ADMIN') {
      return 'ADMIN';
    } else if (role === 'ACCOUNTANT') {
      return 'ACCOUNTANT';
    }
    return 'PORTAL';
  };

  const getPortalIcon = () => {
    if (role === 'ADMIN') {
      return <i className="fas fa-user-shield logo-icon"></i>;
    } else if (role === 'ACCOUNTANT') {
      return <i className="fas fa-calculator logo-icon"></i>;
    }
    return <i className="fas fa-home logo-icon"></i>;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          {getPortalIcon()}
          <span className="logo-text">{getPortalTitle()}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="side side-pills">
          {renderNavigationList()}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-profile" onClick={handleProfileClick}>
          <img src={AvtImg} alt="User Avatar" className="profile-avatar" />
          <div className="profile-info">
            <div className="profile-name">{userName}</div> {/* Displays the fetched name */}
            <div className="profile-role">{userRole}</div> {/* Displays the user role */}
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-sign-out"></i>
          <span className="logout-text">LOG OUT</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;