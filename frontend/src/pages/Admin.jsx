import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';
import AddClassForm from '../components/AddClassForm'; // bạn cần tạo file này
import './Admin.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(['']);
  const [showClassForm, setShowClassForm] = useState(false);

  const adminLinks = [
    { key: 'classes', name: 'Classes' },
    { key: 'students', name: 'Students' },
    { key: 'staffs', name: 'Staffs' },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleNew = () => {
    if (activeTab === 'classes') {
      setShowClassForm(true);
    } else {
      alert('Thêm mới');
    }
  };

  const handleStaffManagementClick = (staffType) => {
    setActiveTab(staffType);
  };

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          activeTab={activeTab}
          items={filteredItems}
          onSearch={handleSearch}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'home' && <div className="dashboard"></div>}

          {activeTab === 'classes' && (
            <div className="class-management-page">
              {showClassForm ? (
                <AddClassForm onClose={() => setShowClassForm(false)} />
              ) : (
                <p>Chọn lớp hoặc bấm "Add" để tạo lớp mới.</p>
              )}
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="staff-management-page">
              <h2>Staff Management</h2>
              <div className="staff-options">
                <button onClick={() => handleStaffManagementClick('admins')}>Admin</button>
                <button onClick={() => handleStaffManagementClick('teachers')}>Teacher</button>
                <button onClick={() => handleStaffManagementClick('accountants')}>Accountant</button>
              </div>
            </div>
          )}

          {activeTab === 'admins' && <h2>Admin Management</h2>}
          {activeTab === 'teachers' && <h2>Teacher Management</h2>}
          {activeTab === 'accountants' && <h2>Accountant Management</h2>}
          {activeTab === 'pointReport' && <h2>Point Report</h2>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
