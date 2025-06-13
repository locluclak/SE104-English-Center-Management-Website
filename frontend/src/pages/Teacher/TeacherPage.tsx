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
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("userId")
    const storedUserRole = localStorage.getItem("userRole")

    if (storedTeacherId) {
      setCurrentTeacherId(storedTeacherId)
    } else {
      console.warn("Teacher ID not found in localStorage.")
    }

    if (storedUserRole) {
      setCurrentUserRole(storedUserRole)
    } else {
      console.warn("User role not found in localStorage. Defaulting to 'teacher'.")
      setCurrentUserRole("teacher")
    }
  }, [])

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate],
  )

  return (
    <div className="teacher-page-wrapper">
      <div className="teacher-page-layout">
        <TeacherSidebar currentPath={location.pathname} onNavigate={handleNavigation} />

        <div className="teacher-page-content">
          <Routes>
            {/* Exact path for home */}
            <Route path="/home" element={<TeacherHome teacherId={currentTeacherId} userRole={currentUserRole} />} />

            {/* Courses routes */}
            <Route
              path="/courses"
              element={<TeacherCourses teacherId={currentTeacherId} userRole={currentUserRole} />}
            />
            <Route path="/courses/:courseId" element={<TeacherCourseDetail />} />

            {/* Board routes */}
            <Route path="/board/*" element={<TeacherBoard teacherId={currentTeacherId} userRole={currentUserRole} />} />

            {/* ✅ THÊM PROFILE CHO TEACHER */}
            <Route path="/profile" element={<ProfileUser />} />

            {/* Redirect empty path to home */}
            <Route path="" element={<Navigate to="/teacher" replace />} />

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/teacher" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default TeacherPage