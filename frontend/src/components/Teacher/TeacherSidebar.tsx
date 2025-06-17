"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, BookOpen, Calendar, FileText, LogOut } from "../Ui/Icons/icons";
import AvtImg from "@/assets/profile.jpg";
import "./TeacherSidebar.scss";
import { useSystemContext } from "@/hooks/useSystemContext";
import { MainApiRequest } from "@/services/MainApiRequest";

interface TeacherRoute {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  roles: string[];
  children?: TeacherRoute[];
}

interface TeacherSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const teacherRoutes: TeacherRoute[] = [
  {
    title: "HOME",
    url: "/teacher/home",
    icon: Home,
    roles: ["ROLE_TEACHER"],
  },
  {
    title: "MY COURSES",
    url: "/teacher/courses",
    icon: BookOpen,
    roles: ["ROLE_TEACHER"],
  },
  {
    title: "BOARD",
    url: "/teacher/board",
    icon: FileText,
    roles: ["ROLE_TEACHER"],
    children: [
      {
        title: "Calendar",
        url: "/teacher/board/calendar",
        icon: Calendar,
        roles: ["ROLE_TEACHER"],
      },
      {
        title: "Padlet Attachment",
        url: "/teacher/board/padlet",
        icon: FileText,
        roles: ["ROLE_TEACHER"],
      },
    ],
  },
];

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ currentPath, onNavigate }) => {
  const { token, logout } = useSystemContext();
  const [userName, setUserName] = useState("Teacher");
  const [userRole, setUserRole] = useState("TEACHER");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!token) return;

        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64);
        const decodedToken = JSON.parse(payloadJson);

        const email = decodedToken.email;
        const role = decodedToken.role;
        setUserRole(role || "Unknown");

        const res = await MainApiRequest.get(`/person?email=${email}`);
        const data = res.data;

        setUserName(data.NAME || "Teacher");
      } catch (err) {
        console.error("Failed to fetch teacher info", err);
      }
    };

    fetchUserInfo();
  }, [token]);

  const isActiveRoute = (routeUrl: string) => {
    if (routeUrl === "/teacher") {
      return currentPath === "/teacher" || currentPath === "/teacher/";
    }
    return currentPath.startsWith(routeUrl);
  };

  return (
    <div className="teacher-sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <BookOpen className="logo-icon" />
          <span className="logo-text">Teacher Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {teacherRoutes.map((route) => {
            const isActive = isActiveRoute(route.url);
            const hasChildren = route.children && route.children.length > 0;
            const isParentActive = hasChildren && route.children?.some((child) => isActiveRoute(child.url));

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
        <div className="sidebar-user-profile" onClick={() => onNavigate("/teacher/profile")}>
          <img src={AvtImg} alt="Avatar" className="profile-avatar" />
          <div className="profile-info">
            <div className="profile-name">{userName}</div>
            <div className="profile-role">{userRole}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          <LogOut className="logout-icon" />
          <span className="logout-text">LOG OUT</span>
        </button>
      </div>
    </div>
  );
};

export default TeacherSidebar;
