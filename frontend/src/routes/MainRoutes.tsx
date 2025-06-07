import "@/App.scss";
import { useSystemContext } from "@/hooks/useSystemContext";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Layout from "@/layouts/Layout/Layout";
import { routePath } from "@/layouts/Navbar/Navbar";
import PageNotFound from "@/layouts/PageNotFound";
import Login from "@/pages/Login/Login";

import CoursesList from "@/pages/Admin/Courses/CoursesList";
import StudentsList from "@/pages/Admin/Students/StudentsList";
import TeachersList from "@/pages/Admin/Teachers/TeachersList";
import AccountantList from "@/pages/Admin/Accountant/AccountantsList";



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
          <Route path="/admin/courses" element={<CoursesList />}/>
          <Route path="/admin/students" element={<StudentsList />}/>
          <Route path="/admin/teachers" element={<TeachersList />}/>
          <Route path="/admin/accountants" element={<AccountantList />} />

          {/* <Route path="/accountant/" element={<Accountant />}/> */}

          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}
