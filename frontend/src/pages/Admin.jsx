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

// Services
import { fetchTeachers, fetchAccountants } from "../services/personService";

import "./Admin.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState("teacher"); // default chọn teacher
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAccountantForm, setShowAccountantForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [students, setStudents] = useState([]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Fetch dữ liệu teachers hoặc accountants khi activeTab hoặc selectedStatus thay đổi
  useEffect(() => {
    const fetchStaffData = async () => {
      if (activeTab !== "staffs") return;

      if (selectedStatus === "teacher") {
        try {
          const data = await fetchTeachers();
          setTeachers(data);
        } catch (err) {
          console.error("Failed to fetch teachers:", err);
          setTeachers([]);
        }
      } else if (selectedStatus === "accountant") {
        try {
          const data = await fetchAccountants();
          setAccountants(data);
        } catch (err) {
          console.error("Failed to fetch accountants:", err);
          setAccountants([]);
        }
      }
    };

    fetchStaffData();
  }, [activeTab, selectedStatus]);

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
      else alert("Please select a staff type to add");
    } else {
      alert("Thêm mới không xác định.");
    }
  };

  const handleFormSubmitSuccess = (type, newData, isEdit = false) => {
    console.log(`${type} data saved!`);
    if (type === "Teacher") {
      setShowTeacherForm(false);
      setEditingStaff(null);
      if (isEdit) {
        setTeachers(prev => prev.map(t => (t.ID === newData.ID ? newData : t)));
      } else {
        setTeachers(prev => [...prev, newData]);
      }
    }
    if (type === "Accountant") {
      setShowAccountantForm(false);
      setEditingStaff(null);
      if (isEdit) {
        setAccountants(prev => prev.map(a => (a.ID === newData.ID ? newData : a)));
      } else {
        setAccountants(prev => [...prev, newData]);
      }
    }
    if (type === "Class") setShowClassForm(false);
    if (type === "Student") {
      if (isEdit) {
        setStudents(prev => prev.map(s => (s.id === newData.id ? newData : s)));
      } else {
        setStudents(prev => [...prev, newData]);
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
        `Are you sure you want to delete ${staffType} ${staffMember.NAME} (ID: ${staffMember.ID})?`
      )
    ) {
      if (staffType === "teachers") {
        setTeachers(prev => prev.filter(t => t.ID !== staffMember.ID));
      } else if (staffType === "accountants") {
        setAccountants(prev => prev.filter(a => a.ID !== staffMember.ID));
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
      setStudents(prev => prev.filter(s => s.id !== student.id));
    }
  };

  return (
    <div className="admin-container">
      <Navbar role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="admin-body">
        <SidebarSearch
          role="admin"
          activeTab={activeTab}
          onSearch={item => setSelectedStatus(item)}
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
                    isEditMode={Boolean(editingStudent)}
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
              <>
                {showTeacherForm && (
                  <AddTeacherForm
                    isEditMode={Boolean(editingStaff)}
                    initialData={editingStaff}
                    onClose={() => {
                      setShowTeacherForm(false);
                      setEditingStaff(null);
                    }}
                    onSubmitSuccess={(data, isEdit) =>
                      handleFormSubmitSuccess("Teacher", data, isEdit)
                    }
                  />
                )}
                {showAccountantForm && (
                  <AddAccountantForm
                    isEditMode={Boolean(editingStaff)}
                    initialData={editingStaff}
                    onClose={() => {
                      setShowAccountantForm(false);
                      setEditingStaff(null);
                    }}
                    onSubmitSuccess={(data, isEdit) =>
                      handleFormSubmitSuccess("Accountant", data, isEdit)
                    }
                  />
                )}
                {!showTeacherForm && !showAccountantForm && (
                  <>
                    {selectedStatus === "teacher" && (
                      <StaffsTab
                        staffType="teachers"
                        data={teachers}
                        onEdit={staff => handleEditStaff(staff, "teachers")}
                        onDelete={staff => handleDeleteStaff(staff, "teachers")}
                      />
                    )}
                    {selectedStatus === "accountant" && (
                      <StaffsTab
                        staffType="accountants"
                        data={accountants}
                        onEdit={staff => handleEditStaff(staff, "accountants")}
                        onDelete={staff => handleDeleteStaff(staff, "accountants")}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;