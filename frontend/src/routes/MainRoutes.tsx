import "@/App.scss"
import { useSystemContext } from "@/hooks/useSystemContext"
import { useEffect } from "react"
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom"

import Layout from "@/layouts/Layout/Layout"
import StudentLayout from "@/layouts/StudentLayout/StudentLayout"
import TeacherLayout from "@/layouts/TeacherLayout/TeacherLayout"
import PageNotFound from "@/layouts/PageNotFound"

import CoursesList from "@/pages/Admin/Courses/CoursesList"
import StudentsList from "@/pages/Admin/Students/StudentsList"
import TeachersList from "@/pages/Admin/Teachers/TeachersList"
import AccountantList from "@/pages/Admin/Accountants/AccountantsList"

import DashboardCharts from "@/pages/Accountant/Dashboard/DashboardCharts"
import Reports from "@/pages/Accountant/Reports/Report"
import StudentFeeList from "@/pages/Accountant/Students/StudentFeesList"

import StudentPage from "@/pages/Student/StudentPage"
import TeacherPage from "@/pages/Teacher/TeacherPage"

import Home from "@/pages/Home/Home"
import Login from "@/pages/Login/Login"
import Register from "@/pages/Register/Register"

export default function MainRoutes() {
  const { isLoggedIn } = useSystemContext()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) {
      const publicPages = ["/login", "/register", "/"]
      if (publicPages.includes(location.pathname)) {
        const role = localStorage.getItem("role")
        switch (role) {
          case "ADMIN":
            navigate("/admin/courses")
            break
          case "ACCOUNTANT":
            navigate("/accountant/dashboard")
            break
          case "TEACHER":
            navigate("/teacher")
            break
          case "STUDENT":
            navigate("/student")
            break
          default:
            navigate("/")
        }
      }
    }
  }, [isLoggedIn, location.pathname])

  return (
    <Routes>
      {/* Redirect root sang login luôn */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Optional: giữ Home nếu cần */}
      <Route path="/home" element={<Home />} />

      {/* Admin & Accountant routes */}
      <Route path="/" element={<Layout />}>
        {/* Admin */}
        <Route path="admin/courses" element={<CoursesList />} />
        <Route path="admin/students" element={<StudentsList />} />
        <Route path="admin/teachers" element={<TeachersList />} />
        <Route path="admin/accountants" element={<AccountantList />} />

        {/* Accountant */}
        <Route path="accountant/dashboard" element={<DashboardCharts />} />
        <Route path="accountant/studentfees" element={<StudentFeeList />} />
        <Route path="accountant/reports" element={<Reports />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<StudentLayout />}>
        <Route path="*" element={<StudentPage />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route path="*" element={<TeacherPage />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}
