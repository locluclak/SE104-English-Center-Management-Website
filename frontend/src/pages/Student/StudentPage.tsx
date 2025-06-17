"use client";

import React, { useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentHome from "./StudentHome";
import StudentCourses from "./StudentCourses";
import StudentCourseDetail from "./StudentCourseDetail";
import StudentBoard from "./StudentBoard";
import ProfileUser from "@/pages/ProfileUser/ProfileUser";
import { useSystemContext } from "@/hooks/useSystemContext";
import "./Student.scss";

const StudentPage: React.FC = () => {
  const { token } = useSystemContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="student-page-wrapper">
      <div className="student-page-layout">
        <StudentSidebar
          currentPath={location.pathname}
          onNavigate={handleNavigation}
        />

        <div className="student-page-content">
          <Routes>
            <Route path="/home" element={<StudentHome />} />
            <Route path="/courses" element={<StudentCourses />} />
            <Route path="/courses/:courseId" element={<StudentCourseDetail />} />
            <Route path="/board/*" element={<StudentBoard />} />
            <Route path="/profile" element={<ProfileUser />} />
            
            {/* Redirect empty or unknown path */}
            <Route path="" element={<Navigate to="/student/home" replace />} />
            <Route path="*" element={<Navigate to="/student/home" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
