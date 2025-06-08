"use client";

import type React from "react";
import { Link } from "react-router-dom";
import { Home, BookOpen, Calendar, FileText, LogOut } from "../Ui/Icons/icons";
import "./StudentSidebar.scss";

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
  { title: "BOARD", url: "/student/board", icon: FileText, roles: ["ROLE_STUDENT"],
    children: [
        {title: "Calendar", url: "/student/board/calendar",icon: Calendar, roles: ["ROLE_STUDENT"],},
        { title: "Padlet Attachment", url: "/student/board/padlet", icon: FileText, roles: ["ROLE_STUDENT"] }
    ],},
];

const StudentSidebar: React.FC<StudentSidebarProps> = ({
  currentPath,
  onNavigate,
}) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActiveRoute = (routeUrl: string) => {
    // Special case for home route
    if (routeUrl === "/student") {
      return currentPath === "/student" || currentPath === "/student/";
    }
    return currentPath.startsWith(routeUrl);
  };

  // Log current path for debugging
  console.log("Current path:", currentPath);

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

            // Log active state for debugging
            console.log(
              `Route ${route.title}: isActive=${isActive}, isParentActive=${isParentActive}`
            );

            return (
              <li key={route.title} className="nav-item">
                <Link
                  to={route.url}
                  className={`nav-link ${
                    isActive || isParentActive ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(route.url);
                  }}
                >
                  <route.icon className="nav-icon" />
                  <span className="nav-text">{route.title}</span>
                </Link>

                {hasChildren &&
                  (isActive || isParentActive) &&
                  route.children && (
                    <ul className="nav-children">
                      {route.children.map((subRoute) => (
                        <li key={subRoute.title} className="nav-child-item">
                          <Link
                            to={subRoute.url}
                            className={`nav-child-link ${
                              isActiveRoute(subRoute.url) ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(subRoute.url);
                            }}
                          >
                            <subRoute.icon className="nav-child-icon" />
                            <span className="nav-child-text">
                              {subRoute.title}
                            </span>
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
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut className="logout-icon" />
          <span className="logout-text">LOG OUT</span>
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
