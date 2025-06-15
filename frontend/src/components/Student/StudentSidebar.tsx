import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  FileText,
  LogOut,
} from "../Ui/Icons/icons";
import "./StudentSidebar.scss";
import AvtImg from "@/assets/profile.jpg";

interface StudentRoute {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  roles: string[];
  children?: StudentRoute[];
}

interface StudentSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const studentRoutes: StudentRoute[] = [
  { title: "HOME", url: "/student/home", icon: Home, roles: ["ROLE_STUDENT"] },
  { title: "COURSES", url: "/student/courses", icon: BookOpen, roles: ["ROLE_STUDENT"] },
  {
    title: "BOARD",
    url: "/student/board",
    icon: FileText,
    roles: ["ROLE_STUDENT"],
    children: [
      {
        title: "Calendar",
        url: "/student/board/calendar",
        icon: Calendar,
        roles: ["ROLE_STUDENT"],
      },
      {
        title: "Padlet Attachment",
        url: "/student/board/padlet",
        icon: FileText,
        roles: ["ROLE_STUDENT"],
      },
    ],
  },
];

function parseJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Invalid token format', err);
    return null;
  }
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ currentPath, onNavigate }) => {
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      const user = parseJwtPayload(token);
      if (user) {
        setUserName(user.name || "Unknown");
        setUserRole(user.role || "Unknown");
      }
    }
  }, []);  

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActiveRoute = (routeUrl: string) => {
    if (routeUrl === "/student") {
      return currentPath === "/student" || currentPath === "/student/";
    }
    return currentPath.startsWith(routeUrl);
  };

  return (
    <div className="student-sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <BookOpen className="logo-icon" />
          <span className="logo-text">Student Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {studentRoutes.map((route) => {
            const isActive = isActiveRoute(route.url);
            const hasChildren = route.children && route.children.length > 0;
            const isParentActive =
              hasChildren &&
              route.children?.some((child) => isActiveRoute(child.url));

            return (
              <li key={route.title} className="nav-item">
                <Link
                  to={route.url}
                  className={`nav-link ${isActive || isParentActive ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(route.url);
                  }}
                >
                  <route.icon className="nav-icon" />
                  <span className="nav-text">{route.title}</span>
                </Link>

                {hasChildren && (isActive || isParentActive) && (
                  <ul className="nav-children">
                    {route.children?.map((subRoute) => (
                      <li key={subRoute.title} className="nav-child-item">
                        <Link
                          to={subRoute.url}
                          className={`nav-child-link ${isActiveRoute(subRoute.url) ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(subRoute.url);
                          }}
                        >
                          <subRoute.icon className="nav-child-icon" />
                          <span className="nav-child-text">{subRoute.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-profile" onClick={() => onNavigate("/student/profile")}>
          <img src={AvtImg} alt="Avatar" className="profile-avatar" />
          <div className="profile-info">
            <div className="profile-name">{userName}</div>
            <div className="profile-role">{userRole}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut className="logout-icon" />
          <span className="logout-text">LOG OUT</span>
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
