import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header';
import SidebarSearch from "../components/layout/SidebarSearch";

import Table from '../components/common/Table/Table';

import ClassesTab from "../components/AdminPage/ClassesTab/ClassTab";
// Forms
import AddTeacherForm from "../components/AdminPage/StaffsTab/AddTeacherForm";
import AddAccountantForm from "../components/AdminPage/StaffsTab/AddAccountantForm";
import AddStudentForm from "../components/AdminPage/StudentsTab/AddStudentForm";

import "./Admin.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState(""); // Dùng cho sidebar
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAccountantForm, setShowAccountantForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [students, setStudents] = useState([
    { id: "S001", name: "Alice Nguyen", birthday: "12/01/2004", email: "alice@example.com", status: "Enrolled" },
    { id: "S002", name: "Bob Tran", birthday: "15/06/2003", email: "bob@example.com", status: "Unenroll" },
    { id: "S003", name: "Charlie Phan", birthday: "01/01/2005", email: "charlie@example.com", status: "Enrolled" },
  ]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null); 

  useEffect(() => {
    setTeachers([
      { id: "T001", name: "Dr. Smith", birthday: "01/02/1998", email: "smith@example.com", subject: "Math" },
      { id: "T002", name: "Ms. Jones", birthday: "02/02/1998", email: "jones@example.com", subject: "Science" },
    ]);
    setAccountants([
      { id: "A001", name: "Mr. Brown", birthday: "01/03/1998", email: "brown@example.com", department: "Finance" },
      { id: "A002", name: "Mrs. Davis", birthday: "02/03/1998", email: "davis@example.com", department: "Billing" },
    ]);
  }, []);

  useEffect(() => {
    setShowClassForm(false);
    setShowTeacherForm(false);
    setShowAccountantForm(false);
    setShowStudentForm(false);
    setEditingStudent(null);
    setEditingStaff(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'classes') {
      setSelectedStatus('waiting'); 
    } else if (activeTab === 'dashboard') {
      setSelectedStatus('calendar'); 
    } else if (activeTab === 'students') {
      setSelectedStatus('all'); 
    } else if (activeTab === 'staffs') {
      setSelectedStatus('teacher'); 
    }
  }, [activeTab]);

  const handleNew = () => {
    setShowClassForm(false);
    setShowTeacherForm(false);
    setShowAccountantForm(false);
    setShowStudentForm(false);
    setEditingStudent(null);
    setEditingStaff(null);

    if (activeTab === "classes") {
      setShowClassForm(true);
    } else if (activeTab === "students") {
      setShowStudentForm(true);
    } else if (activeTab === "staffs") {
      if (selectedStatus === "teacher") setShowTeacherForm(true);
      else if (selectedStatus === "accountant") setShowAccountantForm(true);
    } else {
      alert("Thêm mới không xác định.");
    }
  };

  const handleFormSubmitSuccess = (type, newData, isEdit = false) => {
    console.log(`${type} data saved!`);
    if (type === "Teacher") {
      if (isEdit) {
        setTeachers(prev => prev.map(t => t.id === newData.id ? newData : t));
      } else {
        setTeachers(prev => [...prev, newData]);
      }
      setShowTeacherForm(false);
      setEditingStaff(null);
    }
    if (type === "Accountant") {
      if (isEdit) {
        setAccountants(prev => prev.map(a => a.id === newData.id ? newData : a));
      } else {
        setAccountants(prev => [...prev, newData]);
      }
      setShowAccountantForm(false);
      setEditingStaff(null);
    }
    if (type === "Class") {
      setShowClassForm(false);
    }
    if (type === "Student") {
      if (isEdit) {
        setStudents((prev) => prev.map((s) => (s.id === newData.id ? newData : s)));
      } else {
        setStudents((prev) => [...prev, newData]);
      }
      setShowStudentForm(false);
      setEditingStudent(null);
    }
  };

  const handleEditStudent = useCallback((student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  }, []);

  const handleDeleteStudent = useCallback((student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học viên ${student.name} (ID: ${student.id})?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
     }
  }, []);

  const handleEditStaff = useCallback((staffMember, staffType) => {
    setEditingStaff(staffMember); // Lưu thông tin nhân viên đang chỉnh sửa
    if (staffType === "teachers") {
      setShowTeacherForm(true);
    } else if (staffType === "accountants") {
      setShowAccountantForm(true);
    }
  }, []);

  const handleDeleteStaff = useCallback((staffMember, staffType) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${staffType === 'teachers' ? 'giáo viên' : 'kế toán'} ${staffMember.name} (ID: ${staffMember.id})?`)) {
      if (staffType === "teachers") {
        setTeachers((prev) => prev.filter((t) => t.id !== staffMember.id));
      } else if (staffType === "accountants") {
        setAccountants((prev) => prev.filter((a) => a.id !== staffMember.id));
      }
    }
  }, []);

  const studentColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Họ và Tên', accessor: 'name' },
    { header: 'Ngày sinh', accessor: 'birthday' },
    { header: 'Email', accessor: 'email' },
    { header: 'Trạng thái', accessor: 'status' },
    {
      header: 'Hành động',
      render: (row) => (
        <div className="action-buttons">
        <button onClick={() => handleEditStudent(row)}>Sửa</button>
        <button onClick={() => handleDeleteStudent(row)}>Xóa</button>
        </div>
      ),
    },
  ];

  const teacherColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Họ và Tên', accessor: 'name' },
    { header: 'Ngày sinh', accessor: 'birthday' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Hành động',
      render: (row) => (
        <div className="action-buttons">
        <button onClick={() => handleEditStaff(row, 'teachers')}>Sửa</button>
        <button onClick={() => handleDeleteStaff(row, 'teachers')}>Xóa</button>
        </div>
      ),
    },
  ];

  const accountantColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Họ và Tên', accessor: 'name' },
    { header: 'Ngày sinh', accessor: 'birthday' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Hành động',
      render: (row) => (
      <div className="action-buttons">
      <button onClick={() => handleEditStaff(row, 'accountants')}>Sửa</button>
      <button onClick={() => handleDeleteStaff(row, 'accountants')}>Xóa</button>
      </div>
      ),
    },
  ];

  const filteredStudents = selectedStatus === "all"
    ? students
    : students.filter(student => student.status.toLowerCase() === selectedStatus);

  return (
    <div className="admin-container">
      <Header
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
            {!showStudentForm && (
              <Table
                columns={studentColumns}
                data={filteredStudents}
              />
                )}
              </>
            )}

            {activeTab === "staffs" && (
              <div>
                {showTeacherForm && (
                  <AddTeacherForm
                    initialData={editingStaff} // Truyền dữ liệu để chỉnh sửa
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
                    initialData={editingStaff} // Truyền dữ liệu để chỉnh sửa
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
                      <Table
                        columns={teacherColumns}
                        data={teachers} // Có thể thêm logic lọc nếu cần
                      />
                    )}
                    {selectedStatus === "accountant" && (
                      <Table
                        columns={accountantColumns}
                        data={accountants} // Có thể thêm logic lọc nếu cần
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