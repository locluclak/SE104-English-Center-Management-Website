"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom"
import TeacherSidebar from "../../components/Teacher/TeacherSidebar"
import TeacherHome from "./TeacherHome"
import TeacherCourses from "./TeacherCourses"
import TeacherCourseDetail from "./TeacherCourseDetail"
import TeacherBoard from "./TeacherBoard"
import ProfileUser from "@/pages/ProfileUser/ProfileUser"
import "./Teacher.scss"

const TeacherPage: React.FC = () => {
  const [currentTeacherId, setCurrentTeacherId] = useState<string>("")
  const [currentTeacherIdIsSet, setCurrentTeacherIdIsSet] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("userId")
    const storedUserRole = localStorage.getItem("userRole")

    console.log("TeacherPage retrieved userId from localStorage:", storedTeacherId)
    console.log("TeacherPage retrieved userRole from localStorage:", storedUserRole)

    if (storedTeacherId) {
      setCurrentTeacherId(storedTeacherId)
      console.log("TeacherPage retrieved userId from localStorage:", storedTeacherId)
    } else {
      console.warn("Teacher ID not found in localStorage. Setting to empty string.")
      setCurrentTeacherId("")
    }
    setCurrentTeacherIdIsSet(true);

    if (storedUserRole) {
      setCurrentUserRole(storedUserRole)
    } else {
      console.warn("User role not found in localStorage. Defaulting to 'teacher'.")
      setCurrentUserRole("TEACHER")
    }

  }, [])

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate],
  )

  if (!currentTeacherIdIsSet) {
    return (
      <div className="teacher-page-loading">
        <p>Loading teacher portal...</p>
      </div>
    )
  }

  if (currentTeacherId === "") {
    return (
      <div className="teacher-page-error">
        <p>User not logged in or teacher ID missing. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="teacher-page-wrapper">
      <div className="teacher-page-layout">
        <TeacherSidebar currentPath={location.pathname} onNavigate={handleNavigation} />

        <div className="teacher-page-content">
          <Routes>
            <Route path="/home" element={<TeacherHome teacherId={currentTeacherId} userRole={currentUserRole || "TEACHER"} />} />

            <Route
              path="/courses"
              element={<TeacherCourses teacherId={currentTeacherId} userRole={currentUserRole || "TEACHER"} />}
            />
            <Route path="/courses/:courseId" element={<TeacherCourseDetail />} />

            <Route path="/board/*" element={<TeacherBoard teacherId={currentTeacherId} userRole={currentUserRole || "TEACHER"} />} />

            <Route path="/profile" element={<ProfileUser />} />

            <Route path="" element={<Navigate to="/teacher/home" replace />} />
            <Route path="*" element={<Navigate to="/teacher/home" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default TeacherPage;