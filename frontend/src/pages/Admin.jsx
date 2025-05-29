import React, { useState, useEffect } from "react";
import Header from '../components/layout/Header';
import SidebarSearch from "../components/layout/SidebarSearch";

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
  const [students, setStudents] = useState([
    {
      id: "S001",
      name: "Alice Nguyen",
      birthday: "12/01/2004",
      email: "alice@example.com",
      status: "Enrolled",
    },
    {
      id: "S002",
      name: "Bob Tran",
      birthday: "15/06/2003",
      email: "bob@example.com",
      status: "Unenroll",
    },
  ]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);


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

  const handleFormSubmitSuccess = (type, newData, isEdit = false) => {
    console.log(`${type} data saved!`);
    if (type === "Teacher") {
      setShowTeacherForm(false);
      setEditingStaff(null);
      // Bạn có thể cập nhật danh sách teachers tại đây nếu cần
    }
    if (type === "Accountant") {
      setShowAccountantForm(false);
      setEditingStaff(null);
      // Bạn có thể cập nhật danh sách accountants tại đây nếu cần
    }
    if (type === "Class") setShowClassForm(false);
    if (type === "Student") {
      if (isEdit) {
        // Cập nhật student đã sửa
        setStudents((prev) =>
          prev.map((s) => (s.id === newData.id ? newData : s))
        );
      } else {
        // Thêm mới student
        setStudents((prev) => [...prev, newData]);
      }
      setShowStudentForm(false);
      setEditingStudent(null);
    }
  };

  const handleEditStaff = (staffMember, staffType) => {
    setEditingStaff({ ...staffMember, staffType });
    if (staffType === "teachers") setShowTeacherForm(true);
    else if (staffType === "accountants") setShowAccountantForm(true);
  };

  const handleDeleteStaff = (staffMember, staffType) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${staffType} ${staffMember.name} (ID: ${staffMember.id})?`
      )
    ) {
      if (staffType === "teachers") {
        setTeachers((prev) => prev.filter((t) => t.id !== staffMember.id));
      } else if (staffType === "accountants") {
        setAccountants((prev) => prev.filter((a) => a.id !== staffMember.id));
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleDeleteStudent = (student) => {
    if (
      window.confirm(
        `Are you sure you want to delete Student ${student.name} (ID: ${student.id})?`
      )
    ) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    }
  };

  return (
    <div className="admin-container">
      <Header
        role="admin" // hoặc "student", "teacher"
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
                    students={students}
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
                    onSubmitSuccess={(data, isEdit) =>
                      handleFormSubmitSuccess("Student", data, isEdit)
                    }
                  />
                )}
              </>
            )}

            {activeTab === "staffs" && (
              <div>
                {/* Hiển thị form thêm giáo viên nếu showTeacherForm là true */}
                {showTeacherForm && (
                  <AddTeacherForm
                    onClose={() => setShowTeacherForm(false)}
                    onSubmitSuccess={() => handleFormSubmitSuccess("Teacher")}
                  />
                )}

                {/* Hiển thị form thêm kế toán nếu showAccountantForm là true */}
                {showAccountantForm && (
                  <AddAccountantForm
                    onClose={() => setShowAccountantForm(false)}
                    onSubmitSuccess={() => handleFormSubmitSuccess("Accountant")}
                  />
                )}

                {!showTeacherForm && !showAccountantForm && (
                  <>
                    {selectedStatus === "teacher" && (
                      <StaffsTab
                        staffType="teachers"
                        data={teachers}
                        onEdit={(staff) => handleEditStaff(staff, "teachers")}
                        onDelete={(staff) => handleDeleteStaff(staff, "teachers")}
                      />
                    )}
                    {selectedStatus === "accountant" && (
                      <StaffsTab
                        staffType="accountants"
                        data={accountants}
                        onEdit={(staff) => handleEditStaff(staff, "accountants")}
                        onDelete={(staff) => handleDeleteStaff(staff, "accountants")}
                      />
                    )}
                  </>
                )}
              </div>
            )}  
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;