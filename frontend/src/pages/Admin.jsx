import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SidebarSearch from "../components/SidebarSearch";

// Tabs
import ClassesTab from "../components/AdminPage/ClassesTab/ClassTab";
import StaffsTab from "../components/AdminPage/StaffsTab/StaffsTab";
import StudentTab from "../components/AdminPage/StudentsTab/StudentTab";

// Forms
import AddTeacherForm from "../components/AdminPage/StaffsTab/AddTeacherForm";
import AddAccountantForm from "../components/AdminPage/StaffsTab/AddAccountantForm";
import AddStudentForm from "../components/AdminPage/StudentsTab/AddStudentForm";

import "./Admin.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAccountantForm, setShowAccountantForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Khởi tạo dữ liệu teachers, accountants tĩnh
  useEffect(() => {
    setTeachers([
      {
        id: "T001",
        name: "Dr. Smith",
        birthday: "01/02/1998",
        email: "smith@example.com",
        subject: "Math",
      },
      {
        id: "T002",
        name: "Ms. Jones",
        birthday: "02/02/1998",
        email: "jones@example.com",
        subject: "Science",
      },
    ]);
    setAccountants([
      {
        id: "A001",
        name: "Mr. Brown",
        birthday: "01/03/1998",
        email: "brown@example.com",
        department: "Finance",
      },
      {
        id: "A002",
        name: "Mrs. Davis",
        birthday: "02/03/1998",
        email: "davis@example.com",
        department: "Billing",
      },
    ]);
  }, []);

  useEffect(() => {
    if (activeTab !== "classes") setShowClassForm(false);
    if (activeTab !== "staffs") {
      setShowTeacherForm(false);
      setShowAccountantForm(false);
    }
    if (activeTab !== "students") {
      setShowStudentForm(false);
      setEditingStudent(null);
    }
  }, [activeTab]);

  const handleNew = () => {
    setShowClassForm(false);
    setShowTeacherForm(false);
    setShowAccountantForm(false);
    setShowStudentForm(false);
    setEditingStudent(null);
    setEditingStaff(null);

    if (activeTab === "classes") setShowClassForm(true);
    else if (activeTab === "students") setShowStudentForm(true);
    else if (activeTab === "staffs") {
      if (selectedStatus === "teacher") setShowTeacherForm(true);
      else if (selectedStatus === "accountant") setShowAccountantForm(true);
    } else {
      alert("Thêm mới không xác định.");
    }
  };

  // Những hàm xử lý edit/delete ở đây (nếu bạn muốn truyền xuống studentTab)
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleDeleteStudent = (student) => {
    // Bạn có thể xử lý xóa hoặc để StudentTab tự xử lý
    // Ở đây mình chỉ tạm xóa local thôi, hoặc gọi API ở StudentTab
    // Nếu muốn xóa thật, bạn cần cập nhật state hoặc gọi API ở StudentTab
  };

  return (
    <div className="admin-container">
      <Navbar
        role="admin"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="admin-body">
        <SidebarSearch
          role="admin"
          activeTab={activeTab}
          onSearch={(item) => setSelectedStatus(item)}
          onNew={handleNew}
        />

        <div className="content">
          <div className="admin-display-area">
            {activeTab === "classes" && (
              <ClassesTab
                selectedStatus={selectedStatus}
                showClassForm={showClassForm}
                setShowClassForm={setShowClassForm}
              />
            )}

            {activeTab === "students" && (
              <>
                {!showStudentForm && (
                  <StudentTab
                    selectedStatus={selectedStatus}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                )}
                {showStudentForm && (
                  <AddStudentForm
                    initialData={editingStudent}
                    onClose={() => {
                      setShowStudentForm(false);
                      setEditingStudent(null);
                    }}
                    onSubmitSuccess={(data, isEdit) => {
                      setShowStudentForm(false);
                      setEditingStudent(null);
                      // Nếu bạn muốn reload lại StudentTab có thể dùng callback hoặc quản lý qua state khác
                    }}
                  />
                )}
              </>
            )}

            {activeTab === "staffs" && (
              <div>
                {/* staff forms and lists */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;