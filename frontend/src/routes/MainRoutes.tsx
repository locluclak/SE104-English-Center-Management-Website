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
  const { isLoggedIn } = useSystemContext(); // userRole đã được bỏ ở đây
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      const needAuth = ["/admin", "/accountant", "/student", "/teacher"]
        .some(path => location.pathname.startsWith(path));
  
      if (needAuth && location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
      return;
    }
  
    const publicPages = ["/login", "/register", "/"];
    if (!publicPages.includes(location.pathname)) return;
  
    const role = localStorage.getItem("role");
    
    const roleMap: Record<string, string> = {
      ADMIN: "/admin/courses",
      ACCOUNTANT: "/accountant/dashboard",
      TEACHER: "/teacher/home",
      STUDENT: "/student/home",
    };
  
    const target = role ? roleMap[role] : "/";
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [isLoggedIn, location.pathname]);
  


  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />

      <Route
        path="/"
        element={
          <Layout />
        }
      >
        <Route path="admin/courses" element={<CoursesList />} />
        <Route path="admin/students" element={<StudentsList />} />
        <Route path="admin/teachers" element={<TeachersList />} />
        <Route path="admin/accountants" element={<AccountantList />} />

        <Route path="accountant/dashboard" element={<DashboardCharts />} />
        <Route path="accountant/studentfees" element={<StudentFeeList />} />
        <Route path="accountant/reports" element={<Reports />} />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route path="*" element={<StudentPage />} />
      </Route>

      <Route path="/teacher" element={<TeacherLayout />}>
        <Route path="*" element={<TeacherPage />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}
