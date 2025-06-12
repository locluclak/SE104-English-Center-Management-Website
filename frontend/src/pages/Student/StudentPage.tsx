"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
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
import "./Student.scss";

const StudentPage: React.FC = () => {
  const [currentStudentId, setCurrentStudentId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedStudentId = localStorage.getItem("userId");
    const storedUserRole = localStorage.getItem("userRole");

    console.log("Stored studentId from localStorage:", storedStudentId);
    console.log("Stored userRole from localStorage:", storedUserRole);

    if (storedStudentId) {
      setCurrentStudentId(storedStudentId);
    } else {
      console.warn("Student ID not found in localStorage.");
    }

    if (storedUserRole) {
      setCurrentUserRole(storedUserRole);
    } else {
      console.warn(
        "User role not found in localStorage. Defaulting to 'student'."
      );
      setCurrentUserRole("student");
    }
  }, []);

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <div className="student-page-wrapper">
      <div className="student-page-layout">
        <StudentSidebar
          currentPath={location.pathname}
          onNavigate={handleNavigation}
        />

        <div className="student-page-content">
          <Routes>
            <Route path="/home" element={<StudentHome/>}/>

            <Route path="/courses" element={<StudentCourses />} />

            <Route path="/courses/:courseId" element={<StudentCourseDetail />}/>

            <Route path="/board/*" element={ <StudentBoard studentId={currentStudentId} userRole={currentUserRole}/>}/>

            {/* ✅ THÊM PROFILE */}
            <Route path="/profile" element={<ProfileUser />} />

            {/* Redirect empty path to home */}
            <Route path="" element={<Navigate to="/student" replace />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
