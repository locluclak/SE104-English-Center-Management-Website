import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';
import { comparePathname } from '@/utils/uri';

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
  const [role, setRole] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [openSubRoutes, setOpenSubRoutes] = useState<SubRoutesState>({});

  useEffect(() => {
    let storedRole = localStorage.getItem('role');

    if (!storedRole) {
      storedRole = 'ROLE_ACCOUNTANT'; 
      localStorage.setItem('role', storedRole);
    }

    setRole(storedRole);
    setCurrentPath(location.pathname);

    const roleRoutes: Record<string, Route[]> = {
      ROLE_ADMIN: [
        { title: 'COURSES', link: '/admin/courses', icon: 'fas fa-book', roles: ['ROLE_ADMIN'] },
        { title: 'STUDENTS', link: '/admin/students', icon: 'fas fa-user-graduate', roles: ['ROLE_ADMIN'] },
        { title: 'TEACHERS', link: '/admin/teachers', icon: 'fas fa-chalkboard-teacher', roles: ['ROLE_ADMIN'] },
        { title: 'ACCOUNTANTS', link: '/admin/accountants', icon: 'fas fa-money-bill', roles: ['ROLE_ADMIN'] },
      ],
      ROLE_ACCOUNTANT: [
        { title: 'DASHBOARD', link: '/accountant/dashboard', icon: 'fas fa-tachometer-alt', roles: ['ROLE_ACCOUNTANT'] },
        { title: 'STUDENT FEES', link: '/accountant/studentfees', icon: 'fas fa-file-invoice-dollar', roles: ['ROLE_ACCOUNTANT'] },
        { title: 'REPORTS', link: '/accountant/reports', icon: 'fas fa-chart-line', roles: ['ROLE_ACCOUNTANT'] },
      ],

      ROLE_TEACHER: [
        { title: 'DASHBOARD', link: '/teacher/dashboard', icon: 'fas fa-tachometer-alt', roles: ['ROLE_TEACHER'] },
        { title: 'STUDENTS', link: '/teacher/students', icon: 'fas fa-user-graduate', roles: ['ROLE_TEACHER'] },
        { title: 'REPORT', link: '/teacher/reports', icon: 'fas fa-chart-line', roles: ['ROLE_TEACHER'] },
      ],
      ROLE_STUDENT: [
        { title: 'COURSES', link: '/student/courses', icon: 'fas fa-book', roles: ['ROLE_STUDENT'] },
        { title: 'STUDY', link: '/student/study', icon: 'fas fa-book', roles: ['ROLE_STUDENT'] },
      ],
    };

    if (storedRole && roleRoutes[storedRole]) {
      setRoutes(roleRoutes[storedRole]);
    }
  }, [location]);

  const toggleSubRoutes = (path: string) => {
    setOpenSubRoutes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
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
                const fullLink = `${route.link}/${subRoute.link}`;
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

  return (
    <div className="sidebar">
      <ul className="side side-pills">
        <h1 className="logo">
          {/* Logo SVG như cũ */}
          <svg width="90" height="50" viewBox="0 0 100 61" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* ... giữ nguyên phần logo ... */}
          </svg>
        </h1>
        {renderNavigationList()}
        <button className="logout-box" onClick={handleLogout}>
          <i className="fa-solid fa-sign-out"></i> LOG OUT
        </button>
      </ul>
    </div>
  );
};

export default Sidebar;
