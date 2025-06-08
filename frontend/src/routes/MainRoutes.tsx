"use client"

import "@/App.scss"
import { useSystemContext } from "@/hooks/useSystemContext"
import { useEffect } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"

import Layout from "@/layouts/Layout/Layout"
import StudentLayout from "@/layouts/StudentLayout/StudentLayout"
import { routePath } from "@/layouts/Navbar/Navbar"
import PageNotFound from "@/layouts/PageNotFound"

import CoursesList from "@/pages/Admin/Courses/CoursesList"
import StudentsList from "@/pages/Admin/Students/StudentsList"
import TeachersList from "@/pages/Admin/Teachers/TeachersList"
import AccountantList from "@/pages/Admin/Accountants/AccountantsList"

import DashboardCharts from "@/pages/Accountant/Dashboard/DashboardCharts"
import Reports from "@/pages/Accountant/Reports/Report"
import StudentFeeList from "@/pages/Accountant/Students/StudentFeesList"

import StudentPage from "@/pages/Student/StudentPage"

export default function MainRoutes() {
  // const navigate = useNavigate()
  const context = useSystemContext()
  const { isLoggedIn } = context
  const location = useLocation()

  const flattenRoutes = routePath.reduce((acc: any[], item: any) => {
    if (item.children) {
      return [...acc, ...item.children.map((child: any) => ({ ...child, link: `${item.link}/${child.link}` }))]
    }
    return [...acc, item]
  }, [])

  const currentPath = location.pathname
  const findPath = flattenRoutes.find((item: any) => currentPath.includes(item.link))
  const isRole = findPath?.roles?.includes(localStorage.getItem("role"))

  // Log current path for debugging
  console.log("MainRoutes - Current path:", currentPath)

  useEffect(() => {
    // if (!isLoggedIn) {
    //   navigate("/login");
    // } else if (!isRole) {
    //   //message.error("Bạn không có quyền truy cập trang này.");
    //   navigate("/home");
    // }
  }, [isLoggedIn, isRole])

  return (
    <>
      <Routes>
        {/* <Route path="/login" element={<Login />}/> */}

        {/* Main Layout for Admin and Accountant */}
        <Route path="/" element={<Layout />}>
          {/* Admin Routes */}
          <Route path="/admin/courses" element={<CoursesList />} />
          <Route path="/admin/students" element={<StudentsList />} />
          <Route path="/admin/teachers" element={<TeachersList />} />
          <Route path="/admin/accountants" element={<AccountantList />} />

          {/* Accountant Routes */}
          <Route path="/accountant/dashboard" element={<DashboardCharts />} />
          <Route path="/accountant/studentfees" element={<StudentFeeList />} />
          <Route path="/accountant/reports" element={<Reports />} />

          <Route path="*" element={<PageNotFound />} />
        </Route>

        {/* Student Layout - Separate from main layout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="*" element={<StudentPage />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  )
}
