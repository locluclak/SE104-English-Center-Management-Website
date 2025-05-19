import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';

// Tabs
import ClassesTab from '../components/AdminPage/ClassesTab/ClassTab';
import StaffsTab from '../components/AdminPage/StaffsTab/StaffsTab';
import StudentTab from '../components/AdminPage/StudentsTab/StudentTab';

// Forms
import AddClassForm from '../components/AdminPage/ClassesTab/AddClassForm';
import AddTeacherForm from '../components/AdminPage/StaffsTab/AddTeacherForm';
import AddAccountantForm from '../components/AdminPage/StaffsTab/AddAccountantForm';

import './Admin.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAccountantForm, setShowAccountantForm] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);

  const mockStudents = [
    { id: 'S001', name: 'Alice Nguyen', email: 'alice@example.com', status: 'Enrolled' },
    { id: 'S002', name: 'Bob Tran', email: 'bob@example.com', status: 'Unenroll' },
  ];

  const adminLinks = [
    { key: 'classes', name: 'Classes' },
    { key: 'students', name: 'Students' },
    { key: 'staffs', name: 'Staffs' },
  ];

  useEffect(() => {
    setTeachers([
      { id: 'T001', name: 'Dr. Smith', email: 'smith@example.com', specialization: 'Physics' },
      { id: 'T002', name: 'Ms. Jones', email: 'jones@example.com', specialization: 'Literature' },
    ]);
    setAccountants([
      { id: 'A001', name: 'Mr. Brown', email: 'brown@example.com', department: 'Payroll' },
      { id: 'A002', name: 'Mrs. Davis', email: 'davis@example.com', department: 'Receivables' },
    ]);
  }, []);

  useEffect(() => {
    if (activeTab !== 'classes') setShowClassForm(false);
    if (activeTab !== 'staffs') {
      setShowTeacherForm(false);
      setShowAccountantForm(false);
    }
  }, [activeTab]);

  const handleNew = () => {
    setShowClassForm(false);
    setShowTeacherForm(false);
    setShowAccountantForm(false);

    if (activeTab === 'classes') setShowClassForm(true);
    else if (activeTab === 'students') alert('Thêm mới Student (form chưa triển khai)');
    else if (activeTab === 'staffs') {
      if (selectedStatus === 'Teacher') setShowTeacherForm(true);
      else if (selectedStatus === 'Accountant') setShowAccountantForm(true);    
    } else {
      alert('Thêm mới không xác định.');
    }
  };

  const handleFormSubmitSuccess = (type) => {
    console.log(`${type} data saved!`);
    if (type === 'Teacher') setShowTeacherForm(false);
    if (type === 'Accountant') setShowAccountantForm(false);
    if (type === 'Class') setShowClassForm(false);
  };

  const handleEditStaff = (id, staffType) => alert(`Edit ${staffType} ID: ${id}`);
  const handleDeleteStaff = (id, staffType) => alert(`Delete ${staffType} ID: ${id}`);

  return (
    <div className="admin-container">
      <Navbar
        role="admin"
        links={adminLinks}
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
          {activeTab === 'classes' && (
            <ClassesTab
              selectedStatus={selectedStatus}
              showClassForm={showClassForm}
              setShowClassForm={setShowClassForm}
            />
          )}

          {activeTab === 'students' && (
            <StudentTab students={mockStudents} selectedStatus={selectedStatus} />
          )}

          {activeTab === 'staffs' && (
            <div>
              {selectedStatus === 'Teacher' && !showTeacherForm && (
                <StaffsTab
                  staffType="teachers"
                  data={teachers}
                  onEdit={handleEditStaff}
                  onDelete={handleDeleteStaff}
                />
              )}
              {selectedStatus === 'Teacher' && showTeacherForm && (
                <AddTeacherForm
                  onClose={() => setShowTeacherForm(false)}
                  onSubmitSuccess={() => handleFormSubmitSuccess('Teacher')}
                />
              )}

              {selectedStatus === 'Accountant' && !showAccountantForm && (
                <StaffsTab
                  staffType="accountants"
                  data={accountants}
                  onEdit={handleEditStaff}
                  onDelete={handleDeleteStaff}
                />
              )}
              {selectedStatus === 'Accountant' && showAccountantForm && (
                <AddAccountantForm
                  onClose={() => setShowAccountantForm(false)}
                  onSubmitSuccess={() => handleFormSubmitSuccess('Accountant')}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
