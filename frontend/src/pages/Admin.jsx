import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';
import ClassesTab from '../components/AdminPage/ClassesTab';
import StudentListFull from '../components/AdminPage/StudentListFull';
import StudentListBasic from '../components/AdminPage/StudentListBasic';
import './Admin.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showClassForm, setShowClassForm] = useState(false);

  {/* Lấy dữ liệu từ API: phần mockStudents có thể thay bằng state từ useEffect + fetch */}
  const mockStudents = [
    {
      id: 'S001',
      name: 'Alice Nguyen',
      email: 'alice@example.com',
      password: 'password123',
      status: 'Enrolled',
    },
    {
      id: 'S002',
      name: 'Bob Tran',
      email: 'bob@example.com',
      password: 'abc123',
      status: 'Unenroll',
    },
  ];

  const adminLinks = [
    { key: 'classes', name: 'Classes' },
    { key: 'students', name: 'Students' },
    { key: 'staffs', name: 'Staffs' },
  ];

  const handleNew = () => {
    if (activeTab === 'classes') {
      setShowClassForm(true);
    } else {
      alert('Thêm mới');
    }
  };

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
          onSearch={(item) => setSelectedStatus(item)} // << ĐỔI thành setSelectedStatus
          onNew={handleNew} // << DÙNG HÀM ĐÃ VIẾT
        />

        <div className="content">
          {activeTab === 'classes' && (
            <ClassesTab
              selectedStatus={selectedStatus}
              showClassForm={showClassForm}
              setShowClassForm={setShowClassForm}
            />
          )}

          {/* TAB STUDENTS */}
          {activeTab === 'students' && (
            <>
              {selectedStatus === 'View All' && (
                <StudentListFull students={mockStudents} />
              )}

              {(selectedStatus === 'Enrolled' || selectedStatus === 'Unenroll') && (
                <StudentListBasic
                  students={mockStudents.filter(
                    (student) => student.status === selectedStatus
                  )}
                />
              )}
            </>
          )}

          {/* TAB STAFF */}
          {activeTab === 'staff' && (
            <div className="staff-management-page">
              <h2>Staff Management</h2>
              <div className="staff-options">
                <button onClick={() => handleStaffManagementClick('teachers')}>Teacher</button>
                <button onClick={() => handleStaffManagementClick('accountants')}>Accountant</button>
              </div>
            </div>
          )}

          {/* CÁC PHÂN MỤC CON */}
          {activeTab === 'admins' && <h2>Admin Management</h2>}
          {activeTab === 'teachers' && <h2>Teacher Management</h2>}
          {activeTab === 'accountants' && <h2>Accountant Management</h2>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
