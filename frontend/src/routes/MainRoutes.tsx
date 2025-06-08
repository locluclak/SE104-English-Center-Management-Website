import "@/App.scss";
import { useSystemContext } from "@/hooks/useSystemContext";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Layout from "@/layouts/Layout/Layout";
import { routePath } from "@/layouts/Navbar/Navbar";
import PageNotFound from "@/layouts/PageNotFound";
import Login from "@/pages/Login/Login";

import CoursesList from "@/pages/admin/Courses/CoursesList";
import StudentsList from "@/pages/admin/Students/StudentsList";
import TeachersList from "@/pages/admin/Teachers/TeachersList";
import AccountantList from "@/pages/admin/Accountants/AccountantsList";
import DashboardCharts from "@/pages/Accountant/Dashboard/DashboardCharts";
import Reports from "@/pages/Accountant/Reports/Report";
import StudentFeeList from "@/pages/Accountant/Students/StudentFeesList";



export default function MainRoutes() {
  const navigate = useNavigate();
  const context = useSystemContext();
  const { isLoggedIn } = context;

  const flattenRoutes = routePath.reduce((acc: any[], item: any) => {
    if (item.children) {
      return [...acc, ...item.children.map((child: any) => ({ ...child, link: `${item.link}/${child.link}` }))];
    }
    return [...acc, item];
  }, []);

  const currentPath = useLocation().pathname;
  const findPath = flattenRoutes.find((item: any) => currentPath.includes(item.link));
  const isRole = findPath?.roles?.includes(localStorage.getItem("role"));

  useEffect(() => {
    // if (!isLoggedIn) {
    //   navigate("/login");
    // } else if (!isRole) {
    //   //message.error("Bạn không có quyền truy cập trang này.");
    //   navigate("/home");
    // }
  }, [isLoggedIn, isRole]);

  return (
    <>
      <Routes>
        {/* <Route path="/login" element={<Login />}/> */}
        <Route path="/" element={<Layout />}>
          <Route path="/admin/courses" element={<CoursesList />} />
          <Route path="/admin/students" element={<StudentsList />} />
          <Route path="/admin/teachers" element={<TeachersList />} />
          <Route path="/admin/accountants" element={<AccountantList />} />

          <Route path="/accountant/dashboard" element={<DashboardCharts />} />
          <Route path="/accountant/studentfees" element={<StudentFeeList />} />
          <Route path="/accountant/reports" element={<Reports />} />

          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}
