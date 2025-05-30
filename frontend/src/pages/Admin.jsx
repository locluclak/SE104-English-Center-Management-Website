import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header';
import SidebarSearch from "../components/layout/SidebarSearch";
import Table from '../components/common/Table/Table';
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";

import ClassesTab from "../components/AdminPage/ClassesTab/ClassTab";
import DynamicForm from "../components/common/Form/DynamicForm";
import formConfigs from "../config/formConfig";

import "./Admin.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [students, setStudents] = useState([
    { id: "S001", name: "Alice Nguyen", birthday: "12/01/2004", email: "alice@example.com", status: "Enrolled" },
    { id: "S002", name: "Bob Tran", birthday: "15/06/2003", email: "bob@example.com", status: "Unenroll" },
    { id: "S003", name: "Charlie Phan", birthday: "01/01/2005", email: "charlie@example.com", status: "Enrolled" },
  ]);

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
    setShowForm(false);
    setEditingData(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'classes') setSelectedStatus('waiting');
    else if (activeTab === 'dashboard') setSelectedStatus('calendar');
    else if (activeTab === 'students') setSelectedStatus('all');
    else if (activeTab === 'staffs') setSelectedStatus('teacher');
  }, [activeTab]);

  const handleStatusSelect = useCallback((featureKey) => {
    setSelectedStatus(featureKey);
  }, []);

  const handleNew = () => {
    setShowForm(true);
    setEditingData(null);
  };

  const getCurrentFormConfig = useCallback(() => {
    if (activeTab === 'staffs') {
      if (selectedStatus === 'teacher') {
        return formConfigs.staffs_teacher;
      } else if (selectedStatus === 'accountant') {
        return formConfigs.staffs_accountant;
      }
      return null;
    }
    return formConfigs[activeTab];
  }, [activeTab, selectedStatus]);

  const handleFormSubmitSuccess = (data, isEdit = false) => {
    const currentFormConfig = getCurrentFormConfig();
    const type = formConfig[activeTab]?.type;
    if (!type) {
      console.warn("Could not determine type for form submission.");
      return;
    }

    if (type === 'Student') {
      if (isEdit) setStudents(prev => prev.map(s => s.id === data.id ? data : s));
      else setStudents(prev => [...prev, data]);
    } else if (type === 'Teacher') {
      if (isEdit) setTeachers(prev => prev.map(t => t.id === data.id ? data : t));
      else setTeachers(prev => [...prev, data]);
    } else if (type === 'Accountant') {
      if (isEdit) setAccountants(prev => prev.map(a => a.id === data.id ? data : a));
      else setAccountants(prev => [...prev, data]);
    }

    setShowForm(false);
    setEditingData(null);
  };

  const handleEdit = useCallback((data, type) => {
    setEditingData(data);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((item, type) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${item.name} (ID: ${item.id})?`)) return;

    if (type === 'Student') setStudents(prev => prev.filter(s => s.id !== item.id));
    else if (type === 'Teacher') setTeachers(prev => prev.filter(t => t.id !== item.id));
    else if (type === 'Accountant') setAccountants(prev => prev.filter(a => a.id !== item.id));
  }, []);

  const filteredStudents = selectedStatus === "all"
    ? students
    : students.filter(student => student.status.toLowerCase() === selectedStatus);

  return (
    <div className="admin-container">
      <Header role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="admin-body">
        <SidebarSearch
          role="admin"
          activeTab={activeTab}
          onSearch={handleStatusSelect}
          onNew={handleNew}
        />

        <div className="content">
          <div className="admin-display-area">
            {showForm && (
              <DynamicForm
                formConfig={getCurrentFormConfig()}
                initialData={editingData}
                onClose={() => setShowForm(false)}
                onSubmitSuccess={handleFormSubmitSuccess}
              />
            )}

            {!showForm && activeTab === "classes" && (
              <ClassesTab selectedStatus={selectedStatus} />
            )}

            {!showForm && activeTab === "students" && (
              <Table
                columns={getStudentTableColumns(
                  (row) => handleEdit(row, 'Student'),
                  (row) => handleDelete(row, 'Student')
                )}
                data={filteredStudents}
              />
            )}

            {!showForm && activeTab === "staffs" && (
              <>
                {selectedStatus === "teacher" && (
                  <Table
                    columns={getTeacherTableColumns(
                      (row) => handleEdit(row, 'Teacher'),
                      (row) => handleDelete(row, 'Teacher')
                    )}
                    data={teachers}
                  />
                )}
                {selectedStatus === "accountant" && (
                  <Table
                    columns={getAccountantTableColumns(
                      (row) => handleEdit(row, 'Accountant')
                    )}
                    data={accountants}
                  />
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
